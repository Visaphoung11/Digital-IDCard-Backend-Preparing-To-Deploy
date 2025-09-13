import { AppDataSource } from '@/config/data-source';
import { IdCard } from '@/entities/id-card';
import { SocialLink } from '@/entities/social-link';
import { User } from '@/entities/user';
import { paginate } from '@/util';
import { Request, Response } from 'express';
import { Not } from 'typeorm';

/**
 *
 * - path /api/v1/card/crate-card - Create Card
 * - method: CREATE
 * - roles: [USER]
 */
export const createCardService = async (req: Request, res: Response) => {
  const cardRepo = AppDataSource.getRepository(IdCard);
  const socialLinkRepo = AppDataSource.getRepository(SocialLink);
  const userId = req.user?.user_id;
  const cardByUser = await cardRepo.find({
    where: { user: { id: userId }, is_deleted: false },
  });

  const {
    // id card
    gender,
    company,
    dob,
    address,
    phone,
    nationality,
    card_type,
    web_site,
    bio,
    job,
    // social link
    social = [],
  } = req.body;

  if (cardByUser.length >= 3) {
    res.status(400).json({
      message: 'You can only create 3 cards',
    });
  }

  // Check for duplicate card type
  const hasSameCardType = cardByUser.some(
    (card) => card.card_type === card_type,
  );
  if (hasSameCardType) {
    return res.status(400).json({
      message: `You already have a card of type "${card_type}".`,
    });
  }

  const card = cardRepo.create({
    user: { id: userId },
    gender,
    dob,
    company,
    address,
    phone,
    card_type,
    web_site,
    job,
    bio,
    nationality,
  });
  const newCard = await cardRepo.save(card);

  // Create and save all social links
  const socialLinks = social.map((item: any) =>
    socialLinkRepo.create({
      card: { id: newCard.id },
      platform: item.platform,
      icon: item.icon,
      url: item.url,
    }),
  );

  await socialLinkRepo.save(socialLinks);
  return {
    message: 'create card successfully',
    card: newCard,
    socialLinks: socialLinks,
  };
};

/**
 *
 * - path /api/v1/card/update-card - Create Card
 * - method: PUT
 * - roles: [USER]
 */
export const updateCardService = async (req: Request, res: Response) => {
  const cardId = req.params.id;
  const userId = req.user?.user_id;

  const {
    gender,
    dob,
    address,
    phone,
    nationality,
    bio,
    web_site,
    job,
    company,
    card_type,
    social = [],
  } = req.body;

  const cardRepo = AppDataSource.getRepository(IdCard);
  const socialLinkRepo = AppDataSource.getRepository(SocialLink);

  const card = await cardRepo.findOne({
    where: { id: cardId, user: { id: userId } },
    relations: ['socialLinks'],
  });

  if (!card) {
    return res.status(404).json({ message: 'Card not found' });
  }

  // ❗ Prevent changing to a card_type that already exists in another card
  if (card_type && card_type !== card.card_type) {
    const otherCardWithSameType = await cardRepo.findOne({
      where: {
        user: { id: userId },
        card_type,
        is_deleted: false,
        id: Not(cardId),
      },
    });

    if (otherCardWithSameType) {
      return res.status(400).json({
        message: `You already have another card of type "${card_type}".`,
      });
    }

    card.card_type = card_type;
  }

  // Update card basic info
  card.gender = gender;
  card.company = company;
  card.dob = dob;
  card.address = address;
  card.phone = phone;
  card.nationality = nationality;
  card.web_site = web_site;
  card.job = job;
  card.bio = bio;
  await cardRepo.save(card);

  const incomingIds = social.filter((s: any) => s.id).map((s: any) => s.id);

  // ❌ Soft-delete any existing social links not in req.body
  const linksToDelete = card.socialLinks?.filter(
    (link) => !incomingIds.includes(link.id) && !link.is_deleted,
  ) as any;

  await Promise.all(
    linksToDelete.map((link: any) =>
      socialLinkRepo.update(link.id, { is_deleted: true }),
    ),
  );

  // ✅ Process incoming social links
  const updatedLinks = await Promise.all(
    social.map(async (item: any) => {
      if (item.id) {
        // Only update if it already exists AND is not soft-deleted
        const existing = await socialLinkRepo.findOne({
          where: { id: item.id, is_deleted: false },
        });

        if (existing) {
          existing.platform = item.platform;
          existing.icon = item.icon;
          existing.url = item.url;
          return await socialLinkRepo.save(existing);
        }

        // Don't auto-restore deleted items
        return null;
      } else {
        // Create new social link
        const newLink = socialLinkRepo.create({
          card: { id: card.id },
          platform: item.platform,
          icon: item.icon,
          url: item.url,
        });
        return await socialLinkRepo.save(newLink);
      }
    }),
  );

  // ✅ Return only non-deleted links
  const activeLinks = await socialLinkRepo.find({
    where: { card: { id: card.id }, is_deleted: false },
  });

  // Remove circular refs before sending
  const cleanedLinks = activeLinks.map(({ card, ...rest }) => rest);

  return {
    message: 'Update card successfully',
    card: {
      ...card,
      socialLinks: undefined,
    },
    socialLinks: cleanedLinks,
  };
};

/**
 *
 * - path /api/v1/card/get-all-cards - Get Cards
 * - method: GET
 * - roles: [USER]
 */
export const getCardsForUserService = async (req: Request, res: Response) => {
  const userId = req.user?.user_id;
  const cardRepo = AppDataSource.getRepository(IdCard);
  const cards = await cardRepo
    .createQueryBuilder('card')
    .leftJoinAndSelect(
      'card.socialLinks',
      'socialLink',
      'socialLink.is_deleted = false',
    )
    .where('card.user.id = :userId', { userId })
    .andWhere('card.is_deleted = false')
    .getMany();
  return {
    message: 'Get cards successfully',
    cards,
  };
};

/**
 *
 * - path /api/v1/card/delete-card/:id - Delete Card
 * - method: DELETE
 * - roles: [USER]
 */
export const deleteCardUserService = async (req: Request, res: Response) => {
  const cardRepo = AppDataSource.getRepository(IdCard);
  const cardId = req.params.id;
  const userId = req.user?.user_id;
  const ownCard = await cardRepo.findOne({
    where: { id: cardId, user: { id: userId } },
  });
  if (!ownCard) {
    return res.status(404).json({ message: 'Card not found' });
  }
  await cardRepo.update({ id: cardId }, { is_deleted: true });
  return {
    message: 'Delete card successfully',
  };
};

/**
 *
 * - path /api/v1/card/admin-get-cards/ - gets all Card by admin
 * - method: GET
 * - roles: [ADMIN]
 */
export const getAllCardsAdminService = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  filters,
}: {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  filters: Record<string, string>;
}) => {
  const cardRepo = AppDataSource.getRepository(IdCard);
  const cards = await paginate(cardRepo, {
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
    relations: ['user', 'socialLinks'],
  });
  return {
    message: 'get cards successfully',
    cards,
  };
};

/**
 *
 * - path /api/v1/card/admin-get-cards/ - gets all Card by admin
 * - method: GET
 * - roles: [ADMIN]
 */

export const deleteAdminCardService = async (req: Request, res: Response) => {
  const cardId = req.params.id;
  const cardRepo = AppDataSource.getRepository(IdCard);
  const card = await cardRepo.findOne({
    where: { id: cardId },
  });
  if (!card) {
    return {
      message: 'Card not found',
    };
  }
  await cardRepo.update({ id: cardId }, { is_deleted: true });
  return {
    message: 'Delete card successfully',
  };
};

export const getCardByIdService = async (req: Request, res: Response) => {
  const cardId = req.params.id;
  const cardRepo = AppDataSource.getRepository(IdCard);
  const card = await cardRepo.findOne({
    where: { id: cardId },
    relations: ['socialLinks'],
  });
  if (!card) {
    return {
      message: 'Card not found',
    };
  }
  return {
    message: 'Get card successfully',
    card,
  };
};

export const getCardByUserNameService = async (req: Request, res: Response) => {
  const userName = req.params.userName;
  const cardRepo = AppDataSource.getRepository(IdCard);
  const userRepo = AppDataSource.getRepository(User);
  const exitUser = await userRepo.findOne({ where: { user_name: userName } });
  if (!exitUser) {
    return {
      message: 'Card not found',
    };
  }
  const card = await cardRepo.find({
    where: {
      is_deleted: false,
      user: {
        user_name: userName,
      },
    },
    relations: ['user', 'socialLinks'],
  });
  if (!card) {
    return 'card not found';
  }
  return {
    message: 'Get Card successfully',
    card,
  };
};

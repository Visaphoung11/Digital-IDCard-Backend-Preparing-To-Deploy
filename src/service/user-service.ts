import { AppDataSource } from '@/config/data-source';
import { User } from '@/entities/user';
import { paginate } from '@/util';
import { Request, Response } from 'express';

/**
 *
 * - path /users/me - get user profile
 * - method: PUT
 * - roles: [USER, ADMIN]
 */
export const getUsersService = async ({
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
  // const userRepo = await AppDataSource.getRepository(User)
  //   .createQueryBuilder('user')
  //   .leftJoinAndSelect('user.devices', 'devices')
  //   .getMany();
  // return userRepo;
  const userRepo = AppDataSource.getRepository(User);

  return await paginate(userRepo, {
    page,
    limit,
    sortBy,
    sortOrder,
    filters,
    relations: ['devices'],
  });
};

// export const meService = async (req: Request) => {
//   const userId = req.user?.user_id;

//   // const data = await AppDataSource.getRepository(User).findOneBy({
//   //   id: userId,
//   // });
//   const userRepo = AppDataSource.getRepository(User);
//   const data = await userRepo.findOne({
//     where: { id: userId },
//     relations: ['idCard', 'idCard.socialLinks'],
//   });
//   return {
//     message: 'get profile successfully',
//     data,
//   };
// };
export const meService = async (req: Request) => {
  const userId = req.user?.user_id;

  if (!userId) {
    throw new Error('User ID not found in request');
  }

  const userRepo = AppDataSource.getRepository(User);

  const data = await userRepo
    .createQueryBuilder('user')
    .leftJoinAndSelect(
      'user.idCard',
      'idCard',
      'idCard.is_deleted = false', // This ensures even users without idCard are included
    )
    .leftJoinAndSelect(
      'idCard.socialLinks',
      'socialLinks',
      'socialLinks.is_deleted = false',
    )
    .where('user.id = :userId', { userId })
    .getOne();

  return {
    message: 'get profile successfully',
    data,
  };
};

/**
 *
 * - path /api/v1/users/update-profile - Update user profile
 * - method: PUT
 * - roles: [USER, ADMIN,SUPER_ADMIN]
 */
export const updateProfileService = async (req: Request, res: Response) => {
  const userId = req.user?.user_id;
  // const { full_name, email, user_name, avatar } = req.body;
  const { full_name, email, user_name, avatar, cover_image } = req.body;
  const users = await AppDataSource.getRepository(User).find();
  // const user = users.find((user) => user.id == userId);
  const userNameExist = users.find((user) => user.user_name == user_name);
  if (userNameExist && userNameExist.id !== userId) {
    res.status(409).json({
      message: 'Username already exists',
    });
  }
  await AppDataSource.getRepository(User).update(
    { id: userId },
    {
      full_name,
      email,
      user_name,
      avatar,
      cover_image, // <-- Add this line

      updated_at: new Date(),
    },
  );
  const updatedUser = await AppDataSource.getRepository(User).findOneBy({
    id: userId,
  });

  return res.status(200).json({
    message: 'User updated successfully',
    user: updatedUser,
  });
};

/**
 *
 * - path /api/v1/users/update-user - Update user
 * - method: DELETE
 * - roles: [ADMIN,SUPER_ADMIN]
 */

export const updateUserByAdminService = async (req: Request, res: Response) => {
  const userId = req.params.id;
  // const { full_name, email, user_name, avatar, is_active } = req.body;
  const { full_name, email, user_name, avatar, is_active, cover_image } = req.body;
  const users = await AppDataSource.getRepository(User).find();

  const userNameExist = users.find((user) => user.user_name == user_name);
  if (userNameExist && userNameExist.id !== userId) {
    res.status(409).json({
      message: 'Username already exists',
    });
  }
  await AppDataSource.getRepository(User).update(
    { id: userId },
    {
      full_name,
      email,
      user_name,
      avatar,
      is_active,
      cover_image, // <-- Add this line

      updated_at: new Date(),
    },
  );
  const updatedUser = await AppDataSource.getRepository(User).findOneBy({
    id: userId,
  });

  return res.status(200).json({
    message: 'User updated successfully',
    user: updatedUser,
  });
};

/**
 *
 * - path /api/v1/users/update-profile - Update user profile
 * - method: DELETE
 * - roles: [ADMIN,SUPER_ADMIN]
 */
export const deleteUserService = async (req: Request, res: Response) => {
  const userId = req.params?.id as string;

  const findUser = await AppDataSource.getRepository(User).findOneBy({
    id: userId,
  });
  if (!findUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = await AppDataSource.getRepository(User).update(
    { id: userId },
    {
      is_deleted: true,
      updated_at: new Date(),
    },
  );
  return user;
};

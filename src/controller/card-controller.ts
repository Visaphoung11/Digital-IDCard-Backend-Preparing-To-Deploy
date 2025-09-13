import {
  createCardService,
  deleteAdminCardService,
  deleteCardUserService,
  getAllCardsAdminService,
  getCardByIdService,
  getCardByUserNameService,
  getCardsForUserService,
  updateCardService,
} from '@/service/card-service';
import { Request, Response } from 'express';

export const createCardController = async (req: Request, res: Response) => {
  const result = await createCardService(req, res);
  res.status(201).json(result);
};

export const updateCardController = async (req: Request, res: Response) => {
  const result = await updateCardService(req, res);
  res.status(201).json(result);
};

export const deleteCardUserController = async (req: Request, res: Response) => {
  const result = await deleteCardUserService(req, res);
  res.status(201).json(result);
};

export const getCardsUserController = async (req: Request, res: Response) => {
  const result = await getCardsForUserService(req, res);
  res.status(201).json(result);
};

export const getCardsAdminController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { page, limit, sortBy, sortOrder, ...filters } = req.query;
  const result = await getAllCardsAdminService({
    page: parseInt(page as string, 10) || 1,
    limit: parseInt(limit as string, 10) || 10,
    sortBy: sortBy as string,
    sortOrder: (sortOrder?.toString().toUpperCase() === 'ASC'
      ? 'ASC'
      : 'DESC') as 'ASC' | 'DESC',
    filters: filters as Record<string, string>,
  });
  res.status(201).json(result);
};

export const deleteAdminCardController = async (
  req: Request,
  res: Response,
) => {
  const result = await deleteAdminCardService(req, res);
  res.status(201).json(result);
};

export const getCardByIdController = async (req: Request, res: Response) => {
  const result = await getCardByIdService(req, res);
  res.status(200).json(result);
};

export const getCardByUserNameController = async (
  req: Request,
  res: Response,
) => {
  const result = await getCardByUserNameService(req, res);
  res.status(200).json(result);
};

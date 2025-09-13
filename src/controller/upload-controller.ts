import { uploadImageToCloudinary } from '@/service/upload-service';
import { Request, Response } from 'express';

export const uploadController = async (req: Request, res: Response) => {
  try {
    const data = await uploadImageToCloudinary(req, res);
    res.status(201).json(data);
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error (cloudinary)');
  }
};

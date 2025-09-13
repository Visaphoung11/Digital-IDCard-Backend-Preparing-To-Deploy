import { cloudinaryUploadImage } from '@/util/cloudinary';
import { Request, Response } from 'express';

export const uploadImageToCloudinary = async (req: Request, res: Response) => {
  try {
    const result: any = await cloudinaryUploadImage(req.file?.buffer);
    return {
      message: 'Image uploaded successfully',
      url: result.secure_url,
    };
  } catch (error) {
    console.log(error);
    throw new Error('Internal Server Error (cloudinary)');
  }
};

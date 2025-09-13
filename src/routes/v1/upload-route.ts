import { uploadController } from '@/controller/upload-controller';
import { Router } from 'express';
import multer from 'multer';

const router = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage: multer.memoryStorage() });
router.post('/upload-image', upload.single('image'), uploadController);

export default router;

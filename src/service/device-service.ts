import { AppDataSource } from '@/config/data-source';
import { DeviceDto } from '@/dto/request-dto/device-dto';
import { Device } from '@/entities/device';
import { User } from '@/entities/user';
import { Request, Response } from 'express';

export const saveDeviceService = async (userId: string, req: Request) => {
  const { device_name, device_type, ip_address, browser, os } = req.body;
  const deviceRepo = AppDataSource.getRepository(Device);
  const device = deviceRepo.create({
    device_name,
    device_type,
    ip_address,
    browser,
    os,
    user: { id: userId },
  });
  await deviceRepo.save(device);
  return device;
};

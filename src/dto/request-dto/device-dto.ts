import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
export class DeviceDto {
  @IsNotEmpty()
  device_name?: string;

  @IsOptional()
  device_type?: string;

  @IsNotEmpty()
  ip_address?: string;

  @IsNotEmpty()
  browser?: string;

  @IsNotEmpty()
  user_agent?: string;

  @IsNotEmpty()
  os?: string;
}

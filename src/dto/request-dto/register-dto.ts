import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  full_name!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsOptional()
  gender?: string;

  @IsNotEmpty()
  user_name!: string;
}

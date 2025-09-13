import bcrypt from 'bcryptjs';

export const hashPassword = (password: string, salt: number) => {
  bcrypt.hash(password, salt);
};

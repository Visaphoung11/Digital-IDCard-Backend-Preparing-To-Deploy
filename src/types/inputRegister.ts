// types.ts (or in your service file)
export interface RegisterInput {
  email: string;
  password: string;
  user_name: string;
  full_name: string;
  device_name?: string;
  device_type?: string;
  os?: string;
  browser?: string;
  ip_address?: string;
}

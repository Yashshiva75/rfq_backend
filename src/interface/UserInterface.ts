/*✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯
🔱: @author : Yash shiva
✨: @uses : User Interface Contract
👑: @created : 14/10/2026
✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯✯*/

export interface UserInterface {
  id?: number;
  name: string;
  email: string;
  password?: string;
  roleId: number;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  role?: {
    id: number;
    name: string;
    permissions?: any[];
  };
  [key: string]: any;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: number;
  status?: string;
  [key: string]: any;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  roleId?: number;
  status?: string;
  updatedAt?: Date;
  [key: string]: any;
}

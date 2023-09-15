import { User } from "../../users/entities/user.entity";

export type LoginResponse = Omit<User, 'password' | 'name' | 'roles'> & { token: string };

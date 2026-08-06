import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import config from '../../config';
import prisma from '../../database/prisma';
import usersService, {
  type CreateUserData,
  type UserWithRole,
} from '../users/users.service';

const BCRYPT_SALT_ROUNDS = 10;
const CLIENT_ROLE_NAME = 'CLIENTE';

export type RegisterData = Pick<
  CreateUserData,
  'nombre' | 'apellido' | 'email' | 'password'
> &
  Partial<Pick<CreateUserData, 'telefono' | 'fotoPerfil'>>;

export type LoginData = {
  email: string;
  password: string;
};

export type JwtPayload = {
  id: number;
  email: string;
  rol: string;
};

export type AuthResult = {
  user: UserWithRole;
  token: string;
};

export class AuthService {
  async register(data: RegisterData): Promise<UserWithRole> {
    const existingUser = await usersService.findByEmail(data.email);

    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    const clientRole = await prisma.rol.findUnique({
      where: { nombre: CLIENT_ROLE_NAME },
    });

    if (!clientRole) {
      throw new Error('El rol CLIENTE no existe.');
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);

    return usersService.create({
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      password: hashedPassword,
      rolId: clientRole.id,
      telefono: data.telefono,
      fotoPerfil: data.fotoPerfil,
    });
  }

  async login(data: LoginData): Promise<AuthResult> {
    const user = await usersService.findByEmail(data.email);

    if (!user) {
      throw new Error('Credenciales inválidas.');
    }

    if (!user.activo) {
      throw new Error('El usuario se encuentra deshabilitado.');
    }

    const credentials = await prisma.usuario.findUnique({
      where: { email: data.email },
      select: { password: true },
    });

    if (
      !credentials ||
      !(await bcrypt.compare(data.password, credentials.password))
    ) {
      throw new Error('Credenciales inválidas.');
    }

    const token = this.generateToken(user);

    return { user, token };
  }

  private generateToken(user: UserWithRole): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      rol: user.role.nombre,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}

export default new AuthService();

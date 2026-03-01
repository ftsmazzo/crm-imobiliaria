import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getUsuarios(currentUser: Usuario): Promise<{ id: string; nome: string }[]> {
    if (currentUser.role === 'gestor') {
      return this.prisma.usuario.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
        orderBy: { nome: 'asc' },
      });
    }
    return this.prisma.usuario.findMany({
      where: { id: currentUser.id, ativo: true },
      select: { id: true, nome: true },
    });
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase().trim(), ativo: true },
    });
    if (!usuario || !(await bcrypt.compare(dto.senha, usuario.senhaHash))) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    const payload = { sub: usuario.id, email: usuario.email };
    const access_token = this.jwt.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    return {
      access_token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role,
      },
    };
  }
}

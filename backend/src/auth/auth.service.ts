import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async getUsuarios(currentUser: Usuario): Promise<{ id: string; nome: string; email?: string; role?: string; ativo?: boolean }[]> {
    if (currentUser.role === 'gestor') {
      return this.prisma.usuario.findMany({
        select: { id: true, nome: true, email: true, role: true, ativo: true },
        orderBy: { nome: 'asc' },
      });
    }
    return this.prisma.usuario.findMany({
      where: { ativo: true },
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    });
  }

  async createUsuario(dto: CreateUsuarioDto, currentUser: Usuario) {
    if (currentUser.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode criar usuários');
    }
    const email = dto.email.toLowerCase().trim();
    const existente = await this.prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      throw new ConflictException('Já existe um usuário com este e-mail');
    }
    const senhaHash = await bcrypt.hash(dto.senha, 10);
    return this.prisma.usuario.create({
      data: {
        nome: dto.nome.trim(),
        email,
        senhaHash,
        role: dto.role ?? 'corretor',
      },
      select: { id: true, nome: true, email: true, role: true, ativo: true, criadoEm: true },
    });
  }

  async updateUsuario(id: string, dto: UpdateUsuarioDto, currentUser: Usuario) {
    if (currentUser.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode editar usuários');
    }
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    if (id === currentUser.id) {
      if (dto.ativo === false) {
        throw new ForbiddenException('Você não pode desativar sua própria conta');
      }
      if (dto.role !== undefined && dto.role !== currentUser.role) {
        throw new ForbiddenException('Você não pode alterar seu próprio perfil (gestor/corretor)');
      }
    }
    const data: { nome?: string; email?: string; senhaHash?: string; role?: string; ativo?: boolean } = {};
    if (dto.nome !== undefined) data.nome = dto.nome.trim();
    if (dto.email !== undefined) {
      const email = dto.email.toLowerCase().trim();
      if (email !== usuario.email) {
        const existente = await this.prisma.usuario.findUnique({ where: { email } });
        if (existente) throw new ConflictException('Já existe um usuário com este e-mail');
        data.email = email;
      }
    }
    if (dto.senha !== undefined && dto.senha.length > 0) {
      data.senhaHash = await bcrypt.hash(dto.senha, 10);
    }
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.ativo !== undefined) data.ativo = dto.ativo;
    return this.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, role: true, ativo: true, atualizadoEm: true },
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

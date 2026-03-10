import { Body, Controller, Delete, Get, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';
import { SiteConfigService } from './site-config.service';

@Controller('site-config')
export class SiteConfigController {
  constructor(private siteConfig: SiteConfigService) {}

  @Get()
  getForAdmin(@CurrentUser() user: Usuario) {
    return this.siteConfig.getForAdmin(user);
  }

  @Patch()
  update(@CurrentUser() user: Usuario, @Body() dto: UpdateSiteConfigDto) {
    return this.siteConfig.update(user, dto);
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } })) // 5MB
  uploadLogo(
    @CurrentUser() user: Usuario,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname?: string },
  ) {
    if (!file?.buffer) throw new Error('Arquivo não enviado');
    return this.siteConfig.uploadLogo(user, file);
  }

  @Post('hero')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } })) // 10MB
  uploadHero(
    @CurrentUser() user: Usuario,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname?: string },
  ) {
    if (!file?.buffer) throw new Error('Arquivo não enviado');
    return this.siteConfig.uploadHero(user, file);
  }

  @Delete('logo')
  removeLogo(@CurrentUser() user: Usuario) {
    return this.siteConfig.removeLogo(user);
  }

  @Delete('hero')
  removeHero(@CurrentUser() user: Usuario) {
    return this.siteConfig.removeHero(user);
  }
}

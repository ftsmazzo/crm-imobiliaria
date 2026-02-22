import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

const BUCKET = process.env.MINIO_BUCKET || 'crm';
const PRESIGNED_EXPIRY_SEC = 60 * 60 * 24; // 24h

@Injectable()
export class StorageService {
  private client: Minio.Client | null = null;
  private bucket = BUCKET;

  private getClient(): Minio.Client {
    if (this.client) return this.client;
    const url = process.env.MINIO_SERVER_URL || process.env.MINIO_ENDPOINT || 'http://localhost:9000';
    const u = new URL(url);
    const accessKey = process.env.MINIO_ROOT_USER || process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_ROOT_PASSWORD || process.env.MINIO_SECRET_KEY || 'minioadmin';
    this.client = new Minio.Client({
      endPoint: u.hostname,
      port: u.port ? parseInt(u.port, 10) : (u.protocol === 'https:' ? 443 : 9000),
      useSSL: u.protocol === 'https:',
      accessKey,
      secretKey,
    });
    return this.client;
  }

  async ensureBucket(): Promise<void> {
    const c = this.getClient();
    const exists = await c.bucketExists(this.bucket);
    if (!exists) await c.makeBucket(this.bucket);
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<void> {
    const c = this.getClient();
    await this.ensureBucket();
    await c.putObject(this.bucket, key, buffer, buffer.length, { 'Content-Type': contentType });
  }

  async getPresignedUrl(key: string, expirySec = PRESIGNED_EXPIRY_SEC): Promise<string> {
    const c = this.getClient();
    return c.presignedGetObject(this.bucket, key, expirySec);
  }

  async remove(key: string): Promise<void> {
    const c = this.getClient();
    await c.removeObject(this.bucket, key);
  }
}

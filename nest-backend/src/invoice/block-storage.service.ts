import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class BlockStorageService {
  private client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient(
      configService.get('SUPABASE_URL')!,
      configService.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async upload(file: Express.Multer.File) {
    const { data, error } = await this.client.storage
      .from('invoices')
      .upload(
        `no-id/${new Date().toISOString()}-${file.originalname}`,
        file.buffer,
        { contentType: file.mimetype },
      );
    if (error) {
      throw new Error(error.message);
    }
    return data.path;
  }

  async download(path: string) {
    const { data, error } = await this.client.storage
      .from('invoices')
      .download(path);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async getSignedUrl(path: string) {
    const { data, error } = await this.client.storage
      .from('invoices')
      .createSignedUrl(path, 300);
    if (error) {
      throw new Error(error.message);
    }
    return data.signedUrl;
  }
}

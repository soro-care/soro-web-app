// src/modules/users/cloudinary.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.logger.log('✅ Cloudinary configured');
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'soro-avatars',
  ): Promise<UploadApiResponse> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              this.logger.error('Cloudinary upload error:', error);
              return reject(error);
            }
            this.logger.log(`✅ Image uploaded: ${result.secure_url}`);
            resolve(result);
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      this.logger.error('Upload failed:', error);
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`🗑️ Image deleted: ${publicId}`);
      return result;
    } catch (error) {
      this.logger.error('Delete failed:', error);
      throw error;
    }
  }

  extractPublicId(url: string): string {
    // Extract public_id from Cloudinary URL
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
}

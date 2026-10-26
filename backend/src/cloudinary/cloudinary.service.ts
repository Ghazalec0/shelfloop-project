import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
}

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary environment variables are missing');
    }
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadBookImage(buffer: Buffer): Promise<CloudinaryUploadResult> {
    if (!buffer?.length) {
      throw new InternalServerErrorException('Image buffer is empty');
    }
    try {
      const result = await new Promise<{
        secure_url: string;
        public_id: string;
        format: string;
        bytes: number;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'shelfloop/books',
            resource_type: 'image',
            overwrite: false,
            unique_filename: true,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }
            if (!uploadResult) {
              reject(new Error('Cloudinary returned no result'));
              return;
            }
            resolve(uploadResult);
          },
        );
        stream.end(buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new ServiceUnavailableException('Image upload failed. Please try again later.');
    }
  }

  extractPublicIdFromUrl(url: string): string | null {
    if (!url || !url.includes('cloudinary')) return null;
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex((p) => p === 'upload');
      if (uploadIndex === -1) return null;
      let publicIdWithExt = parts.slice(uploadIndex + 1).join('/');
      publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, '');
      const dotIndex = publicIdWithExt.lastIndexOf('.');
      if (dotIndex !== -1) {
        publicIdWithExt = publicIdWithExt.substring(0, dotIndex);
      }
      return publicIdWithExt;
    } catch {
      return null;
    }
  }

  async deleteImageByUrlOrPublicId(urlOrPublicId: string): Promise<void> {
    if (!urlOrPublicId) return;
    let publicId = urlOrPublicId;
    if (urlOrPublicId.startsWith('http')) {
      const extracted = this.extractPublicIdFromUrl(urlOrPublicId);
      if (!extracted) return;
      publicId = extracted;
    }
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
    } catch (err) {
      console.warn('Failed to delete old image:', publicId, err);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    return this.deleteImageByUrlOrPublicId(publicId);
  }
}

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
    const cloudName = this.configService.get<string>(
      'CLOUDINARY_CLOUD_NAME',
    );
    const apiKey = this.configService.get<string>(
      'CLOUDINARY_API_KEY',
    );
    const apiSecret = this.configService.get<string>(
      'CLOUDINARY_API_SECRET',
    );

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        'Cloudinary environment variables are missing',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadBookImage(
    buffer: Buffer,
  ): Promise<CloudinaryUploadResult> {
    if (!buffer?.length) {
      throw new InternalServerErrorException(
        'Image buffer is empty',
      );
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

      throw new ServiceUnavailableException(
        'Image upload failed. Please try again later.',
      );
    }
  }
}

import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BooksService } from './books.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll(@Query() query: any) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
      fileFilter: (req, file, callback) => {
        if (file && !ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let coverUrl = dto.coverUrl;
    if (file) {
      const result = await this.cloudinaryService.uploadBookImage(file.buffer);
      coverUrl = result.url;
    }
    return this.booksService.create({
      ...dto,
      coverUrl: coverUrl || dto.coverUrl,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
      fileFilter: (req, file, callback) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File | undefined) {
    if (!file) throw new BadRequestException('Please upload a valid image file');
    const result = await this.cloudinaryService.uploadBookImage(file.buffer);
    return { message: 'Book image uploaded successfully', data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id/cover')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
      fileFilter: (req, file, callback) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async updateCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('Please upload a valid image file');
    const updated = await this.booksService.updateCoverWithFile(id, file.buffer);
    return {
      message: 'Cover updated successfully - old image deleted',
      data: updated,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
      fileFilter: (req, file, callback) => {
        if (file && !ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('Only JPEG, PNG, and WebP images are allowed'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let coverUrl = dto.coverUrl;
    if (file) {
      const result = await this.cloudinaryService.uploadBookImage(file.buffer);
      coverUrl = result.url;
    }
    return this.booksService.update(id, {
      ...dto,
      ...(coverUrl ? { coverUrl } : {}),
    } as any);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}

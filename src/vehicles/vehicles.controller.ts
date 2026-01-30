import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  list(@Query('source') source?: 'seed' | 'user') {
    if (source === 'user') return this.vehicles.listUser();
    return this.vehicles.listAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.vehicles.getById(id);
  }

  // JSON create (no files)
  @Post()
  createJson(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  // Multipart create (file uploads)
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'hero', maxCount: 1 },
        { name: 'gallery', maxCount: 3 },
      ],
      {
        storage: diskStorage({
          destination: async (_req, _file, cb) => {
            try {
              const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
              const dest = path.resolve(process.cwd(), uploadsDir, 'vehicles');
              await fs.mkdir(dest, { recursive: true });
              cb(null, dest);
            } catch (e) {
              cb(e as any, path.resolve(process.cwd(), 'uploads', 'vehicles'));
            }
          },
          filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname || '').slice(0, 10);
            cb(null, `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`);
          },
        }),
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      },
    ),
  )
  createUpload(
    @Body() dto: CreateVehicleDto,
    @UploadedFiles()
    files: {
      hero?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    const heroFiles = files?.hero || [];
    const galleryFiles = files?.gallery || [];

    const uploadedUrls = [
      ...heroFiles.map((f) => toPublicUploadUrl(f?.filename)),
      ...galleryFiles.map((f) => toPublicUploadUrl(f?.filename)),
    ].filter(Boolean);

    const finalGallery = [...uploadedUrls, ...(dto.gallery || [])].filter(Boolean);
    const finalImage = uploadedUrls[0] || dto.image || finalGallery[0] || '';

    const mergedDto: CreateVehicleDto = {
      ...dto,
      image: finalImage,
      gallery: finalGallery,
    };

    return this.vehicles.create(mergedDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.vehicles.remove(id);
    return { ok: true };
  }
}

function toPublicUploadUrl(filename?: string): string {
  if (!filename) return '';
  return `/uploads/vehicles/${encodeURIComponent(filename)}`;
}

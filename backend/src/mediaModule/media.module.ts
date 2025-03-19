import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaRepository } from './media.repository';

@Module({
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
})
export class MediaModule {}

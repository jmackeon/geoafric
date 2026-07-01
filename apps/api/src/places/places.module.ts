import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [PlacesService],
  controllers: [PlacesController],
  exports: [PlacesService],
})
export class PlacesModule {}

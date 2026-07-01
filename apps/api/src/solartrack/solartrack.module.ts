import { Module } from '@nestjs/common';
import { SolarTrackService } from './solartrack.service';
import { SolarTrackController } from './solartrack.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [SolarTrackService],
  controllers: [SolarTrackController],
  exports: [SolarTrackService],
})
export class SolarTrackModule {}

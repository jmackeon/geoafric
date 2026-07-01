import { Module } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { FamiliesController, FamiliesPublicController } from './families.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [FamiliesService],
  controllers: [FamiliesController, FamiliesPublicController],
  exports: [FamiliesService],
})
export class FamiliesModule {}

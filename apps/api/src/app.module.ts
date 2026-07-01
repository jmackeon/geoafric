import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SupabaseModule } from './supabase/supabase.module';
import { FamiliesModule } from './families/families.module';
import { HealthModule } from './health/health.module';
import { LocationModule } from './location/location.module';
import { PlacesModule } from './places/places.module';
import { PaymentsModule } from './payments/payments.module';
import { SolarTrackModule } from './solartrack/solartrack.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule, AuthModule, UsersModule, FamiliesModule,
    HealthModule, LocationModule, PlacesModule, PaymentsModule, SolarTrackModule,
  ],
})
export class AppModule {}

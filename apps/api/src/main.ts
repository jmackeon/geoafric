import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // ── CORS — allow web, mobile-in-browser, and Expo Go on LAN ────────────────
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Expo Go, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow localhost on any port (web dev + Expo web)
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);

      // Allow LAN IPs (Expo on physical device hitting your API)
      if (/^https?:\/\/(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[01]))\.\d+\.\d+(:\d+)?$/.test(origin))
        return callback(null, true);

      // Allow production domains
      const allowed = [
        'https://geoafric.app',
        'https://www.geoafric.app',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      if (allowed.includes(origin)) return callback(null, true);

      callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('GeoAfric API')
    .setDescription('Family safety, health, location and place discovery API.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  const port = process.env.API_PORT ?? 3001;
  // Listen on 0.0.0.0 so phones on the LAN can reach it (not just localhost)
  await app.listen(port, '0.0.0.0');

  Logger.log(`🚀 GeoAfric API running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`📚 Swagger docs at  http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
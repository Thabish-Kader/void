import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  console.log(
    `--------> FIRING UP IN ${process.env.NODE_ENV} : PORT ${process.env.PORT} <--------`,
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => console.error(error));

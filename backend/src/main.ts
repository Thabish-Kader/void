import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filter/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  // TODO: Change * on prod
  app.enableCors({
    origin: process.env.NODE_ENV === 'dev' ? 'http://localhost:3000' : '*',
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  console.log(
    `--------> FIRING UP IN ${process.env.NODE_ENV} : PORT ${process.env.PORT} <--------`,
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => console.error(error));

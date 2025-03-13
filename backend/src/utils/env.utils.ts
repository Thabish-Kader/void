import { ConfigService } from '@nestjs/config';

export const getEnv = (configService: ConfigService, key: string): string => {
  return (
    configService.get<string>(key) ??
    (() => {
      throw new Error(`Missing environment variable: ${key}`);
    })()
  );
};

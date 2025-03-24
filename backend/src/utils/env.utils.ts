import { ConfigService } from '@nestjs/config';

interface EnvVariables {
  NODE_ENV: string;
  PORT: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_BUCKET_NAME: string;
}

export const getEnv = <K extends keyof EnvVariables>(
  configService: ConfigService,
  key: K,
): EnvVariables[K] => {
  const value = configService.get<EnvVariables[K]>(key);

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

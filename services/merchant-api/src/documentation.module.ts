import { DocumentBuilder } from '@nestjs/swagger';

export const DocumentationModule = new DocumentBuilder()
  .setTitle('YarnMarket Merchant API')
  .setDescription('API for merchant management and business operations')
  .setVersion('1.0')
  .addTag('merchants')
  .addTag('conversations')
  .addTag('analytics')
  .build();
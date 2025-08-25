import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentationModule } from './documentation.module';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Setup Swagger documentation
  const document = SwaggerModule.createDocument(app, DocumentationModule);
  SwaggerModule.setup('api/docs', app, document);

  console.log('🚀 YarnMarket Merchant API starting...');
  
  await app.listen(3001);
  console.log('✅ Merchant API listening on port 3001');
}

bootstrap().catch(console.error);
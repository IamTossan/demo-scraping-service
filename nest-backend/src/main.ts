import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NatsOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { otelSDK } from './tracing';

async function bootstrap() {
  otelSDK.start();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.connectMicroservice<NatsOptions>(
    {
      transport: Transport.NATS,
      options: { servers: ['nats://localhost:4222'], queue: 'scraping_dev' },
    },
    { inheritAppConfig: true },
  );

  app.set('query parser', 'extended');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: false,
      transformOptions: {
        exposeUnsetFields: false,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

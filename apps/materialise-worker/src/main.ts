import { NestFactory } from '@nestjs/core';
import { MaterialiseWorkerModule } from './materialise-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(MaterialiseWorkerModule);
  await app.listen(3002);
}
bootstrap();

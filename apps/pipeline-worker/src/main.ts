import { NestFactory } from '@nestjs/core';
import { PipelineWorkerModule } from './pipeline-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(PipelineWorkerModule);
  await app.listen(3000);
}
bootstrap();

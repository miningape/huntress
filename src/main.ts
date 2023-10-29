import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { SchedulerService } from './scheduler.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const scheduler = app.get(SchedulerService);
  // await scheduler.run();

  await app.listen(3000);
}
bootstrap();

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { GlobalModule } from './prisma/prisma.module';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [ScheduleModule.forRoot(), GlobalModule, PipelineModule],
  providers: [SchedulerService],
})
export class AppModule {}

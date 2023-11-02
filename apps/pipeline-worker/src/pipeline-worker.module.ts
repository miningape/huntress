import { Module } from '@nestjs/common';
import { PipelineWorkerService } from './pipeline-worker.service';
import { HelperModule } from '@app/helper';
import { ScheduleModule } from '@nestjs/schedule';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [ScheduleModule.forRoot(), HelperModule, PipelineModule],
  providers: [PipelineWorkerService],
})
export class PipelineWorkerModule {}

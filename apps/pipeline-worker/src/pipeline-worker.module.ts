import { Module } from '@nestjs/common';
import { PipelineWorkerController } from './pipeline-worker.controller';
import { PipelineWorkerService } from './pipeline-worker.service';

@Module({
  imports: [],
  controllers: [PipelineWorkerController],
  providers: [PipelineWorkerService],
})
export class PipelineWorkerModule {}

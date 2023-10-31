import { Controller, Get } from '@nestjs/common';
import { PipelineWorkerService } from './pipeline-worker.service';

@Controller()
export class PipelineWorkerController {
  constructor(private readonly pipelineWorkerService: PipelineWorkerService) {}

  @Get()
  getHello() {
    return this.pipelineWorkerService.getHello();
  }
}

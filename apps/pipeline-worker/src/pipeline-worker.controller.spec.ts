import { Test, TestingModule } from '@nestjs/testing';
import { PipelineWorkerController } from './pipeline-worker.controller';
import { PipelineWorkerService } from './pipeline-worker.service';

describe('PipelineWorkerController', () => {
  let pipelineWorkerController: PipelineWorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PipelineWorkerController],
      providers: [PipelineWorkerService],
    }).compile();

    pipelineWorkerController = app.get<PipelineWorkerController>(PipelineWorkerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(pipelineWorkerController.getHello()).toBe('Hello World!');
    });
  });
});

import { ExecutionService } from '@app/helper/execution.service';
import { PipelineJobQueueService } from '@app/helper/pipeline/pipeline-job.queue.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PipelineService } from 'apps/pipeline-worker/src/pipeline/pipeline.service';

@Injectable()
export class PipelineWorkerService {
  private readonly logger = new Logger(PipelineWorkerService.name);
  constructor(
    private readonly pipelineService: PipelineService,
    private readonly executionService: ExecutionService,
    private readonly pipelineJobQueue: PipelineJobQueueService,
  ) {}

  @Cron('*/15 * * * * *')
  async readQueueAndExecute() {
    // this.logger.debug('Reading pipeline job queue');
    const job = await this.pipelineJobQueue.read();

    if (job === null) {
      // this.logger.debug('No jobs in queue');
      return;
    }

    try {
      await this.pipelineService.pipe(job.executionId, job.definition);
    } catch (e: any) {
      this.logger.error(
        'Job with ID: ' + job.executionId + ' crashed while scheduling!',
      );
      await this.executionService.error(job.executionId, e.message ?? null);
    }
  }
}

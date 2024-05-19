import { Injectable, Logger } from '@nestjs/common';
import { PipelineSource } from './pipeline.source';
import { PipelineDestination } from './pipeline.destination';
import { FileService } from './files/file.service';
import { BoligPortalWebcrawler } from './webcrawler/bolig-portal/bolig-portal.webcrawler';
import { DatabaseDestination } from './database/database.destination';
import {
  PipelineJobTo,
  PipelineJob,
  PipelineJobFrom,
} from '@app/helper/job/pipeline.job';
import { ExecutionService } from '@app/helper/execution.service';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private readonly fileService: FileService,
    private readonly executionService: ExecutionService,
    private readonly databaseDestination: DatabaseDestination,
    private readonly boligPortalWebCrawler: BoligPortalWebcrawler,
  ) {}

  async pipe(executionId: string, pipelineJob: PipelineJob) {
    await this.begin(executionId);
    const source = this.getSource(pipelineJob.from);
    const destination = this.getDestination(pipelineJob.to);

    const stream = source.get(pipelineJob.from, executionId);
    await destination.pipe(stream, pipelineJob.to, executionId);
    await this.finish(executionId);
  }

  private begin(executionId: string) {
    this.logger.debug(
      'Started pipeline for job with execution ID: ' + executionId,
    );
    return this.executionService.begin(executionId);
  }

  private finish(executionId: string) {
    this.logger.debug(
      'Finished pipeline for job with execution ID: ' + executionId,
    );
    return this.executionService.finish(executionId);
  }

  private getSource(source: PipelineJobFrom): PipelineSource {
    if ('webcrawler' in source) {
      return this.boligPortalWebCrawler;
    }

    if ('file' in source) {
      return this.fileService;
    }

    throw new Error('Could not find source');
  }

  private getDestination(destination: PipelineJobTo): PipelineDestination {
    if ('file' in destination) {
      return this.fileService;
    }

    if ('database' in destination) {
      return this.databaseDestination;
    }

    throw new Error('Could not find destination');
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PipelineSource } from './pipeline.source';
import { PipelineDestination } from './pipeline.destination';
import { PipelineJob, PipelineJobFrom, PipelineJobTo } from './pipeline.job';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileService } from './files/file.service';
import { BoligPortalWebcrawler } from './webcrawler/bolig-portal/bolig-portal.webcrawler';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly boligPortalWebCrawler: BoligPortalWebcrawler,
  ) {}

  async pipe(executionId: string, job: any) {
    await this.begin(executionId);
    const pipelineJob = PipelineJob.parse(job);
    const source = this.getSource(pipelineJob.from);
    const destination = this.getDestination(pipelineJob.to);

    const stream = source.get(pipelineJob.from);
    await destination.pipe(stream, pipelineJob.to);
    await this.finish(executionId);
  }

  private begin(executionId: string) {
    this.logger.debug(
      'Started pipeline for job with execution ID: ' + executionId,
    );
    return this.prisma.execution.update({
      where: {
        id: executionId,
      },
      data: {
        status: 'Running',
      },
    });
  }

  private finish(executionId: string) {
    this.logger.debug(
      'Finished pipeline for job with execution ID: ' + executionId,
    );
    return this.prisma.execution.update({
      where: {
        id: executionId,
      },
      data: {
        status: 'Finished',
        stopped_at: new Date(),
      },
    });
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

    throw new Error('Could not find destination');
  }
}

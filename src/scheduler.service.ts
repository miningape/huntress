import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import { PipelineService } from './pipeline/pipeline.service';
import * as cron from '@datasert/cronjs-matcher';
import { Execution, Job } from '@prisma/client';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pipelineService: PipelineService,
  ) {}

  @Cron('*/30 * * * * *')
  async run() {
    this.logger.log('Reading job queue');
    const jobs = await this.getAllJobs();

    for (const job of jobs) {
      const shouldRunJob = await this.shouldRunJob(job);
      if (shouldRunJob) {
        const { id } = await this.schedule(job.id);
        this.logger.debug('Scheduled job with execution ID: ' + id);

        try {
          await this.runJob(id, job);
        } catch (e) {
          this.logger.error('Job with ID: ' + id + ' crashed!');
          await this.error(id, e.message ?? null);
        }
      }
    }
  }

  private async runJob(executionId: string, job: Job) {
    switch (job.type) {
      case 'Pipeline': {
        await this.pipelineService.pipe(executionId, job.definition);
        break;
      }
      default:
        throw new Error(`No Implementation for "${job.type}" - skipping`);
    }
  }

  private error(executionId: string, errorMessage: string | null) {
    return this.prisma.execution.update({
      where: {
        id: executionId,
      },
      data: {
        status: 'Crashed',
        data: errorMessage,
        stopped_at: new Date(),
      },
    });
  }

  private schedule(jobId: string) {
    return this.prisma.execution.create({
      data: {
        status: 'Scheduled',
        job: {
          connect: {
            id: jobId,
          },
        },
      },
    });
  }

  private async shouldRunJob(job: Job & { executions: Execution[] }) {
    const lastRun: Execution | undefined = job.executions[0];

    if (lastRun === undefined) {
      return true;
    }

    if (lastRun.status === 'Scheduled') {
      return false;
    }

    if (lastRun.status === 'Running') {
      return false;
    }

    if (lastRun.status === 'Crashed') {
      return this.checkCrashStatus(job);
    }

    if (lastRun.stopped_at === null) {
      this.logger.error(
        'Job is not running but has stopped, id: ' + lastRun.id,
      );
      return false;
    }

    const futureTimes = cron.getFutureMatches(job.interval, {
      startAt: lastRun.started_at.toISOString(),
      endAt: new Date().toISOString(),
      hasSeconds: true,
    });

    return futureTimes.length > 0;
  }

  private async checkCrashStatus(job: Job & { executions: Execution[] }) {
    if (job.executions.length < 3) {
      return true;
    }

    for (const execution of job.executions) {
      if (execution.status !== 'Crashed') {
        return true;
      }
    }

    await this.prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        stopped: true,
      },
    });

    return false;
  }

  private getAllJobs() {
    return this.prisma.job.findMany({
      where: {
        deleted_at: null,
        stopped: false,
      },
      include: {
        executions: {
          take: 3,
          orderBy: {
            started_at: 'desc',
          },
        },
      },
    });
  }
}

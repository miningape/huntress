import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as cron from '@datasert/cronjs-matcher';
import { Execution, Job } from '@prisma/client';
import { ExecutionService } from '@app/helper/execution.service';
import { PipelineJobQueueService } from '@app/helper/pipeline/pipeline-job.queue.service';
import { PrismaService } from '@app/helper/global/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pipelineJobQueue: PipelineJobQueueService,
    private readonly executionService: ExecutionService,
  ) {}

  @Cron('*/30 * * * * *')
  async run() {
    this.logger.log('Reading job queue');
    const jobs = await this.getAllJobs();

    for (const job of jobs) {
      const shouldRunJob = await this.shouldRunJob(job);
      if (shouldRunJob) {
        const { id } = await this.executionService.schedule(job.id);

        try {
          await this.runJob(id, job);
        } catch (e) {
          this.logger.error(
            'Job with ID: ' + id + ' crashed while scheduling!',
          );
          await this.executionService.error(id, e.message ?? null);
        }
      }
    }
  }

  private async runJob(executionId: string, job: Job) {
    switch (job.type) {
      case 'Pipeline': {
        await this.pipelineJobQueue.push(executionId, job.definition);
        break;
      }
      default:
        throw new Error(`No Implementation for "${job.type}" - skipping`);
    }
  }

  private getAllJobs() {
    return this.prisma.job.findMany({
      where: {
        deleted_at: null,
        OR: [{ stopped: false }, { force_run: true }],
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

  private async shouldRunJob(job: Job & { executions: Execution[] }) {
    if (job.force_run) {
      return this.forceRun(job);
    }

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

    return (
      futureTimes.filter((time) => time != lastRun.started_at.toISOString())
        .length > 0
    );
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

  private async forceRun(job: Job) {
    await this.prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        force_run: false,
      },
    });

    return true;
  }
}

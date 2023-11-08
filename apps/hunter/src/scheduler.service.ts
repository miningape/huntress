import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as cron from '@datasert/cronjs-matcher';
import { Dependency, Execution, Job } from '@prisma/client';
import { ExecutionService } from '@app/helper/execution.service';
import { PipelineQueueService } from '@app/helper/queue/pipeline.queue.service';
import { PrismaService } from '@app/helper/global/prisma.service';
import { MaterialiseQueueService } from '@app/helper/queue/meterialise.queue.service';
import * as dayjs from 'dayjs';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly executionService: ExecutionService,
    private readonly pipelineJobQueue: PipelineQueueService,
    private readonly materialiseJobQueue: MaterialiseQueueService,
  ) {}

  @Cron('0 * * * * *')
  async run() {
    this.logger.log('Reading job queue');
    const jobs = await this.getAllJobs();

    for (const job of jobs) {
      const shouldScheduleJob = await this.shouldScheduleJob(job);
      if (shouldScheduleJob) {
        await this.executionService.schedule(job.id);
      }
    }

    const executions = await this.getAllExecutionsToRun();
    for (const execution of executions) {
      try {
        const shouldRunJob = await this.shouldRunJob(execution);
        if (shouldRunJob) {
          await this.executionService.scheduled(execution.id);
          await this.runJob(execution.id, execution.job);
        }
      } catch (e) {
        this.logger.error(
          'Job with execution ID: ' + execution.id + ', crashed!',
        );
        this.executionService.error(execution.id, e.message ?? '');
      }
    }
  }

  private async shouldRunJob(
    execution: Execution & { job: Job & { depends_on: Dependency[] } },
  ) {
    if (execution.job.depends_on.length > 0) {
      const baseTime = dayjs(execution.started_at);
      for (const { depends_on_id } of execution.job.depends_on) {
        const job = await this.getLatestExecutionForJob(depends_on_id);
        if (
          job.status !== 'Finished' ||
          baseTime.isAfter(dayjs(job.started_at), 'seconds')
        ) {
          return false;
        }
      }
    }

    return true;
  }

  private getLatestExecutionForJob(id: string) {
    return this.prisma.execution.findFirst({
      where: {
        job_id: id,
      },
      orderBy: {
        started_at: 'desc',
      },
    });
  }

  private getAllExecutionsToRun() {
    return this.prisma.execution.findMany({
      where: {
        status: 'Scheduling',
      },
      include: {
        job: {
          include: {
            depends_on: true,
          },
        },
      },
    });
  }

  private async runJob(executionId: string, job: Job) {
    switch (job.type) {
      case 'Pipeline': {
        await this.pipelineJobQueue.push(executionId, job.definition);
        break;
      }
      case 'Materialise': {
        await this.materialiseJobQueue.push(executionId, job.definition);
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
        depends_on: true,
        executions: {
          take: 3,
          orderBy: {
            started_at: 'desc',
          },
        },
      },
    });
  }

  private async shouldScheduleJob(job: Job & { executions: Execution[] }) {
    if (job.force_run) {
      return this.forceRun(job);
    }

    const lastRun: Execution | undefined = job.executions[0];

    if (lastRun === undefined) {
      return true;
    }

    if (lastRun.status === 'Scheduling') {
      return false;
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

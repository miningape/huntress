import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './global/prisma.service';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);
  constructor(private readonly prisma: PrismaService) {}

  schedule(jobId: string) {
    this.logger.debug('Scheduling a job with ID: ' + jobId);
    return this.prisma.execution.create({
      data: {
        status: 'Scheduling',
        job: {
          connect: {
            id: jobId,
          },
        },
      },
    });
  }

  scheduled(executionId: string) {
    this.logger.debug('Scheduled an execution with ID: ' + executionId);
    return this.prisma.execution.update({
      where: {
        id: executionId,
      },
      data: {
        status: 'Scheduled',
      },
    });
  }

  begin(id: string) {
    this.logger.debug('Starting a job with execution ID: ' + id);
    return this.prisma.execution.update({
      where: {
        id,
        status: 'Scheduled',
      },
      data: {
        status: 'Running',
      },
    });
  }

  finish(executionId: string) {
    this.logger.debug('Finished job with execution ID: ' + executionId);
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

  finishWithData(executionId: string, data: string) {
    return this.prisma.execution.update({
      where: {
        id: executionId,
      },
      data: {
        status: 'Finished',
        stopped_at: new Date(),
        data,
      },
    });
  }

  error(id: string, errorMessage: string | null) {
    this.logger.error('Job crashed with execution ID: ' + id);
    return this.prisma.execution.update({
      where: {
        id,
      },
      data: {
        status: 'Crashed',
        data: errorMessage,
        stopped_at: new Date(),
      },
    });
  }
}

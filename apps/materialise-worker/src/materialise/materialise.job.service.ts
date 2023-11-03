import { ExecutionService } from '@app/helper/execution.service';
import { MaterialiseJob } from '@app/helper/job/materialise.job';
import { Injectable, Logger } from '@nestjs/common';
import { MaterialiseViewService } from './materialise.view.service';
import { readFile } from 'fs/promises';
import { createHash } from 'crypto';
import { PrismaService } from '@app/helper/global/prisma.service';

@Injectable()
export class MaterialiseJobService {
  private readonly logger = new Logger(MaterialiseJobService.name);

  constructor(
    private readonly executionService: ExecutionService,
    private readonly materialisedViewService: MaterialiseViewService,
    private readonly prisma: PrismaService,
  ) {}

  async materialise(executionId: string, job: MaterialiseJob) {
    await this.begin(executionId);

    const query = (await readFile(job.query)).toString();
    const queryHash = this.calculateQueryHash(query);
    const lastQueryHash = await this.getLastQueryHash(executionId);

    if (queryHash !== lastQueryHash) {
      await this.materialisedViewService.deleteIfExists(job.name);
    }

    await this.materialisedViewService.materialise(job.name, query);

    await this.finish(executionId, queryHash);
  }

  async getLastQueryHash(executionId: string) {
    const jobEntry = await this.prisma.job.findFirst({
      select: {
        executions: {
          where: {
            status: 'Finished',
          },
          orderBy: {
            started_at: 'desc',
          },
          take: 1,
        },
      },
      where: {
        executions: {
          some: {
            id: executionId,
          },
        },
      },
    });

    return jobEntry?.executions[0]?.data;
  }

  calculateQueryHash(query: string) {
    return createHash('md5').update(query).digest('hex');
  }

  private begin(executionId: string) {
    this.logger.debug('Started materialise with execution ID: ' + executionId);
    return this.executionService.begin(executionId);
  }

  private finish(executionId: string, queryHash: string) {
    this.logger.debug(
      'Finished materialise job with execution ID: ' + executionId,
    );
    return this.executionService.finishWithData(executionId, queryHash);
  }
}

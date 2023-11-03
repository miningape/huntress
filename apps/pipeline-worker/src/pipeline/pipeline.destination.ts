import { PipelineJobTo } from '@app/helper/job/pipeline.job';
import { Readable } from 'stream';

export abstract class PipelineDestination {
  abstract pipe(
    stream: Readable,
    to: PipelineJobTo,
    pipelineExecutionId: string,
  ): Promise<void>;
}

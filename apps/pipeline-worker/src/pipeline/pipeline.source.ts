import { PipelineJobFrom } from '@app/helper/pipeline/pipeline.job';
import { Readable } from 'stream';

export abstract class PipelineSource {
  abstract get(from: PipelineJobFrom, pipelineExecutionId: string): Readable;
}

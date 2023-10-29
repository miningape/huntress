import { Readable } from 'stream';
import { PipelineJobFrom } from './pipeline.job';

export abstract class PipelineSource {
  abstract get(from: PipelineJobFrom): Readable;
}

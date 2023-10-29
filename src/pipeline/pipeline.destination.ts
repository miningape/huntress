import { PipelineJobTo } from './pipeline.job';
import { Readable } from 'stream';

export abstract class PipelineDestination {
  abstract pipe(stream: Readable, to: PipelineJobTo): Promise<void>;
}

import { PipelineJobTo } from './pipeline.job';
import { Readable, Transform } from 'stream';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export abstract class PipelineDestination {
  abstract pipe(stream: Readable, to: PipelineJobTo): Promise<void>;
}

export class FileDestination implements PipelineDestination {
  async pipe(stream: Readable, to: PipelineJobTo): Promise<void> {
    await pipeline(
      stream,
      new Transform({
        objectMode: true,
        transform(chunk, encoding, callback) {
          callback(null, JSON.stringify(chunk) + '\n');
        },
      }),
      createWriteStream(to.file),
    );
  }
}

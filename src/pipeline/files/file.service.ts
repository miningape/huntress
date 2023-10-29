import { Injectable } from '@nestjs/common';
import { PipelineSource } from '../pipeline.source';
import { PipelineDestination } from '../pipeline.destination';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { FileJob } from '../pipeline.job';
import { createReadStream, createWriteStream } from 'fs';

@Injectable()
export class FileService implements PipelineDestination, PipelineSource {
  async pipe(stream: Readable, to: FileJob): Promise<void> {
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

  get(from: FileJob): Readable {
    return createReadStream(from.file);
  }
}

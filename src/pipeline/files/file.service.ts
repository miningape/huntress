import { Injectable } from '@nestjs/common';
import { PipelineSource } from '../pipeline.source';
import { PipelineDestination } from '../pipeline.destination';
import { Readable, Transform, TransformCallback } from 'stream';
import { pipeline } from 'stream/promises';
import { FileJob } from '../pipeline.job';
import { createReadStream, createWriteStream } from 'fs';

class JsonTransform extends Transform {
  private lastChunk: string | null = null;

  constructor() {
    super({
      objectMode: true,
    });
  }

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    if (this.lastChunk === null) {
      this.lastChunk = '{\n\t"data": [\n\t\t' + JSON.stringify(chunk);
      callback(null, '');
      return;
    }

    callback(null, this.lastChunk + ',\n\t\t');
    this.lastChunk = JSON.stringify(chunk);
  }

  _flush(callback: TransformCallback): void {
    callback(null, this.lastChunk + '\n\t]\n}');
  }
}

@Injectable()
export class FileService implements PipelineDestination, PipelineSource {
  async pipe(stream: Readable, to: FileJob): Promise<void> {
    const jsonTransform = new JsonTransform();
    await pipeline(stream, jsonTransform, createWriteStream(to.file));
  }

  get(from: FileJob): Readable {
    return createReadStream(from.file);
  }
}

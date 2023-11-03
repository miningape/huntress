import { Injectable } from '@nestjs/common';
import { PipelineSource } from '../pipeline.source';
import { PipelineDestination } from '../pipeline.destination';
import { Readable, Transform, TransformCallback } from 'stream';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { FileJob } from '@app/helper/job/pipeline.job';

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
  private filename(name: string): string {
    return name.replace('{datetime}', new Date().toISOString());
  }

  async pipe(stream: Readable, to: FileJob): Promise<void> {
    const jsonTransform = new JsonTransform();
    const filename = this.filename(to.file);
    await pipeline(stream, jsonTransform, createWriteStream(filename));
  }

  get(from: FileJob): Readable {
    return createReadStream(from.file);
  }
}

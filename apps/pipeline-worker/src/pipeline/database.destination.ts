import { Injectable } from '@nestjs/common';
import { PipelineDestination } from './pipeline.destination';
import { Readable } from 'stream';
import { ListingService } from '../../../../libs/helper/src/housing/listing.service';
import { DatabaseJob } from '@app/helper/job/pipeline.job';

@Injectable()
export class DatabaseDestination implements PipelineDestination {
  constructor(private readonly listingService: ListingService) {}

  pipe(stream: Readable, to: DatabaseJob, executionId: string): Promise<void> {
    if ('table' in to.database) {
      if (to.database.table === 'Listing') {
        return this.listingService.pipe(stream, to, executionId);
      }
    }

    throw new Error('Could not find pipeline destination for ' + to.database);
  }
}

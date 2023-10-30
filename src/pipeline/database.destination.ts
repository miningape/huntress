import { Injectable } from '@nestjs/common';
import { PipelineDestination } from './pipeline.destination';
import { Readable } from 'stream';
import { DatabaseJob } from './pipeline.job';
import { ListingService } from 'src/listing/listing.service';

@Injectable()
export class DatabaseDestination implements PipelineDestination {
  constructor(private readonly listingService: ListingService) {}

  pipe(stream: Readable, to: DatabaseJob): Promise<void> {
    if ('table' in to.database) {
      if (to.database.table === 'Listing') {
        return this.listingService.pipe(stream);
      }
    }

    throw new Error('Could not find pipeline destination for ' + to.database);
  }
}

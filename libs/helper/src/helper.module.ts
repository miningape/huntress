import { Module } from '@nestjs/common';
import { GlobalModule } from './global/global.module';
import { PipelineQueueService } from './queue/pipeline.queue.service';
import { ExecutionService } from './execution.service';
import { ListingService } from './housing/listing.service';
import { MaterialiseQueueService } from './queue/materialise.queue.service';

@Module({
  imports: [GlobalModule],
  providers: [
    PipelineQueueService,
    MaterialiseQueueService,
    ExecutionService,
    ListingService,
  ],
  exports: [
    PipelineQueueService,
    MaterialiseQueueService,
    ExecutionService,
    ListingService,
  ],
})
export class HelperModule {}

import { Module } from '@nestjs/common';
import { GlobalModule } from './global/global.module';
import { PipelineJobQueueService } from './pipeline/pipeline-job.queue.service';
import { ExecutionService } from './execution.service';
import { ListingService } from './housing/listing.service';

@Module({
  imports: [GlobalModule],
  providers: [PipelineJobQueueService, ExecutionService, ListingService],
  exports: [PipelineJobQueueService, ExecutionService, ListingService],
})
export class HelperModule {}

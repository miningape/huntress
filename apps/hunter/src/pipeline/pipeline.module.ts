import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { FileService } from './files/file.service';
import { BoligPortalWebcrawler } from './webcrawler/bolig-portal/bolig-portal.webcrawler';
import { PuppeteerService } from './webcrawler/puppeteer.service';
import { DatabaseDestination } from './database.destination';
import { ListingService } from '../listing/listing.service';

@Module({
  providers: [
    PipelineService,
    FileService,
    BoligPortalWebcrawler,
    PuppeteerService,
    ListingService,
    DatabaseDestination,
  ],
  exports: [PipelineService],
})
export class PipelineModule {}
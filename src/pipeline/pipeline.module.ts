import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { FileService } from './files/file.service';
import { BoligPortalWebcrawler } from './webcrawler/bolig-portal/bolig-portal.webcrawler';
import { PuppeteerService } from './webcrawler/puppeteer.service';
import { ListingService } from 'src/listing/listing.service';
import { DatabaseDestination } from './database.destination';

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

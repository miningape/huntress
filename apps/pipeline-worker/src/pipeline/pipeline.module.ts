import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { FileService } from './files/file.service';
import { BoligPortalWebcrawler } from './webcrawler/bolig-portal/bolig-portal.webcrawler';
import { PuppeteerService } from './webcrawler/puppeteer.service';
import { DatabaseDestination } from './database/database.destination';
import { HelperModule } from '@app/helper';

@Module({
  imports: [HelperModule],
  providers: [
    PipelineService,
    FileService,
    BoligPortalWebcrawler,
    PuppeteerService,
    DatabaseDestination,
  ],
  exports: [PipelineService],
})
export class PipelineModule {}

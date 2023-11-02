import { PipelineSource } from '../pipeline.source';
import { PuppeteerService } from './puppeteer.service';

export abstract class WebCrawler extends PipelineSource {
  constructor(protected readonly puppeteerService: PuppeteerService) {
    super();
  }
}

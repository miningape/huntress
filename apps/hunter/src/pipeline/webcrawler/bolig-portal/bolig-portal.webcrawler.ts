import { Readable } from 'stream';
import { WebCrawlerJob } from '../../pipeline.job';
import { Page } from 'puppeteer';
import { BoligPortalPageReader } from './bolig-portal.page.reader';
import { Injectable, Logger } from '@nestjs/common';
import { PuppeteerService } from '../puppeteer.service';
import { PipelineSource } from '../../pipeline.source';
import { HousingEntry } from 'apps/hunter/src/housing/housing.entity';
import { delay } from 'apps/hunter/src/util/delay';

@Injectable()
export class BoligPortalWebcrawler implements PipelineSource {
  private readonly logger = new Logger(BoligPortalWebcrawler.name);
  private readonly baseUrl = 'https://www.boligportal.dk';
  private readonly pageReader = new BoligPortalPageReader();

  constructor(protected readonly puppeteerService: PuppeteerService) {}

  get(job: WebCrawlerJob): Readable {
    const urlIterator = this.readBoligPortal(job);
    const dataIterator = this.batchReadPages(urlIterator, 5);

    return Readable.from(dataIterator);
  }

  private async *batchReadPages(
    urlIterator: AsyncIterable<string>,
    batchSize: number,
  ): AsyncIterable<HousingEntry> {
    let urls: string[] = [];
    for await (const url of urlIterator) {
      urls.push(url);

      if (urls.length == batchSize) {
        await delay(1000);
        yield* await Promise.all(
          urls.map(async (url) => {
            const page = await this.createPage();
            await page.goto(url);

            let housingData = null;
            try {
              housingData = await this.pageReader.read(page);
            } catch (e) {
              const id = url.split('-').pop() ?? 'no-page';
              await page.screenshot({
                captureBeyondViewport: true,
                fullPage: true,
                path: `reading-page-${id}.jpg`,
              });
              console.error(e);
              this.logger.error('Error reading page: ' + url + ',  skipping!');
            }

            await page.close();
            return housingData;
          }),
        ).then((data) => data.filter((x): x is HousingEntry => x !== null));

        urls = [];
      }
    }
  }

  private async *readBoligPortal(
    message: WebCrawlerJob,
  ): AsyncIterable<string> {
    const page = await this.createPage();
    try {
      await page.goto(this.baseUrl + message.webcrawler.startUri);
      await this.acceptCookies(page);

      let pageNumber = 1;
      while (true) {
        this.logger.debug('Reading bolig portal page ' + pageNumber++);

        const urls = await this.getAllListingUrlsOnPage(page);

        yield* urls;

        await delay(1000);
        const hasNavigated = await this.gotoNextPage(page);

        if (!hasNavigated) {
          break;
        }
      }
    } catch (e) {
      this.logger.error('Error while reading listing URLs');
      await page.screenshot({
        captureBeyondViewport: true,
        fullPage: true,
        path: 'reading-urls.jpg',
      });
      throw e;
    } finally {
      await page.close();
      await this.puppeteerService.close();
    }
  }

  private async createPage() {
    const browser = await this.puppeteerService.get();
    return browser.newPage();
  }

  private async acceptCookies(page: Page) {
    const cookiesAcceptSelector = '#declineButton';
    const elem = await page.waitForSelector(cookiesAcceptSelector);
    await elem?.click();
  }

  private async getAllListingUrlsOnPage(page: Page) {
    const listingSelector =
      '#app > div:nth-child(2) > div:nth-child(1) > div > div > div.temporaryFlexColumnClassName.css-mom5ju > div.css-16jggh1 > div > div > div > a';
    await page.waitForSelector(listingSelector);
    return await page.$$eval(listingSelector, (listingElements) =>
      listingElements.map((anchorElement) => anchorElement.href),
    );
  }

  private async gotoNextPage(page: Page) {
    const nextSelector =
      '#app > div:nth-child(2) > div:nth-child(1) > div > div > div.temporaryFlexColumnClassName.css-mom5ju > div.css-1lrlb33 > div > div > button:nth-child(4)';
    const nextButton = await page.waitForSelector(nextSelector, {
      timeout: 1000,
    });

    if (!nextButton) {
      return false;
    }

    const isDisabled = await (
      await nextButton.getProperty('disabled')
    ).jsonValue();

    if (isDisabled) {
      return false;
    }

    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0',
      }),
      nextButton.click(),
    ]);
    await nextButton.dispose();

    return true;
  }
}

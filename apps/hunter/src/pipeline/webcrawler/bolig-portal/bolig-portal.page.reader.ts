import { Page } from 'puppeteer';
import { BoligPortalTableReader } from './bolig-portal.table.reader';
import { HousingEntry } from 'apps/hunter/src/housing/housing.entity';

export class BoligPortalPageReader {
  private readonly housingDetailsSelector =
    '#app > div.css-1lmu4mj > div:nth-child(5) > div.css-tuhgbu > div.css-ysv6ho > div.css-1jf5j4m > div.css-11rix5h > section:nth-child(1) > div.css-15kk0v4';
  private readonly rentalDetailsSelector =
    '#app > div.css-1lmu4mj > div:nth-child(5) > div.css-tuhgbu > div.css-ysv6ho > div.css-1jf5j4m > div.css-11rix5h > section:nth-child(2) > div.css-15kk0v4';
  private readonly addressSelector =
    '#app > div.css-1lmu4mj > div:nth-child(5) > div.css-tuhgbu > div.css-ysv6ho > div.css-tfjtmt > span > div';

  private readonly boligPortalTableReader = new BoligPortalTableReader();

  async read(page: Page): Promise<HousingEntry> {
    const url = page.url();
    const monthlyRent = await this.readMonthlyRent(page);
    const address = await this.readStringAtSelector(page, this.addressSelector);

    const data = await this.boligPortalTableReader.read(
      page,
      this.housingDetailsSelector,
    );

    const data2 = await this.boligPortalTableReader.read(
      page,
      this.rentalDetailsSelector,
    );

    return {
      url,
      address,
      ...data,
      ...data2,
      monthlyRent,
    } as HousingEntry;
  }

  private async readStringAtSelector(
    page: Page,
    selector: string,
    defaultValue?: string,
  ) {
    try {
      await page.waitForSelector(selector, {
        timeout: 1000,
      });
      return await page.$eval(selector, (priceSpan) => priceSpan.innerHTML);
    } catch (e) {
      console.log('At page: ', page.url(), e);

      if (defaultValue !== undefined) {
        return defaultValue;
      }

      throw e;
    }
  }

  private async readMonthlyRent(page: Page): Promise<number> {
    const priceSelector =
      '#app > div.css-1lmu4mj > div:nth-child(5) > div.css-tuhgbu > div.css-1auaikh > div > div.css-1uol9bj > div > div.css-8j687q > div.css-1s6r6ax > div.css-1osvs0a > div:nth-child(1) > span';

    return this.readStringAtSelector(page, priceSelector).then(
      (rent) => Number.parseFloat(rent) * 1000,
    );
  }
}

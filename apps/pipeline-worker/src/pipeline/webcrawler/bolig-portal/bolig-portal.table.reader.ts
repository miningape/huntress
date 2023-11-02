import { HousingEntry } from '@app/helper/housing/housing.entity';
import { Page } from 'puppeteer';

export class BoligPortalTableReader {
  async read(
    page: Page,
    tableSelector: string,
  ): Promise<Record<string, string>> {
    const elems = await this.readTable(page, tableSelector);

    return Object.fromEntries(
      (
        await Promise.all(
          (elems ?? []).map((elem) => {
            return elem.$$eval('div > span', (e) =>
              e.map((ep) => ep.innerHTML),
            );
          }),
        )
      )
        .filter(([key]) => typeof key === 'string')
        .map(([key, value]) => [this.translate(key), value])
        .filter(([key]) => key !== null),
    );
  }

  private translate(danish: string): keyof HousingEntry | null {
    switch (danish.trim()) {
      case 'Boligtype':
        return 'type';
      case 'Størrelse':
        return 'size';
      case 'Værelser':
        return 'rooms';
      case 'Etage':
        return 'floor';
      case 'Møbleret':
        return 'furnished';
      case 'Husdyr tilladt':
        return 'petsAllowed';
      case 'Elevator':
        return 'elevator';
      case 'Altan/terrasse':
        return 'balcony';
      case 'Opvaskemaskine':
        return 'dishwasher';
      case 'Vaskemaskine':
        return 'washingMachine';
      case 'Lejeperiode':
        return 'rentalPeriod';
      case 'Ledig fra':
        return 'availableFrom';
      case 'Månedlig leje':
        return 'monthlyRent';
      case 'Aconto':
        return 'Aconto';
      case 'Depositum':
        return 'deposit';
      case 'Forudbetalt husleje':
        return 'prepaidRent';
      case 'Indflytningspris':
        return 'moveInPrice';
      case 'Sagsnr.':
        return 'case_number';
      default:
        return null;
    }
  }

  private async readTable(page: Page, tableSelector: string) {
    await page.waitForSelector(tableSelector, { timeout: 1000 });
    return page.$$(tableSelector + '> div > div > div');
  }
}

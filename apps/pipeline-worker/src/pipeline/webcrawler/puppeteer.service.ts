import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class PuppeteerService implements OnModuleDestroy {
  static readonly KEYS = {
    BOLIG_PORTAL: '@bolig-portal',
  } as const;

  private browsers: Record<string, Browser | undefined> = {};

  async get(key: string): Promise<Browser> {
    if (!(key in this.browsers) || this.browsers[key] === undefined) {
      this.browsers[key] = await puppeteer.launch({
        headless: 'new',
      });
    }

    return this.browsers[key]!;
  }

  async close(key: string) {
    if (key in this.browsers && this.browsers[key] !== undefined) {
      await this.browsers[key]?.close();
      this.browsers[key] = undefined;
    }
  }

  async onModuleDestroy() {
    for (const browser in this.browsers) {
      await this.close(browser);
    }
  }
}

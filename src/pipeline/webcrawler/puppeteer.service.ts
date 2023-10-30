import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class PuppeteerService implements OnModuleDestroy {
  private browser: Browser | null = null;

  async get() {
    if (this.browser === null) {
      this.browser = await puppeteer.launch({ headless: true });
    }

    return this.browser;
  }

  async close() {
    this.onModuleDestroy();
  }

  async onModuleDestroy() {
    if (this.browser === null) {
      return;
    }

    await this.browser.close();
    this.browser = null;
  }
}

import { Injectable } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class PuppeteerService {
  private browser: Browser | null = null;

  async get() {
    if (this.browser === null) {
      this.browser = await puppeteer.launch({ headless: true });
    }

    return this.browser;
  }
}

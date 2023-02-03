import puppeteer from 'puppeteer-core';

export async function getCrunchbaseDesc(name: string) {
  const browser =
    process.env.NODE_ENV === 'production'
      ? await puppeteer.connect({
          browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_SECRET}`,
        })
      : await puppeteer.launch();

  const page = await browser.newPage();

  // spoof user agent, crunchbase is super strict with bot detection
  await page.setExtraHTTPHeaders({
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'upgrade-insecure-requests': '1',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,en;q=0.8',
  });
  await page.goto(`https://www.crunchbase.com/organization/${name}`);
  console.log(`Navigated to https://www.crunchbase.com/organization/${name}`);

  try { // if there is a read more button, return the expanded text
    console.log('Looking for "Read More" button');
    const buttonSelector =
      '.mat-accent > .mat-button-wrapper > .ng-star-inserted';
    await page.waitForSelector(buttonSelector, { timeout: 1500 });
    console.log('Found "Read More" button');
    await page.click(buttonSelector);
    console.log('Clicked "Read More" button');

    const textSelector = '.expanded';
    const textEl = await page.waitForSelector(textSelector);
    console.log('Found expanded text');

    const desc = textEl
      ? await textEl.evaluate((el) => el.textContent?.trim())
      : '';
    await browser.close();
    console.log(desc);
    return desc;
  } catch (e) {
    console.log('No "Read More" button');
    try { // if there is no read more button, return the text
      const textSelector =
        'row-card:nth-of-type(2) > profile-section:nth-of-type(1) > section-card:nth-of-type(1) > mat-card:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > description-card:nth-of-type(1)';
      const textEl = await page.waitForSelector(textSelector, {
        timeout: 1500,
      });
      const desc = textEl
        ? await textEl.evaluate((el) => el.textContent?.trim())
        : '';
      await browser.close();

      console.log(desc);
      return desc;
    } catch (e) { // if there is no text, return null
      console.log('Crunchbase likley rejected scraping attempt');
      await browser.close();
      return null;
    }
  }
}

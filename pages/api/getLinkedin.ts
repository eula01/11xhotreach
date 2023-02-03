import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';

type ResData = {
  [key: string]: string;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResData>
) {
  const browser =
    process.env.NODE_ENV === 'production'
      ? await puppeteer.connect({
          browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_SECRET}`,
        })
      : await puppeteer.launch();

  let page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  console.log(req.body);

  // no need to handle `req.body.url === undefined`, input validation is client-side
  await page.goto(req.body);

  // close popup
  const searchResultSelector =
    '.contextual-sign-in-modal__modal-dismiss-icon > .artdeco-icon';
  await page.waitForSelector(searchResultSelector);
  await page.click(searchResultSelector);

  // name
  const nameSelector = '.top-card-layout__title';
  const nameElement = await page.waitForSelector(nameSelector);
  let name = nameElement
    ? await nameElement.evaluate((el) => el.textContent?.trim())
    : '';

  // title
  const titleSelector = '.top-card-layout__headline';
  const titleElement = await page.waitForSelector(titleSelector);
  let title = titleElement
    ? await titleElement.evaluate((el) => el.textContent?.trim())
    : '';

  // company name
  const companyNameSelector =
    '.top-card__position-info > .top-card-link > .top-card-link__description';
  const companyNameElement = await page.waitForSelector(companyNameSelector);
  let companyName = companyNameElement
    ? await companyNameElement.evaluate((el) => el.textContent?.trim())
    : '';

  // education
  const edcuationSelector = '.education__list-item';
  const edcuationElement = await page.waitForSelector(edcuationSelector);
  let education = edcuationElement
    ? await edcuationElement.evaluate((el) => el.textContent?.trim())
    : '';

  // job
  const jobSelector =
    'section:nth-of-type(1) > section:nth-of-type(3) > div:nth-of-type(1) > ul:nth-of-type(1) > li:nth-of-type(1)';
  const jobElement = await page.waitForSelector(jobSelector);
  let job = jobElement
    ? await jobElement.evaluate((el) => el.textContent?.trim())
    : '';

  // TOOD: fix this hacky solution by making the response data more flexible and instead of returning one education or one job, return an array of them, and make the selectors more specific. For now this will be fine though.
  name = name || '';
  title = title || '';
  companyName = companyName || '';
  education = education || '';
  job = job || '';

  const data: ResData = {
    url: req.body.url,
    name,
    title,
    companyName,
    education,
    job,
  };

  // weird whitespace and newlines in data
  function trimObjectValues(obj: { [key: string]: string }): {
    [key: string]: string;
  } {
    for (let key of Object.keys(obj)) {
      let value = obj[key];
      if (typeof value === 'string') {
        obj[key] = value.replace(/\n\s+/g, '').trim();
      }
    }
    return obj;
  }

  let trimmedData = trimObjectValues(data);

  console.log(data);

  await browser.close();
  res.status(200).json(trimmedData);
}

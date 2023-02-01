import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

type ResData = {
  [key: string]: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResData>
) {
  // init puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
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
  const textSelector = await page.waitForSelector(nameSelector);
  let name = textSelector
    ? await textSelector.evaluate((el) => el.textContent?.trim())
    : '';

  // title
  const titleSelector = '.top-card-layout__headline';
  const titleTextSelector = await page.waitForSelector(titleSelector);
  let title = titleTextSelector
    ? await titleTextSelector.evaluate((el) => el.textContent?.trim())
    : '';

  // education
  const edcuationSelector = '.education__list-item';
  const edcuationTextSelector = await page.waitForSelector(edcuationSelector);
  let education = edcuationTextSelector
    ? await edcuationTextSelector.evaluate((el) => el.textContent?.trim())
    : '';

  // job
  const jobSelector =
    'section:nth-of-type(1) > section:nth-of-type(3) > div:nth-of-type(1) > ul:nth-of-type(1) > li:nth-of-type(1)';
  const jobTextSelector = await page.waitForSelector(jobSelector);
  let job = jobTextSelector
    ? await jobTextSelector.evaluate((el) => el.textContent?.trim())
    : '';


  // TOOD: fix this hacky solution by making the response data more flexible and instead of returning one education or one job, return an array of them, and make the selectors more specific. For now this will be fine though.
  name = name || '';
  title = title || '';
  education = education || '';
  job = job || '';

  const data: ResData = {
    url: req.body.url,
    name,
    title,
    education,
    job,
  };

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

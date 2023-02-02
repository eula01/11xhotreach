// import type { NextApiRequest, NextApiResponse } from 'next';
// import chromium from 'chrome-aws-lambda';
// import playwright from 'playwright';

// type ResData = {
//   [key: string]: string;
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<ResData>
// ) {
//   // init puppeteer
//   console.log('WWWWWWW node env: ', process.env.NODE_ENV);
//   console.log('WWWWWWW chromium: ', chromium);
//   console.log(
//     'WWWWWWW chromium.executablePath: ',
//     await chromium.executablePath
//   );

//   const browser = await playwright.chromium.launch({
//     args: chromium.args,
//     executablePath:
//       process.env.NODE_ENV !== 'development'
//         ? await chromium.executablePath
//         : '/usr/bin/chromium',
//     headless: process.env.NODE_ENV !== 'development' ? chromium.headless : true,
//   });

//   let page = await browser.newPage({
//     viewport: {
//       width: 1080,
//       height: 1024,
//     },
//   });
//   await page.goto(req.body);

//   console.log(req.body);

//   // no need to handle `req.body.url === undefined`, input validation is client-side

//   // close popup
//   const searchResultSelector =
//     '#public_profile_contextual-sign-in > div > section > button';

//   let success = false;
//   while (!success) {
//     try {
//       let popup = await page
//         .locator(searchResultSelector)
//         .click({ timeout: 3000 });
//       success = true;
//     } catch (e) {
//       console.log('got hit with authwall, trying again');
//       page.close();
//       page = await browser.newPage({
//         viewport: {
//           width: 1080,
//           height: 1024,
//         },
//       });
//       await page.goto(req.body);
//     }
//   }

//   // name
//   const nameSelector = '.top-card-layout__title';
//   const textSelector = await page.locator(nameSelector);
//   let name = textSelector
//     ? await textSelector.evaluate((el) => el.textContent?.trim(), {
//         timeout: 8000,
//       })
//     : '';

//   // title
//   const titleSelector = '.top-card-layout__headline';
//   const titleTextSelector = await page.locator(titleSelector);
//   let title = titleTextSelector
//     ? await titleTextSelector.evaluate((el) => el.textContent?.trim())
//     : '';

//   // education
//   const edcuationSelector = '.education__list-item';
//   const edcuationTextSelector = await page.locator(edcuationSelector);
//   let education = edcuationTextSelector
//     ? await edcuationTextSelector.evaluate((el) => el.textContent?.trim())
//     : '';

//   // job
//   const jobSelector =
//     'section:nth-of-type(1) > section:nth-of-type(3) > div:nth-of-type(1) > ul:nth-of-type(1) > li:nth-of-type(1)';
//   const jobTextSelector = await page.locator(jobSelector);
//   let job = jobTextSelector
//     ? await jobTextSelector.evaluate((el) => el.textContent?.trim())
//     : '';

//   // TOOD: fix this hacky solution by making the response data more flexible and instead of returning one education or one job, return an array of them, and make the selectors more specific. For now this will be fine though.
//   name = name || '';
//   title = title || '';
//   education = education || '';
//   job = job || '';

//   const data: ResData = {
//     url: req.body.url,
//     name,
//     title,
//     education,
//     job,
//   };

//   function trimObjectValues(obj: { [key: string]: string }): {
//     [key: string]: string;
//   } {
//     for (let key of Object.keys(obj)) {
//       let value = obj[key];
//       if (typeof value === 'string') {
//         obj[key] = value.replace(/\n\s+/g, '').trim();
//       }
//     }
//     return obj;
//   }

//   let trimmedData = trimObjectValues(data);

//   console.log(data);

//   await browser.close();
//   res.status(200).json(trimmedData);
// }

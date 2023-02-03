import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-core';
import { Configuration, OpenAIApi } from 'openai';
import { PrismaClient } from '@prisma/client';
import { getCrunchbaseDesc } from '@/util/scraping';

// define api clients outside of handler to avoid creating a new client for each request
const prisma = new PrismaClient();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_SECRET,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('req.body', req.body);
  let { companySite, companyName } = req.body;
  console.log('stf', companySite, companyName);

  // check if we already have a summary to avoid gpt-3 call
  const summary = await prisma.companysummaries.findMany({
    where: {
      site: companySite,
    },
  });
  if (summary.length > 0) {
    console.log('found summary in db');
    res.status(200).json({ body: summary[0].summary });
    return;
  }

  // check if we can scrape crunchbase for a summary to avoid gpt-3 call
  // @DEPRECATED - cruchbase rejects like 99% of scraping attempts so the +10 seconds are not worth it
  // const crunchbaseSummary = await getCrunchbaseDesc(companyName);
  // if (crunchbaseSummary) {
  //   await prisma.companysummaries.create({
  //     data: {
  //       site: companySite,
  //       summary: crunchbaseSummary,
  //     },
  //   });
  //   console.log('found summary in db');
  //   res.status(200).json({ body: crunchbaseSummary });
  //   return;
  // }

  // fine... lets call gpt-3
  try {
    // get all text from company website using puppeteer
    const browser =
      process.env.NODE_ENV === 'production'
        ? await puppeteer.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_SECRET}`,
          })
        : await puppeteer.launch();

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(companySite);

    let text =
      (await page.$eval('*', (el) => {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(el);
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        return window?.getSelection()?.toString();
      })) || '';

    // remove last 10% of chars (footer of site) to minimize tokens/api cost
    let lengthToRemove = Math.round(text.length * 0.1);
    text = text.slice(0, text.length - lengthToRemove);

    console.log(text);

    // ask gpt-3 to summarize company website
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Summarize what this company does: ${text}`,
      max_tokens: 150,
    });

    // save to db
    console.log(completion.data.choices[0].text);
    await prisma.companysummaries.create({
      data: {
        site: companySite,
        summary: completion.data.choices[0].text || 'No summary found',
      },
    });

    await browser.close();

    console.log('no summary found in db. called gpt-3 and memoized it');
    res.status(200).json({ body: completion.data.choices[0].text });
  } catch (e: any) {
    // https://github.com/openai/openai-node#error-handling
    if (e.response) {
      console.log(e.response.status);
      console.log(e.response.data);
    } else {
      console.log(e.message);
    }
  }
}

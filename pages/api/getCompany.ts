import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { Configuration, OpenAIApi } from 'openai';
import { PrismaClient } from '@prisma/client';
import { url } from 'inspector';

// define api clients outside of handler to avoid creating new clients for each request
const prisma = new PrismaClient();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_SECRET,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // check if we already have a summary to avoid expensive gpt-3 calls
  const summary = await prisma.companysummaries.findMany({
    where: {
      site: req.body,
    },
  });

  if (summary.length > 0) {
    console.log('found summary in db');
    // just return the first result for now, this can get tricky otherwise– i need to handle url variations
    res.status(200).json({ body: summary[0].summary });
    return;
  }

  // init puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  // no need to handle `req.body.url === undefined`, input validation is client-side
  await page.goto(req.body);

  const text = await page.$eval('*', (el) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNode(el);
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    return window?.getSelection()?.toString();
  });

  // ask gpt-3 to summarize all text from company website
  const completion = await openai.createCompletion({
    model: 'text-curie-001',
    prompt: `${text} \n\n Given the above text about a compnay, summarize what this company does`,
    max_tokens: 1000,
  });

  console.log(completion.data.choices[0].text);

  await browser.close();

  await prisma.companysummaries.create({
    data: {
      site: req.body,
      summary: completion.data.choices[0].text || 'No summary found',
    },
  });

  console.log('no summary found in db. called gpt-3 and memoized it');
  res.status(200).json({ body: completion.data.choices[0].text });
}

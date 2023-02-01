import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import { Configuration, OpenAIApi } from 'openai';

type ResData = {
  [key: string]: string;
};

// defined outside of function to reuse api client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_SECRET,
});
const openai = new OpenAIApi(configuration);
console.log(process.env.OPENAI_API_SECRET);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // init puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1024 });

  console.log(req.body);

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

  const completion = await openai.createCompletion({
    model: 'text-curie-001',
    prompt: `${text} \n\n Given the above text about a compnay, summarize what this company does`,
    max_tokens: 1000,
  });

  console.log(completion.data.choices[0].text);

  await browser.close();

  res.status(200).json({ body: completion.data.choices[0].text });
}

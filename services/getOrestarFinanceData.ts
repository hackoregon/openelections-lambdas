import puppeteer from 'puppeteer';
// import XLSX from 'xlsx'; // TODO: use me for xls parsing.
import { existsSync as fileExists } from 'fs';

interface OrestarFinanceQueryCriteria {
  candidateName: string;
}

export default async ({ candidateName }: OrestarFinanceQueryCriteria): Promise<void> => {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 0,
  });

  const page = await browser.newPage();

  await page.emulate({
    viewport: {
      width: 1200,
      height: 800,
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:78.0) Gecko/20100101 Firefox/78.0',
  });

  await (page as any)._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: './temp',
  });

  page.on('console', (stuffToLog) => console.log(stuffToLog.text()));

  page.goto('https://secure.sos.state.or.us/orestar/gotoPublicTransactionSearch.do');

  const candidateInputSelector = 'input[name=cneSearchFilerCommitteeTxt]';
  const startDateInputSelector = '#cneSearchTranStartDate'
  const startDate = '01/01/2020'
  const transactionTypeSelectSelector = '#cneSearchTranType'
  const transactionType = 'C'
  // const endDateInputSelector = ''

  await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });
  console.log('done waiting for landing');

  // await page.screenshot({ path: 'pics/1.png' });
  // eslint-disable-next-line no-restricted-globals
  await page.evaluate(() => console.log(`url is ${location.href}`));

  await page.type(candidateInputSelector, candidateName, { delay: 100 });
  await page.type(startDateInputSelector, startDate, { delay: 100 });
  await page.select(transactionTypeSelectSelector, transactionType)
  // await page.screenshot({ path: 'pics/2.png' });

  console.log('entered search query');

  await Promise.all([
    page.waitForNavigation({ timeout: 0 }),
    page.click('input[name=search]', { clickCount: 3 }),
    // new Promise((resolve) => {
    //   console.log('clicking search!');
    //   setTimeout(async () => {
    //     await page.screenshot({ path: 'pics/4.png' });
    //     console.log('screenshot!');
    //     resolve();
    //   }, 5000);
    // }),
  ]);

  console.log('doing search.');
  // await page.screenshot({ path: 'pics/5.png' });

  console.log('loaded results!');

  const exportSelector = '#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a';
  await page.waitForSelector(exportSelector, { timeout: 0 });

  // await page.screenshot({ path: 'pics/6.png' });
  console.log('found export link');

  await page.click(exportSelector);
  console.log('downloading XLS file.');

  // TODO: be sure to remove the xls to ensure fs watching doesn't get an old file

  const xlsFilename = './temp/XcelCNESearch.xls';

  // poll the filesystem for the downloaded file.
  const maxTimeout = 120000;
  const start = Date.now();
  while (!fileExists(xlsFilename)) {
    if (Date.now() - start > maxTimeout) {
      console.log('File polling timed out. Aborting download.');
      browser.close();
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 250)); // sleep
  }

  console.log('successfully downloaded file!!');
  // browser.close();

  // TODO: do XLS parsing here.
  // XLSX.read(xlsFilename);
};

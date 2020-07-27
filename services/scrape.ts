import puppeteer from 'puppeteer';
import path from 'path';
import XLSX from 'xlsx';

// TODO: saving file for debug
import { writeFileSync } from 'fs';

export async function runScraper(): Promise<any> {
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: './temp',
    timeout: 0,
    args: [
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
      '--user-data-dir=/tmp/user_data/',
      '--window-size=1200,800',
    ],
    // args: ['--disable-dev-shm-usage', 'start-maximized', '--disable-extensions', '--disable-gpu', '--no-sandbox'] // https://peter.sh/experiments/chromium-command-line-switches/
  });
  const page = await browser.newPage();
  page.on('console', (stuffToLog) => console.log(stuffToLog.text()));
  await page.setViewport({
    width: 640,
    height: 480,
    deviceScaleFactor: 1,
  });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36');
  // eslint-disable-next-line no-underscore-dangle
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: path.resolve(__dirname, 'downloaded'),
  });

  console.log(`the dirs: ${path.resolve(__dirname, 'downloaded')}`);

  page.goto('https://secure.sos.state.or.us/orestar/gotoPublicTransactionSearch.do');
  await Promise.race([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 }),
    page.waitForNavigation({ waitUntil: 'load', timeout: 0 }),
    page.waitFor('.pageheader'),
  ]);

  const cookies = await page.cookies();
  console.log({ cookies });

  try {
    console.log('setting input');

    await page.type('input[name=cneSearchFilerCommitteeTxt]', 'Ted Wheeler')
      .then(async () => {
        const candidateInputTarget = await page.$('input[name=cneSearchFilerCommitteeTxt]');
        const candidateName = await page.evaluate((element) => element.value, candidateInputTarget);
        console.log(candidateName);
      });
  } catch (error) {
    console.log('failed to set input');
    console.log(error);
  }

  try {
    console.log('setting the listeners');
    // await page.$eval('input[name=search]', elem => elem.click())
    await Promise.all([
      page.$eval('input[name=search]', (elem) => {
        console.log('clicking the element', elem);
        elem.click();
      }),
      await Promise.race([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 }),
        page.waitForNavigation({ waitUntil: 'load', timeout: 0 }),
        page.waitFor('#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a', { timeout: 0 }),
      ]),
    ]);
  } catch (error) {
    console.log('failed to set listeners');
    console.log(error);
  }

  console.log('url:', page.url());

  const downloadButton = await page.$('#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a');
  const excelFileData = await page.evaluate(async (downloadUrl: string) => {
    console.log('fetching data with credentials');
    const file = await window.fetch(downloadUrl, { credentials: 'include' });
    return file.text();
  }, downloadButton);

  // TODO: remove me
  writeFileSync('temp/output.xls', excelFileData);

  const financeData = XLSX.read(excelFileData, { type: 'binary' });
  console.log(financeData);

  await browser.close();
  console.log('done');
}

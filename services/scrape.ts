import puppeteer from 'puppeteer';
import XLSX from 'xlsx';
export async function runScraper(): Promise<any> {
  const browser = await puppeteer.launch({
    headless: false, // TODO: change me and confirm!
    userDataDir: './temp',
    timeout: 0,
  });

  const candidate = 'Ted Wheeler';
  const candidateInputSelector = 'input[name=cneSearchFilerCommitteeTxt]';

  const page = await browser.newPage();

  // eslint-disable-next-line no-underscore-dangle
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: './temp',
  });

  page.on('console', (stuffToLog) => console.log(stuffToLog.text()));

  await page.goto('https://secure.sos.state.or.us/orestar/gotoPublicTransactionSearch.do');

  await page.waitFor(candidateInputSelector);
  await page.type(candidateInputSelector, candidate);

  await page.click('input[name=search]', { delay: 1000 });

  console.log('doing search.');

  const exportSelector = '#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a';
  await page.waitFor(exportSelector, { timeout: 0 });

  console.log('search loaded.');

  // const downloadButton = await page.$(exportSelector);
  // const excelFileData = await page.evaluate(async (downloadUrl: string) => {
  //   console.log('fetching data with credentials');
  //   const file = await window.fetch(downloadUrl);
  //   console.log(file.headers);
  //   const text = await file.text();
  //   return text;
  // }, downloadButton);

  // writeFileSync('temp/output.xls', excelFileData);

  await page.click(exportSelector);
  console.log('downloading');

  // TODO: check fs for file existence until some maxTimeout then close browser
  // * if found, parse it!
  // * be sure to remove the file to ensure fs watching doesn't get an old file
}

import puppeteer from 'puppeteer';
import XLSX from 'xlsx';

export async function runScraper(): Promise<any> {
  const browser = await puppeteer.launch({
    headless: true,
    // userDataDir: './temp',
    timeout: 0,
    args: [
      // '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
      // '--no-sandbox',
    //   // '--user-data-dir=/tmp/user_data/',
      // '--window-size=1200,800',
    ],
  });

  const page = await browser.newPage();

  await page.emulate({
    viewport: {
      width: 1200,
      height: 800,
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:78.0) Gecko/20100101 Firefox/78.0',
  });

  // eslint-disable-next-line no-underscore-dangle
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: './temp',
  });

  // // turn on request interceptor
  // await page.setRequestInterception(true);

  // // abort css or image requests
  // page.on('request', (request) => {
  //   if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet') {
  //     request.abort();
  //   } else {
  //     request.continue();
  //   }
  // });

  page.on('console', (stuffToLog) => console.log(stuffToLog.text()));

  page.goto('https://secure.sos.state.or.us/orestar/gotoPublicTransactionSearch.do');

  console.log('we went to the starting page');

  const candidate = 'Ted Wheeler';
  const candidateInputSelector = 'input[name=cneSearchFilerCommitteeTxt]';

  // page.waitForSelector(candidateInputSelector);
  page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });
  console.log('done waiting for landing');

  await page.screenshot({ path: 'pics/1.png' });
  await page.evaluate(() => console.log(`url is ${location.href}`));
  console.log('cookies:', await page.cookies().then((jar) => jar.map((c) => c.name)));

  // const test = page.$eval(candidateInputSelector, (el, value) => { el.value = value; return 'cmon'; }, candidate);
  // test.then((v) => console.log(v));

  // await page.focus(candidateInputSelector);
  // await page.keyboard.type(candidate);

  await page.type(candidateInputSelector, candidate, { delay: 100 });
  await page.screenshot({ path: 'pics/2.png' });

  console.log('entered search query');

  // const html = await page.content();

  // browser.close();
  // return html;

  const searchButtonSelector = 'input[name=search]';
  // page.focus(searchButtonSelector);
  // await page.screenshot({ path: 'pics/3.png' });

  // console.log('focused button');

  // await page.$eval('form[name=cneSearchForm]', (form) => {
  //   console.log('submitting form!');
  //   form.submit();
  // });

  // await Promise.all([
  //   page.click('input[name=search]', { clickCount: 2 }).then(() => console.log('clicked search!')),
  //   page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 }),
  // ]);

  // page.click('input[name=search]', { delay: 1000 });
  // await page.screenshot({ path: 'pics/3.png' });
  // console.log('clicked!');

  // page.waitForNavigation({ timeout: 75000 });


  await Promise.all([
    page.waitForNavigation({ timeout: 0 }),
    page.click('input[name=search]', { clickCount: 3 }),
    new Promise((resolve) => {
      console.log('clicking search!');
      setTimeout(async () => {
        await page.screenshot({ path: 'pics/4.png' });
        console.log('screenshot!');
        resolve();
      }, 5000);
    }),
  ]);

  console.log('doing search.');
  await page.screenshot({ path: 'pics/5.png' });

  // page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });
  // await page.screenshot({ path: 'pics/4.png' });

  console.log('loaded results!');

  const exportSelector = '#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a';
  page.waitForSelector(exportSelector, { timeout: 0 });

  await page.screenshot({ path: 'pics/6.png' });
  console.log('found export link');


  // const html = await page.content();

  // browser.close();
  // return html;

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

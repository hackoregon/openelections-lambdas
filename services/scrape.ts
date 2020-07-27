import puppeteer from 'puppeteer'
import path from 'path'

export async function runScraper (): Promise<any> {
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: './temp',
    timeout: 0,
    args: [ '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36', '--user-data-dir=/tmp/user_data/', '--window-size=1200,800' ]
    // args: ['--disable-dev-shm-usage', 'start-maximized', '--disable-extensions', '--disable-gpu', '--no-sandbox'] // https://peter.sh/experiments/chromium-command-line-switches/
  })
  console.log('here?')
  const page = await browser.newPage()
  await page.setViewport({
    width: 640,
    height: 480,
    deviceScaleFactor: 1,
  })
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36')
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: path.resolve(__dirname,'downloaded')
  })

  console.log(`the dirs: ${path.resolve(__dirname,'downloaded')}`)

  page.goto('https://secure.sos.state.or.us/orestar/gotoPublicTransactionSearch.do')
  await Promise.race([
    page.waitForNavigation({waitUntil: 'domcontentloaded', timeout: 0}),
    page.waitForNavigation({waitUntil: 'load', timeout: 0}),
    page.waitFor('.pageheader')
  ])

  const cookies = await page.cookies()
  console.log({ cookies })

  try {
    console.log('setting input')
    await page.type('input[name=cneSearchFilerCommitteeTxt]', 'Ted Wheeler').then( async () => {
      const candidateInputTarget = await page.$('input[name=cneSearchFilerCommitteeTxt]')
      const candidateName = await page.evaluate(element => element.value, candidateInputTarget)
      console.log(candidateName)
      return
    })
  } catch (error) {
    console.log(error)
  }
  
  try {
    console.log('setting the listeners')
    // await page.$eval('input[name=search]', elem => elem.click())
    await Promise.all([
      page.$eval('input[name=search]', elem => {
        console.log('clicking the element', elem)
        elem.click()
      }),
      Promise.race([
        page.on('response', async (response) => {
          // console.log('response', response.url())
          // await page.click('#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a').then(() => {
          //   console.log('clicked the button')
          // })
          await Promise.race([
            page.waitForNavigation({waitUntil: 'domcontentloaded', timeout: 0 }),
            page.waitForNavigation({waitUntil: 'load', timeout: 0 }),
            page.waitFor('#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a', { timeout: 0 })
          ])
          await page.$eval('#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a', elem => {
            console.log('clicking the element, #2', elem)
            elem.click()
          })
          const url = page.url()
          console.log(url)
          // await page.evaluate((selector) => document.querySelector(selector).click(), '#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a')
        }),
        page.on('requestfailed', request => {
          console.log(request.url() + ' ' + request.failure().errorText);
        })
      ])
    ])
  } catch (error) {
    console.log(error)
  }

  // #content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a
  // await page.click('#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a')
  
  // const [response] = await Promise.all([
  //   page.waitForNavigation({
  //     timeout: 0
  //   }),
  //   page.click('#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a'),
  // ])

  // ! dear andy, possible new tactic: get the url from the link above. use it with page.waitForResponse
  // const xcelDownloadLink = await page.$('#content > div > form > table:nth-child(6) > tbody > tr > td:nth-child(3) > a')
  // const xcelUrl = await page.evaluate(element => element.href, xcelDownloadLink)

  // console.log(xcelUrl)

  // const response = await page.waitForResponse(xcelUrl, { timeout: 0 })
  
  // console.log('done fetching response')
  // console.log(response)

  // await browser.close()
  // console.log('done')
}

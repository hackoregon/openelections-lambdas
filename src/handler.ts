import 'source-map-support/register';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { readXls } from '@services/readXls';
// import getOrestarFinanceData from '@services/getOrestarFinanceData';
// import { geocodeContributions } from '@services/geocodeContributions';
import { addContributions } from '@services/addContributions';
import { geocodeContributions } from '@services/geocodeContributions';

// TODO:
//  1) Update geocode to run post-save https://typeorm.io/#/listeners-and-subscribers/afterupdate
//  2) reorganize code to check to see if entry exists, if not update / run geocode listener. Make sure no duplicates happen.

export const orestarScraper: APIGatewayProxyHandler = async () => {
  console.log('HOST!', process.env.DB_HOST, process.env.NODE_ENV);
  // const xlsFilename = await getOrestarFinanceData({ candidateName: 'Ted Wheeler' });
  const xlsFilename = './temp/XcelCNESearch.xls';

  const contributions = readXls(xlsFilename);
  console.log('got contributions');
  // const geocodedContributions = await geocodeContributions(contributions.slice(0, 2));

  await addContributions(contributions.slice(0, 2));
  console.log('done!');

  return {
    statusCode: 200,
    body: JSON.stringify({
      content: contributions.slice(0, 2),
    }, null, 2),
  };
};

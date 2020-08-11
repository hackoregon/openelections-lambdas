import 'source-map-support/register';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { readXls } from '@services/readXls';
// import getOrestarFinanceData from '@services/getOrestarFinanceData';
// import { geocodeContributions } from '@services/geocodeContributions';
import { addContributions } from '@services/addContributions';

export const orestarScraper: APIGatewayProxyHandler = async () => {
  console.log('HOST!', process.env.DB_HOST, process.env.NODE_ENV);
  // const xlsFilename = await getOrestarFinanceData({ candidateName: 'Ted Wheeler' });
  const xlsFilename = './temp/XcelCNESearch.xls';

  const contributions = readXls(xlsFilename);
  console.log('got contributions');
  // const geocodedContributions = await geocodeContributions(contributions.slice(0, 1));

  await addContributions(contributions.slice(0, 2));
  console.log('done!');

  return {
    statusCode: 200,
    body: JSON.stringify({
      content: contributions,
    }, null, 2),
  };
};

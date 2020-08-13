import 'source-map-support/register';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { readXls } from '@services/readXls';
import getOrestarFinanceData from '@services/getOrestarFinanceData';
import { addContributions } from '@services/addContributions';

export const orestarScraper: APIGatewayProxyHandler = async () => {
  console.log('HOST!', process.env.DB_HOST, process.env.NODE_ENV);
  const xlsFilename = await getOrestarFinanceData({ candidateName: 'Ted Wheeler' });
  const contributions = readXls(xlsFilename);
  console.log('got contributions');
  await addContributions(contributions.slice(0, 2)); // Only run 2
  console.log('done!');

  return {
    statusCode: 200,
    body: JSON.stringify({
      content: contributions.slice(0, 2),
    }, null, 2),
  };
};

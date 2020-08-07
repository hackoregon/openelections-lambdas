import { APIGatewayProxyHandler } from 'aws-lambda';
import getOrestarFinanceData from '@services/getOrestarFinanceData';
import { readXls } from '@services/readXls';
import { geocodeContributions } from '@services/geocodeContributions';
import 'source-map-support/register';

export const orestarScraper: APIGatewayProxyHandler = async () => {
  const xlsFilename = await getOrestarFinanceData({ candidateName: 'Ted Wheeler' });
  const contributions = readXls(xlsFilename);
  console.log('got contributions');
  const geocodedContributions = await geocodeContributions(contributions.slice(0, 1));
  return {
    statusCode: 200,
    body: JSON.stringify({
      content: geocodedContributions,
    }, null, 2),
  };
};

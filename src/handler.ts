import { APIGatewayProxyHandler } from 'aws-lambda';
import getOrestarFinanceData from '@services/getOrestarFinanceData';
import { readXls } from '@services/readXls';
import { geocodeContributions } from '@services/geocodeContributions';
import 'source-map-support/register';

export const orestarScraper: APIGatewayProxyHandler = async () => {
  const xlsFilename = await getOrestarFinanceData({ candidateName: 'Ted Wheeler' });
  const contributions = readXls(xlsFilename);
  const geocodedContributions = geocodeContributions(contributions);
  return {
    statusCode: 200,
    body: JSON.stringify({
      content: geocodedContributions,
    }, null, 2),
  };
};

import { APIGatewayProxyHandler } from 'aws-lambda';
import getOrestarFinanceData from '@services/getOrestarFinanceData';
import 'source-map-support/register';

export const orestarScraper: APIGatewayProxyHandler = async () => {
  const stuff = await getOrestarFinanceData({ candidateName: 'Ted Wheeler' });
  return {
    statusCode: 200,
    body: JSON.stringify({
      content: stuff,
    }, null, 2),
  };
};

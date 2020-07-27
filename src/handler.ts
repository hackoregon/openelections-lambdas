import { APIGatewayProxyHandler } from 'aws-lambda';
import { runScraper } from '@services/scrape';
import 'source-map-support/register';

export const orestarScraper: APIGatewayProxyHandler = async () => {
  const stuff = await runScraper();
  return {
    statusCode: 200,
    body: JSON.stringify({
      headers: stuff,
    }, null, 2),
  };
};

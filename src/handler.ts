import 'source-map-support/register';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { parseAndSaveContributionData } from '@services/parseAndSaveContributionData';
import getOrestarFinanceData from '@services/getOrestarFinanceData';

export const orestarScraper: APIGatewayProxyHandler = async () => {
  const xlsFilename = await getOrestarFinanceData({ candidateName: 'Ted Wheeler' });
  await parseAndSaveContributionData(xlsFilename);

  return {
    statusCode: 200,
    body: JSON.stringify({
      content: 'done!',
    }, null, 2),
  };
};

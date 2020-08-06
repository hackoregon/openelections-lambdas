import { APIGatewayProxyHandler } from 'aws-lambda';
import getOrestarFinanceData from '@services/getOrestarFinanceData';
import 'source-map-support/register';
import { readXls } from '@services/readXls';

export const orestarScraper: APIGatewayProxyHandler = async () => {
  const xlsFilename = await getOrestarFinanceData({ candidateName: 'Ted Wheeler' });
  const financeData = readXls(xlsFilename);
  return {
    statusCode: 200,
    body: JSON.stringify({
      content: financeData,
    }, null, 2),
  };
};

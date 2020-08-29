import type { APIGatewayProxyHandler } from 'aws-lambda';
import { parseAndSaveContributionData } from '@services/parseAndSaveContributionData';
import getOrestarFinanceData from '@services/getOrestarFinanceData';
import type { OrestarEntry } from '@services/types';

export const orestarScraper: APIGatewayProxyHandler = async () => {
  const orestarData: OrestarEntry[] = await getOrestarFinanceData({ candidateName: 'Ted Wheeler' });
  await fetch(process.env.UPDATE_LAMBDA, {
    method: 'post',
    body:    JSON.stringify(orestarData),
    headers: { 'Content-Type': 'application/json' },
  })
  return {
    statusCode: 200,
    body: JSON.stringify({
      content: 'done!',
    }, null, 2),
  };
};

export const updateDB: APIGatewayProxyHandler = async (event) => {
  const jsonData: OrestarEntry[] = JSON.parse(event.body);
  await parseAndSaveContributionData(jsonData);
  return {
    statusCode: 200,
    body: JSON.stringify({
      content: 'done!',
    }, null, 2),
  };
}
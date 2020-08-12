import db from '@models/db';
import { ExternalContribution } from '@models/entity/ExternalContribution';
import { OrestarContribution } from '@services/readXls';

export async function addContributions(contributions: OrestarContribution[]): Promise<void> {
  try {
    console.log('attempting to save');
    const connection = await db();
    const contributionRepository = connection.getRepository('external_contributions');

    console.log('have repository');
    await Promise.all(contributions.map(async (contribution: OrestarContribution) => {

      const oaeContribution = new ExternalContribution();
      Object.assign(oaeContribution, contribution);

      if (await oaeContribution.isValidAsync()) {
        // TODO: handle update
        await contributionRepository.save(oaeContribution);
      }
    }));
  } catch (error) {
    // TODO: handle error
    console.log('error saving data!', error);
    throw error;
  }
}

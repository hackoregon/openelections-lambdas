import db from '@models/db';
import { Contribution } from '@models/entity/Contribution';
import { OrestarContribution } from '@services/readXls';

export async function addContributions(contributions: OrestarContribution[]): Promise<void> {
  try {
    const connection = await db();
    const contributionRepository = connection.getRepository(Contribution);
    await Promise.all(contributions.map(async (contribution: OrestarContribution) => {
      // const oaeContribution = {
      //   ...contribution,
      //   ...new Contribution()
      // }
      const oaeContribution = new Contribution();
      Object.keys(contribution).forEach((key: string) => { oaeContribution[key] = contribution[key]; });

      if (await oaeContribution.isValidAsync()) {
        contributionRepository.update();
      }
    }));
  } catch (error) {
    // TODO: handle error
  }
}

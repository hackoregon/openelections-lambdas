import db from '@models/db';
import { ExternalContribution } from '@models/entity/ExternalContribution';
import { OrestarContribution } from '@services/readXls';

export async function addContributions(contributions: OrestarContribution[]): Promise<void> {
  try {
    console.log('attempting to save');
    const connection = await db();

    // const oaeContributions = contributions.map((contributionData) => {
    //   const contribution = new ExternalContribution();
    //   Object.assign(contribution, contributionData);
    //   return contribution;
    // });

    // await connection.transaction(async (manager) => {
    //   console.log('connected to db');
    //   // TODO: handle updates...
    //   manager.save(oaeContributions);
    // });

    const contributionRepository = connection.getRepository(ExternalContribution);

    console.log('have repository');
    await Promise.all(contributions.map(async (contribution: OrestarContribution) => {

      const oaeContribution = new ExternalContribution();
      Object.assign(oaeContribution, contribution);

      if (await oaeContribution.isValidAsync()) {
        // TODO: handle update
        contributionRepository.save(oaeContribution);
      }
    }));
  } catch (error) {
    // TODO: handle error
    console.log('error saving data!', error.name, error.message);
    console.log(error.stack);
    throw error;
  }
}

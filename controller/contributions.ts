import db from "@models/db";
import { Contribution } from "@models/entity/Contribution";

export async function addContributions (contributions: Contribution[]): Promise<void> {
  try {
    const connection = await db();
    const contributionRepository = connection.getRepository(Contribution)
    await Promise.all(contributions.map( async (contribution: Contribution) => {
      const oaeContribution = {
        ...contribution,
        ...new Contribution()
      }
      if (await oaeContribution.isValidAsync()) {
        contributionRepository.update()
      }
    }))
  } catch (error) {
    
  }
}
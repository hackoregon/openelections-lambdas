import { ExternalContribution, ContributionType, ContributionSubType, ContributorType } from "@models/entity/ExternalContribution";
import * as faker from 'faker'

export async function newContributionAsync(): Promise<ExternalContribution> {
  let contribution = new ExternalContribution();
  contribution.orestarOriginalId = '1'
  contribution.orestarTransactionId = '1'
  contribution.address1 = faker.address.streetAddress();
  contribution.amount = faker.finance.amount(1, 500, 2);
  contribution.city = 'Portland';
  contribution.type = ContributionType.CONTRIBUTION;
  contribution.subType = ContributionSubType.CASH;
  contribution.state = 'OR';
  contribution.zip = '97214';
  contribution.contributorType = ContributorType.INDIVIDUAL;
  contribution.date = faker.date.past(1);
  // const contributionRepository = getConnection('default').getRepository('external_contributions');
  // contribution = await contributionRepository.save(contribution);
  // if (process.env.NODE_ENV != 'test') {
  //     console.log('saving contribution', contribution.id);
  // }
  return contribution;
}
import { ContributionType, ContributionSubType, ContributorType, IContributionSummary } from "../models/entity/ExternalContribution";
import * as faker from 'faker'

export function newContributionAsync(): IContributionSummary {
  const oaeEntry: IContributionSummary = {
    orestarOriginalId: '1',
    orestarTransactionId: '1',
    type: ContributionType.CONTRIBUTION,
    subType: ContributionSubType.CASH,
    contributorType: ContributorType.INDIVIDUAL,
    date: new Date(),
    amount: 500.00,
    name: faker.name.findName(),
    occupation: '',
    employerName: 'Random Employer',
    employerCity: 'Portland',
    employerState: 'OR',
    address1: faker.address.streetAddress(),
    city: 'Portland',
    state: 'OR',
    zip: '97214',
    country: 'USA',
  };
  return oaeEntry;
}
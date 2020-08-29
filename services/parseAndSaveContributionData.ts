import {
  ContributionType,
  ContributionSubType,
  ContributorType,
  IContributionSummary,
} from '@models/entity/ExternalContribution';
import db from '@models/db';
import addContribution from '@services/addContribution';
import { reportError } from './bugSnag';
import type { OrestarEntry } from './types';

function getContributionSubType(orestarSubType: string): ContributionSubType {
  const subTypeMap = {
    'Cash Contribution': ContributionSubType.CASH,
    'In-Kind Contribution': ContributionSubType.INKIND_CONTRIBUTION,
    'In-Kind/Forgiven Personal Expenditures': ContributionSubType.INKIND_FORGIVEN_PERSONAL,
    'In-Kind/Forgiven Account Payable': ContributionSubType.INKIND_FORGIVEN_ACCOUNT,
    // The following subtypes from Orestar are not tracked in OAE
    'Loan Received (Non-Exempt)': ContributionSubType.OTHER,
    'Pledge of Loan': ContributionSubType.OTHER,
    'Pledge of In-Kind': ContributionSubType.OTHER,
  };
  const oaeSubType = subTypeMap[orestarSubType];
  if (!oaeSubType) {
    reportError(new Error(`${orestarSubType} subtype is not being tracked!`));
  }
  return oaeSubType;
}

function getContributorType(orestarBookType: string): ContributorType {
  const contributorTypeMap = {
    Individual: ContributorType.INDIVIDUAL,
    'Business Entity': ContributorType.BUSINESS,
    'Labor Organization': ContributorType.LABOR,
    'Political Committee': ContributorType.POLITICAL_COMMITTEE,
    Other: ContributorType.OTHER,
    'Candidate & Immediate Family': ContributorType.FAMILY,
    'Unregistered Committee': ContributorType.UNREGISTERED,
    'Political Party Committee': ContributorType.POLITICAL_PARTY,
  };
  const oaeContributorType = contributorTypeMap[orestarBookType];
  if (!oaeContributorType) {
    reportError(new Error(`${orestarBookType} contributorType is not being tracked!`));
  }
  return oaeContributorType;
}

export async function parseAndSaveContributionData(orestarData: OrestarEntry[]): Promise<void> {
  const connection = await db();
  const contributionRepo = connection.getRepository('external_contributions');

  console.log(`total contributions: ${orestarData.length}.`);

  Promise.all(orestarData.map(async (orestarEntry: OrestarEntry) => {
    const oaeEntry: IContributionSummary = {
      orestarOriginalId: orestarEntry['Original Id'],
      orestarTransactionId: orestarEntry['Tran Id'],
      type: ContributionType.CONTRIBUTION,
      subType: getContributionSubType(orestarEntry['Sub Type']),
      contributorType: orestarEntry['Book Type'] ? getContributorType(orestarEntry['Book Type']) : undefined,
      date: new Date(orestarEntry['Tran Date']),
      amount: orestarEntry.Amount,
      name: orestarEntry['Contributor/Payee'],
      occupation: orestarEntry['Occptn Txt'],
      employerName: orestarEntry['Emp Name'],
      employerCity: orestarEntry['Emp City'],
      employerState: orestarEntry['Emp State'],
      notes: orestarEntry['Purp Desc'],
      address1: orestarEntry['Addr Line1'],
      address2: orestarEntry['Addr Line2'],
      city: orestarEntry.City,
      state: orestarEntry.State,
      zip: orestarEntry.Zip,
      country: orestarEntry.Country,
    };

    // Orestar will auto-aggregate contributions of ~$100 and set the Contributor/Payee to Miscellaneous Cash Contributions $100 and under, while excluding Review By Name, Review Date, etc. This sets the address for these contributions to the State of Oregon's Elections Division address in Salem for OAE visualization purposes. OAE participants must submit each contribution independently, so this only applies to Orestar data. See: https://sos.oregon.gov/elections/Documents/orestarTransFiling.pdf page 13.
    if (orestarEntry['Contributor/Payee'].includes('Miscellaneous Cash Contributions $100 and under')) {
      oaeEntry.contributorType = ContributorType.INDIVIDUAL;
      oaeEntry.address1 = '255 Capitol St NE Suite 501';
      oaeEntry.city = 'Salem';
      oaeEntry.state = 'OR';
      oaeEntry.zip = '97310';
      oaeEntry.country = 'United States';
      oaeEntry.addressPoint = {
        type: 'Point',
        coordinates: [-123.0287679, 44.9392561]
      };
    }

    try {
      await addContribution(oaeEntry, contributionRepo);      
    } catch (error) {
      reportError(error);
    }
  }));
}

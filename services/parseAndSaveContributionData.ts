import XLSX from 'xlsx';
import {
  ContributionType,
  ContributionSubType,
  ContributorType,
  IContributionSummary,
} from '@models/entity/ExternalContribution';
import db from '@models/db';
import addContribution from '@services/addContribution';
import { reportError } from './bugSnag';

// We are not using the following from Orestar in the OAE database:
// 'Tran Status'
// 'Filer'
// 'Aggregate Amount': number;
// 'Filer Id'
// 'Attest By Name'
// 'Attest Date'
// 'Due Date'
// 'Tran Stsfd Ind'
// 'Filed By Name'
// 'Filed Date'
// 'Self Employ Ind'
// 'Review By Name'
// 'Review Date'
// 'Contributor/Payee Committee ID'
// Also refer to the Orestar User Manual for more info: https://sos.oregon.gov/elections/Documents/orestarTransFiling.pdf
type OrestarEntry = {
  'Tran Id': string; // 7 digit number, same as Original Id, unless entry was updated.
  'Original Id': string; // 7 digit number
  'Tran Date': string; // MM/DD/YYYY
  'Tran Status': 'Original' | 'Amended' | 'Deleted';
  'Filer': string;
  'Contributor/Payee': string;
  'Sub Type': string;
  'Amount': number;
  'Aggregate Amount': number;
  'Filer Id': string;
  'Attest By Name': string;
  'Attest Date': string;
  'Due Date': string;
  'Tran Stsfd Ind': string;
  'Filed By Name': string;
  'Filed Date': string;
  'Book Type': string;
  'Occptn Txt': string;
  'Emp Name': string;
  'Emp City': string;
  'Emp State': string;
  'Employ Ind': string;
  'Self Employ Ind'?: string;
  'Addr Line1': string;
  'Addr Line2'?: string;
  'City': string;
  'State': string;
  'Zip': string;
  'Country': string;
  'Review By Name'?: string;
  'Review Date'?: string;
  'Contributor/Payee Committee ID'?: string;
  'Purp Desc'?: string;
}

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

export async function parseAndSaveContributionData(xlsFilename: string): Promise<void> {
  const connection = await db();
  const contributionRepo = connection.getRepository('external_contributions');

  const workbook = XLSX.readFile(xlsFilename, {
    bookVBA: true,
    WTF: true,
    type: 'file',
  });
  const sheetName = workbook.SheetNames[0];
  const orestarData: OrestarEntry[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  console.log(`total contributions: ${orestarData.length}.`);

  await Promise.all(orestarData.map(async (orestarEntry: OrestarEntry) => {
    const oaeEntry: IContributionSummary = {
      orestarOriginalId: orestarEntry['Original Id'],
      orestarTransactionId: orestarEntry['Tran Id'],
      type: ContributionType.CONTRIBUTION,
      subType: getContributionSubType(orestarEntry['Sub Type']),
      contributorType: orestarEntry['Book Type'] ? getContributorType(orestarEntry['Book Type']) : undefined,
      // ensure pacific timezone regardless of server time
      date: new Date(new Date(orestarEntry['Tran Date']).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'short' })),
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
        coordinates: [-123.0287679, 44.9392561],
      };
    }

    try {
      await addContribution(oaeEntry, contributionRepo);
    } catch (error) {
      reportError(error);
    }
  })).then(() => console.log('Done!!!'));
}

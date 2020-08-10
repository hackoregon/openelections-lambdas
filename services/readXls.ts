import XLSX from 'xlsx';
import {
  IContributionSummary, ContributionType, ContributionStatus, ContributionSubType, ContributorType, Contribution,
} from '@models/entity/Contribution';

type OrestarEntry = {
  'Tran Id': string; // 7 digit number
  'Original Id': string; // 7 digit number, same as Tran Id, unless entry was updated.
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
    // 'Loan Received (Non-Exempt)': ContributionSubType.INKIND_CONTRIBUTION,
    // 'Pledge of Loan': ContributionSubType.INKIND_CONTRIBUTION,
    // 'Pledge of In-Kind': ContributionSubType.INKIND_CONTRIBUTION
  };
  const oaeSubType = subTypeMap[orestarSubType];
  if (!oaeSubType) {
    // TODO: reportError, handle missing subtypes
    console.log(`No subtype for ${orestarSubType}`);
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
    // TODO: reportError, do we want a default for when bookType is undefined?
    console.log(`No contributorType for ${orestarBookType}`);
  }
  return oaeContributorType;
}

export function readXls(xlsFilename: string): Contribution[] {
  const workbook = XLSX.readFile(xlsFilename, {
    bookVBA: true,
    WTF: true,
    type: 'file',
  });
  const sheetName = workbook.SheetNames[0];
  const orestarData: OrestarEntry[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const contributionData = orestarData.map((orestarEntry: OrestarEntry) => {
    // const oaeEntry = new Contribution();
    const oaeEntry: any = {};

    oaeEntry.orestarOriginalId = orestarEntry['Original Id'];
    oaeEntry.orestarTransactionId = orestarEntry['Tran Id'];

    oaeEntry.type = ContributionType.CONTRIBUTION;
    oaeEntry.subType = getContributionSubType(orestarEntry['Sub Type']);
    oaeEntry.contributorType = orestarEntry['Book Type'] ? getContributorType(orestarEntry['Book Type']) : undefined;

    oaeEntry.date = new Date(orestarEntry['Tran Date']);
    oaeEntry.amount = orestarEntry.Amount;
    // amount: orestarEntry['Aggregate Amount'] // ? do we need to track this?;

    oaeEntry.name = orestarEntry['Contributor/Payee']; // ? should we parse this into lastname firstname?
    oaeEntry.occupation = orestarEntry['Occptn Txt'];
    oaeEntry.employerName = orestarEntry['Emp Name'];
    oaeEntry.employerCity = orestarEntry['Emp City'];
    oaeEntry.employerState = orestarEntry['Emp State'];
    // employerCountry:  // ? always USA? should we use orestarEntry.Country?

    oaeEntry.notes = orestarEntry['Purp Desc'];

    oaeEntry.address1 = orestarEntry['Addr Line1'];
    oaeEntry.address2 = orestarEntry['Addr Line2'];
    oaeEntry.city = orestarEntry.City;
    oaeEntry.state = orestarEntry.State;
    oaeEntry.zip = orestarEntry.Zip;
    oaeEntry.country = orestarEntry.Country;

    // addressPoint: , // ! get from geoservice

    // Unused Fields:
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

    return oaeEntry;
  });

  return contributionData;
}
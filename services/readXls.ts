import XLSX from 'xlsx';
import {
  ContributionType,
  ContributionSubType,
  ContributorType
} from '@models/entity/ExternalContribution';

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

export type OrestarContribution = {
  orestarOriginalId: string;
  orestarTransactionId: string;
  type: ContributionType;
  subType: ContributionSubType;
  contributorType: ContributorType;
  date: Date;
  amount: number;
  name: string;
  occupation: string;
  employerName: string;
  employerCity: string;
  employerState: string;
  notes: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  addressPoint?: number[];
}

function getContributionSubType(orestarSubType: string): ContributionSubType {
  const subTypeMap = {
    'Cash Contribution': ContributionSubType.CASH,
    'In-Kind Contribution': ContributionSubType.INKIND_CONTRIBUTION,
    'In-Kind/Forgiven Personal Expenditures': ContributionSubType.INKIND_FORGIVEN_PERSONAL,
    'In-Kind/Forgiven Account Payable': ContributionSubType.INKIND_FORGIVEN_ACCOUNT,
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

export function readXls(xlsFilename: string): OrestarContribution[] {
  const workbook = XLSX.readFile(xlsFilename, {
    bookVBA: true,
    WTF: true,
    type: 'file',
  });
  const sheetName = workbook.SheetNames[0];
  const orestarData: OrestarEntry[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const contributionData = orestarData.map((orestarEntry: OrestarEntry) => {
    const oaeEntry: OrestarContribution = {
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
    return oaeEntry;
  });

  return contributionData;
}

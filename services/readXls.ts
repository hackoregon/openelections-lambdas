import XLSX from 'xlsx';
import { IContributionSummary, Contribution, ContributionType, ContributionSubType } from 'models/entity/Contribution';

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
  'City': string;
  'State': string;
  'Zip': string;
  'Country': string;
  'Review By Name'?: string;
  'Review Date'?: string;
  'Contributor/Payee Committee ID'?: string;
  'Addr Line2'?: string;
  'Purp Desc'?: string;
}

function getContributionSubType (orestarSubType: string): ContributionSubType {
  const subTypeMap = {
    'Cash Contribution': ContributionSubType.CASH,
    'In-Kind Contribution': ContributionSubType.INKIND_CONTRIBUTION,
    'In-Kind/Forgiven Personal Expenditures': ContributionSubType.INKIND_FORGIVEN_PERSONAL,
    'In-Kind/Forgiven Account Payable': ContributionSubType.INKIND_FORGIVEN_ACCOUNT,
    // 'Loan Received (Non-Exempt)': ContributionSubType.INKIND_CONTRIBUTION,
    // 'Pledge of Loan': ContributionSubType.INKIND_CONTRIBUTION,
    // 'Pledge of In-Kind': ContributionSubType.INKIND_CONTRIBUTION
  }
  const oaeSubType = subTypeMap[orestarSubType]
  if (!oaeSubType) {
    // reportError
    console.log(`No subtype for ${orestarSubType}`)
  }
  return oaeSubType
}

export function readXml (): any {
  const workbook = XLSX.readFile('temp/XcelCNESearch.xls', {
    bookVBA: true,
    WTF: true,
    type: 'file'
  })
  const sheetList = workbook.SheetNames
  const jsonFile: OrestarEntry[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetList[0]])
  jsonFile.forEach((orestarEntry: OrestarEntry) => {
    // Look into the following: Tran Status, Filer, 
    const oaeEntry: Contribution = {
      orestarOriginalId: orestarEntry['Original Id'],
      orestarTransactionId: orestarEntry['Tran Id'],
      date: new Date(orestarEntry['Tran Date']),
      type: ContributionType.CONTRIBUTION,
      subType: getContributionSubType(orestarEntry['Sub Type']),
    }
    
    console.log(oaeEntry)
    console.log(orestarEntry['Sub Type'])
  })
}
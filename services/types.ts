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
export type OrestarEntry = {
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
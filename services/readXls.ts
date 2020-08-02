import XLSX from 'xlsx';

type OrestarEntry = {
  'Tran Id': string; // 7 digit number
  'Original Id': string; // 7 digit number, same as Tran Id, unless entry was updated.
  'Tran Date': string; // MM/DD/YYYY
  'Tran Status': string;
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
  'Self Employ Ind': string;
  'Addr Line1': string;
  'City': string;
  'State': string;
  'Zip': string;
  'Country': string;
}

export function readXml (): any {
  const workbook = XLSX.readFile('temp/XcelCNESearch.xls', {
    bookVBA: true,
    WTF: true,
    type: 'file'
  })
  const sheetList = workbook.SheetNames
  const jsonFile: OrestarEntry[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetList[0]])
  console.log(jsonFile[0])
}
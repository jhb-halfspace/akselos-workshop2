export type InputRowType = {
  id: number;
  projectName: string;
  workPackage: string;
  workingHours: number;
  date: string;
};

export type TaskRowType = {
  id: number;
  projectName?: string;
  workPackage?: string;
  date: string;
  workingHours?: number;
  customerName?: string;
  marketSegment?: string;
  assetType?: string;
  employee: string;

  //for hour based mode
  sumOfWorkingHours?: number;
  status?: string;
};

export type ReportRowType = {
  id: number;
  customers: string;
  marketSegment: string;
  assetType: string;
  projectName: string;
  refCode: string;
  department: string;
  activities: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
};

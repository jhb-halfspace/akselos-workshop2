interface KeyValueStringType {
  value: number;
  label: string;
}

export type RecordStoreType = {
  currentUsers: UserType[];
  users: UserType[];
  departments: DepartmentType[];
  teams: TeamType[];
  projects: ProjectType[];
  recentProjects: KeyValueStringType[];
  records: RecordType[];
  userRecords: RecordType[];
  sumOfHours: SumRecordType[];
  workPackges: WorkPackgeType[];
  assets: AssetType[];
  activities: ActivityType[];
  sumOfWorkingHours: SumWorkingHoursType[];
  sumOfProjectWorkingHours: SumWorkingHoursType[];
};

export type AssetType = {
  customer_name: string;
  market_segment: string;
  project_id: number;
  asset_type: string;
};

export type ActivityType = {
  id: number;
  activity_name: string;
};

export type UserType = {
  id: number;
  user_name: string;
  department_id: number;
  team_id: number;
  position: string;
};

export type DepartmentType = {
  id: number;
  department_name: string;
};

export type TeamType = {
  id: number;
  name: string;
};

export type WorkPackgeType = {
  id: number;
  project_id: number;
  work_package_name: string;
  description: string;
};

export type ProjectType = {
  id: number;
  project_name: string;
  ref_code: string;
  department_id: number;
  activity: string;
};

export type RecordType = {
  id: number;
  user_id: number;
  project_id: number;
  work_package_id: number;
  date: string;
  working_hours: number;
};

export type SumRecordType = {
  project_id: number;
  month: string;
  sum: number;
};

export type SumWorkingHoursType = {
  id: number;
  total_working_hours: number;
  user_id?: number;
  project?: number;
  date?: string;
};

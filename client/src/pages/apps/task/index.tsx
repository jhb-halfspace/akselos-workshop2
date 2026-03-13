// ** React Imports
import { useCallback, useEffect, useState } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import {
  DataGrid,
  getGridStringOperators,
  GridColumns,
  GridComparatorFn,
  GridFilterInputValue,
} from "@mui/x-data-grid";

// ** Icon Imports
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

// ** Store Imports
import { useDispatch, useSelector } from "react-redux";

// ** Custom Components Imports
import PageHeader from "src/@core/components/page-header";
import { formatDateToAbbreviated, getDateString } from "src/@core/utils/get-dateString";
import TableHeader from "src/views/apps/task/TableHeader";

//** Hook */
import { useExportExcel } from "src/hooks/useExportExcel";

// ** Types Imports
import { AppDispatch, RootState } from "src/store";
import { TaskRowType } from "src/types/apps/inputTypes";

// ** Types
import { CircularProgress, Tooltip } from "@mui/material";
import { GridApiCommunity } from "@mui/x-data-grid/models/api/gridApiCommunity";
import { format } from "date-fns";
import { MutableRefObject } from "preact/compat";
import { convertStringToDate } from "src/@core/utils/get-dateString";
import { useAuth } from "src/hooks/useAuth";
import {
  fetchCurrentUsers,
  fetchRecordsByUserIds,
  fetchSumOfEmployeeWorkingHours,
  fetchSumOfProjectsWorkingHours,
} from "src/store/apps/record";
import {
  AssetType,
  ProjectType,
  RecordType,
  SumWorkingHoursType,
  UserType,
  WorkPackgeType,
} from "src/types/apps/recordTypes";
import { DateType } from "src/types/forms/reactDatepickerTypes";
import AddEntityDialog from "src/views/apps/task/AddEntityDialog";
import AddProjectDialog from "src/views/apps/task/AddProjectDialog";
import GridToolbarCustom from "src/views/apps/task/GridToolbarCustom";

interface CellType {
  row: TaskRowType;
}
const StyledChip = styled(Chip)(({ theme }) => ({
  justifyContent: "left",
  "& .icon": {
    color: "inherit",
  },
  background: "none",
  fontWeight: 600,
  color: theme.palette.mode === "light" ? "rgba(0,0,0,.85)" : "rgba(255,255,255,0.85)",
  fontFamily: [
    "-apple-system",
    "BlinkMacSystemFont",
    '"Segoe UI"',
    "Roboto",
    '"Helvetica Neue"',
    "Arial",
    "sans-serif",
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(","),
  WebkitFontSmoothing: "auto",
  letterSpacing: "normal",

  "&.OnSchedule": {
    color: theme.palette.customColors.tooltipBg,
  },
  "&.Underworked": {
    color: theme.palette.warning.dark,
    border: `1px solid ${theme.palette.warning.main}`,
  },
  "&.Overtime": {
    color: theme.palette.error.dark,
    border: `1px solid ${theme.palette.error.main}`,
    ReportProblemIcon: theme.palette.error.main,
  },
}));

const TextWithTooltip = ({ text }: { text: string }) => {
  return (
    <Tooltip title={text}>
      <Typography style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</Typography>
    </Tooltip>
  );
};

const TaskManagement = () => {
  // ** State
  const [value, setValue] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [rowsTask, setRowsTask] = useState<TaskRowType[]>([]);

  const [endDate, setEndDate] = useState<DateType>(new Date());
  const [startDate, setStartDate] = useState<DateType>(
    endDate == null ? null : new Date(endDate.getTime() - 86400000 * 30),
  );
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [openTaskMode, setOpenTaskMode] = useState<boolean>(true);

  // ** Hook
  const { handleExportExcel } = useExportExcel();

  const dayComparator: GridComparatorFn<Date> = (v1, v2) => {
    return convertStringToDate(v1) - convertStringToDate(v2);
  };

  const customStringOperators = [
    ...getGridStringOperators(),
    {
      label: "not in",
      value: "notIn",
      getApplyFilterFn: (filterItem, column) => {
        if (!filterItem.columnField || !filterItem.value || !filterItem.operatorValue) {
          return null;
        }

        // Split input by comma, trim and lowercase for comparison
        const filterValues = filterItem.value.split(",").map(v => v.trim().toLowerCase());

        return params => {
          const rowValue = column.valueGetter ? column.valueGetter(params) : params.value;

          const value = rowValue?.toString().toLowerCase() || "";

          return !filterValues.includes(value);
        };
      },
      InputComponent: GridFilterInputValue,
    },
  ];

  const taskBasedColumn: GridColumns<TaskRowType> = [
    {
      flex: 0.25,
      field: "employee",
      minWidth: 140,
      headerName: "Employee",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.employee} />,
      filterOperators: customStringOperators,
    },
    {
      flex: 0.25,
      field: "projectName",
      minWidth: 150,
      headerName: "Project",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.projectName ?? ""} />,
      filterOperators: customStringOperators,
      hide: !openTaskMode,
    },
    {
      flex: 0.25,
      field: "workPackage",
      minWidth: 150,
      headerName: "Work Package",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.workPackage ?? ""} />,
      filterOperators: customStringOperators,
      hide: !openTaskMode,
    },
    {
      flex: 0.25,
      field: "customerName",
      minWidth: 150,
      headerName: "Customer Name",
      align: "center",
      headerAlign: "center",
      hide: true,
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.customerName ?? ""} />,
    },
    {
      flex: 0.25,
      field: "marketSegment",
      minWidth: 150,
      headerName: "Market Segment",
      align: "center",
      headerAlign: "center",
      hide: true,
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.marketSegment ?? ""} />,
    },
    {
      flex: 0.25,
      field: "assetType",
      minWidth: 150,
      headerName: "Asset Type",
      align: "center",
      headerAlign: "center",
      hide: true,
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.assetType ?? ""} />,
    },
    {
      flex: 0.25,
      field: "date",
      minWidth: 150,
      headerName: "Date",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <Typography>{formatDateToAbbreviated(row.date)}</Typography>,
      sortComparator: dayComparator,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "workingHours",
      headerName: "Working Hours",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => {
        return <Typography>{row.workingHours}</Typography>;
      },
      hide: !openTaskMode,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "sumOfWorkingHours",
      headerName: "Sum Of Working Hours",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => {
        return <Typography>{row.sumOfWorkingHours}</Typography>;
      },
      hide: openTaskMode === true,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "status",
      headerName: "Status",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => (
        <StyledChip
          className={row.status}
          icon={
            row.status === "OnSchedule" ? (
              <DoneIcon className='icon' />
            ) : row.status === "Overtime" ? (
              <ReportProblemIcon className='icon' />
            ) : (
              <ErrorIcon className='icon' />
            )
          }
          size='small'
          label={row.status === "OnSchedule" ? "On Schedule" : row.status}
        />
      ),
      hide: openTaskMode === true,
    },
  ];

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state.record);
  const { logout } = useAuth();
  const [openProjectDialog, setOpenProjectDialog] = useState<boolean>(false);
  const [openWorkPackageDialog, setOpenWorkPackageDialog] = useState<boolean>(false);

  const handleProjectDialogOpen = () => setOpenProjectDialog(true);
  const handleProjectDialogClose = () => setOpenProjectDialog(false);

  const handleWorkPackageDialogOpen = () => setOpenWorkPackageDialog(true);
  const handleWorkPackageDialogClose = () => setOpenWorkPackageDialog(false);

  useEffect(() => {
    if (store.currentUsers.length > 0 && initialLoad) {
      const { id, user_name, position } = store.currentUsers[0];
      setUserName(user_name);
      setPosition(position);
      setSelectedUsers([id]);
      setInitialLoad(false);
    }
    const _projectMap: { [id: number]: string } = store.projects.reduce(
      (obj, pr: ProjectType) => ({ ...obj, [pr.id]: pr.project_name }),
      {},
    );
    const _workPackageMap: { [id: number]: string } = store.workPackges.reduce(
      (obj, wp: WorkPackgeType) => ({ ...obj, [wp.id]: wp.work_package_name }),
      {},
    );
    const _userMap: { [id: number]: string } = store.users.reduce(
      (obj, u: UserType) => ({ ...obj, [u.id]: u.user_name }),
      {},
    );

    //Prepare data for render

    if (openTaskMode) {
      setRowsTask(
        store.records.map((r: RecordType) => {
          const asset = store.assets.find((a: AssetType) => a.project_id === r.project_id);
          return {
            id: r.id,
            projectName: _projectMap[r.project_id],
            workPackage: _workPackageMap[r.work_package_id],
            date: format(new Date(r.date), "yyyy-MM-dd"),
            workingHours: r.working_hours,
            customerName: asset,
            marketSegment: asset ? (asset as AssetType).market_segment : "",
            assetType: asset ? (asset as AssetType).asset_type : "",
            employee: _userMap[r.user_id],
          };
        }),
      );
    } else {
      setRowsTask(
        store.sumOfWorkingHours.map((r: SumWorkingHoursType, index: number) => {
          return {
            id: index,
            employee: _userMap[Number(r.user_id)],
            date: format(new Date(r.date ?? ""), "yyyy-MM-dd"),
            sumOfWorkingHours: r.total_working_hours,
            status: r.total_working_hours === 8 ? "OnSchedule" : r.total_working_hours > 8 ? "Overtime" : "Underworked",
          };
        }),
      );
    }
    setTimeout(() => {
      setLoading(false);
    }, 300);
    // eslint-disable-next-line
  }, [store, openTaskMode, selectedUsers]);

  useEffect(() => {
    if (startDate && endDate) {
      const startDateString = getDateString(startDate);
      const endDateString = getDateString(endDate);
      const userData = window.localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (user != null && user.user_name) {
        dispatch(fetchCurrentUsers({ user_name: user.user_name }));
        dispatch(
          fetchRecordsByUserIds({
            user_ids: `${selectedUsers.join(",")}`,
            start_date: startDateString,
            end_date: endDateString,
          }),
        );
        dispatch(
          fetchSumOfEmployeeWorkingHours({
            user_ids: `${selectedUsers.join(",")}`,
            start_date: startDateString,
            end_date: endDateString,
          }),
        );
        dispatch(
          fetchSumOfProjectsWorkingHours({
            user_ids: `${selectedUsers.join(",")}`,
            start_date: startDateString,
            end_date: endDateString,
          }),
        );
      } else {
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, position, selectedUsers]);

  const handleFilter = useCallback((val: string) => {
    setValue(val);
  }, []);

  const addProjectDialogProps = {
    departments: store.departments,
    activities: store.activities,
    projects: store.projects,
    openProjectDialog,
    handleProjectDialogClose,
    dispatch,
  };
  const addWorkPackageDialogProps = {
    child: "Work Package",
    childs: store.workPackges,
    parent: "Project",
    parents: store.projects,
    openEntityDialog: openWorkPackageDialog,
    handleEntityDialogClose: handleWorkPackageDialogClose,
    dispatch,
  };

  const mapProjectName = (id: number) => {
    const project = store.projects.find((proj: ProjectType) => proj.id === id);
    if (project) return (project as ProjectType).project_name;
  };
  const mapUserName = (id: number) => {
    const user = store.users.find((user: UserType) => user.id === id);
    if (user) return (user as UserType)?.user_name;
  };

  const generateReport = () => {
    const modifiedSumOfProjectWH = store.sumOfProjectWorkingHours.map((row: SumWorkingHoursType) => ({
      name: mapProjectName(row.project ?? 0),
      total_working_hours: row.total_working_hours,
    }));

    const modifiedSumOfEmpWH = store.sumOfWorkingHours.map((row: SumWorkingHoursType) => ({
      name: mapUserName(row.user_id ?? 0),
      date: row.date,
      total_working_hours: row.total_working_hours,
      status: row.total_working_hours === 8 ? "On Schedule" : row.total_working_hours > 8 ? "Overtime" : "Underworked",
    }));
    const dayOffData = store.sumOfWorkingHours.filter((item: SumWorkingHoursType) => item.total_working_hours === 0);
    const dayOffs = dayOffData.map((row: SumWorkingHoursType) => ({
      name: mapUserName(row.user_id ?? 0),
      date: row.date,
    }));

    const exportData = [modifiedSumOfProjectWH, modifiedSumOfEmpWH, dayOffs];

    handleExportExcel({
      fileName: "summaryReport",
      headerName: [
        [["PROJECT NAME", "TOTAL WORKING HOURS"]],
        [["EMPLOYEE NAME", "DATE", "WORKING HOURS", "STATUS"]],
        [["EMPLOYEE NAME", "DATE"]],
      ],
      workSheetName: ["Project Working Hours", "Employee Working Hours", "Day-Offs"],
      data: exportData,
    });
  };

  const exportCurrentTable = (apiRef: MutableRefObject<GridApiCommunity>) => {
    const visibleColumns = apiRef.current.getVisibleColumns();
    const visibleRows = Array.from(apiRef.current.getVisibleRowModels().values());

    const valuesToExport: Object[] = visibleRows.map(row => {
      const rowData: Record<string, any> = {};
      visibleColumns.forEach(column => {
        rowData[column.field] = row[column.field];
      });
      return rowData;
    });

    handleExportExcel({
      fileName: "Akselos - The Fastest Engineering Simulation Technology",
      headerName: [
        [visibleColumns.map(column => column.headerName).filter((name): name is string => name !== undefined)],
      ],
      workSheetName: ["Report"],
      data: [valuesToExport],
    });
  };

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader
            title={<Typography variant='h5'>Task Management</Typography>}
            subtitle={<Typography variant='body2'>Tasks for a specific date range are shown below.</Typography>}
          />
        </Grid>
        <Grid item xs={12}>
          <Card>
            <TableHeader
              value={value}
              handleFilter={handleFilter}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              store={store}
              userName={userName}
              position={position}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
            />
            {loading ? (
              <Box sx={{ mt: 6, display: "flex", alignItems: "center", flexDirection: "column" }}>
                <CircularProgress disableShrink sx={{ mt: 6 }} />
                <Typography>Loading...</Typography>
              </Box>
            ) : (
              <DataGrid
                initialState={{
                  sorting: {
                    sortModel: [{ field: "date", sort: "desc" }],
                  },
                }}
                sortingOrder={["desc", "asc"]}
                autoHeight
                rows={rowsTask}
                rowHeight={52}
                columns={taskBasedColumn}
                showCellRightBorder={true}
                showColumnRightBorder={true}
                components={{ Toolbar: GridToolbarCustom }}
                componentsProps={{
                  toolbar: {
                    userName,
                    position,
                    handleProjectDialogOpen,
                    handleWorkPackageDialogOpen,
                    setOpenTaskMode,
                    generateReport,
                    exportCurrentTable,
                  },
                }}
                pageSize={pageSize}
                disableSelectionOnClick
                rowsPerPageOptions={[10, 25, 100]}
                onPageSizeChange={newPageSize => setPageSize(newPageSize)}
                sx={{ "& .MuiDataGrid-columnHeaders": { borderRadius: 0 } }}
                experimentalFeatures={{ newEditingApi: true }}
                showRowLines={true}
                showBorders={true}
              />
            )}
            <AddProjectDialog {...addProjectDialogProps} />
            <AddEntityDialog {...addWorkPackageDialogProps} />
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default TaskManagement;

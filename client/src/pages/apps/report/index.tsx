// ** React Imports
import { useState, useEffect } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Typography from "@mui/material/Typography";

// ** Store Imports
import { useDispatch, useSelector } from "react-redux";

// ** Custom Components Imports
import PageHeader from "src/@core/components/page-header";

// ** Types Imports
import { RootState, AppDispatch } from "src/store";
import { ReportRowType } from "src/types/apps/inputTypes";

// ** Types
import { AssetType, RecordStoreType, SumRecordType } from "src/types/apps/recordTypes";
import { CircularProgress, Tooltip } from "@mui/material";
import { useAuth } from "src/hooks/useAuth";
import { fetchSumOfHours } from "src/store/apps/record";

interface CellType {
  row: ReportRowType;
}

const TextWithTooltip = ({ text }: { text: string }) => {
  return (
    <Tooltip title={text}>
      <Typography style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</Typography>
    </Tooltip>
  );
};

const Report = () => {
  // ** State
  const [pageSize, setPageSize] = useState<number>(10);
  const [rows, setRows] = useState<ReportRowType[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultColumns = [
    {
      flex: 0.25,
      field: "customers",
      minWidth: 150,
      headerName: "Customers",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.customers} />,
    },
    {
      flex: 0.25,
      field: "activities",
      minWidth: 100,
      headerName: "Activities",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.activities} />,
    },
    {
      flex: 0.25,
      field: "marketSegment",
      minWidth: 150,
      headerName: "Market Segment",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.marketSegment} />,
    },
    {
      flex: 0.25,
      field: "assetType",
      minWidth: 150,
      headerName: "Asset Type",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.assetType} />,
    },
    {
      flex: 0.25,
      field: "projectName",
      minWidth: 150,
      headerName: "Project Names",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.projectName} />,
    },
    {
      flex: 0.25,
      field: "refCode",
      minWidth: 140,
      headerName: "Ref Code",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.refCode} />,
    },
    {
      flex: 0.25,
      field: "department",
      minWidth: 150,
      headerName: "Department",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => <TextWithTooltip text={row.department} />,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "jan",
      headerName: "January",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.jan}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "feb",
      headerName: "February",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.feb}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "mar",
      headerName: "March",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.mar}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "apr",
      headerName: "April",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.apr}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "may",
      headerName: "May",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.may}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "jun",
      headerName: "June",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.jun}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "jul",
      headerName: "July",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.jul}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "aug",
      headerName: "August",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.aug}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "sep",
      headerName: "September",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.sep}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "oct",
      headerName: "October",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.oct}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "nov",
      headerName: "November",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.nov}</Typography>,
    },
    {
      flex: 0.25,
      minWidth: 150,
      field: "dec",
      headerName: "December",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => <Typography variant='body2'>{row.dec}</Typography>,
    },
  ];

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state.record as RecordStoreType);
  const { logout } = useAuth();

  const getSumHours = (hoursMap: any, project_id: number, month: number) => {
    return hoursMap && hoursMap[month]
      ? hoursMap[month][project_id]
        ? hoursMap[month][project_id].toFixed(2)
        : ""
      : "";
  };

  useEffect(() => {
    const _sumHoursMap = store.sumOfHours.reduce((obj: any, current: SumRecordType, id: number) => {
      const { project_id, month, sum } = current;

      return {
        ...obj,
        [month]: {
          ...obj[month],
          [project_id]: sum,
        },
      };
    }, {});

    const _projectMap: { [id: number]: string } = store.projects.reduce(
      (obj, pr) => ({ ...obj, [pr.id]: pr.project_name }),
      {},
    );
    const _departmentMap: { [id: number]: string } = store.departments.reduce(
      (obj, u) => ({ ...obj, [u.id]: u.department_name }),
      {},
    );

    setRows(
      store.assets.map((asset: AssetType, id: number) => {
        const project = store.projects.find(p => p.id === asset.project_id);

        return {
          id,
          customers: asset.customer_name,
          marketSegment: asset.market_segment,
          assetType: asset.asset_type,
          projectName: _projectMap[asset.project_id],
          refCode: project ? project?.ref_code : "",
          department: project ? _departmentMap[project?.department_id] : "",
          activities: project ? project?.activity : "",
          jan: getSumHours(_sumHoursMap, asset.project_id, 1),
          feb: getSumHours(_sumHoursMap, asset.project_id, 2),
          mar: getSumHours(_sumHoursMap, asset.project_id, 3),
          apr: getSumHours(_sumHoursMap, asset.project_id, 4),
          may: getSumHours(_sumHoursMap, asset.project_id, 5),
          jun: getSumHours(_sumHoursMap, asset.project_id, 6),
          jul: getSumHours(_sumHoursMap, asset.project_id, 7),
          aug: getSumHours(_sumHoursMap, asset.project_id, 8),
          sep: getSumHours(_sumHoursMap, asset.project_id, 9),
          oct: getSumHours(_sumHoursMap, asset.project_id, 10),
          nov: getSumHours(_sumHoursMap, asset.project_id, 11),
          dec: getSumHours(_sumHoursMap, asset.project_id, 12),
        };
      }),
    );
    setTimeout(() => {
      setLoading(false);
    }, 300);

    // eslint-disable-next-line
  }, [store]);

  useEffect(() => {
    const user = JSON.parse(window.localStorage.getItem("user") as string);

    if (user == null || !user.user_name) {
      logout();
    } else {
      dispatch(fetchSumOfHours({}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = [...defaultColumns];

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader
            title={<Typography variant='h5'>Report</Typography>}
            subtitle={<Typography variant='body2'>Time recording report is shown below.</Typography>}
          />
        </Grid>
        <Grid item xs={12}>
          <Card>
            <Box
              sx={{ p: 5, pb: 3, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "right" }}
            />
            {loading ? (
              <Box sx={{ mt: 6, display: "flex", alignItems: "center", flexDirection: "column" }}>
                <CircularProgress disableShrink sx={{ mt: 6 }} />
                <Typography>Loading...</Typography>
              </Box>
            ) : (
              <DataGrid
                autoHeight
                rows={rows}
                rowHeight={52}
                columns={columns}
                components={{ Toolbar: GridToolbar }}
                pageSize={pageSize}
                disableSelectionOnClick
                rowsPerPageOptions={[10, 25, 100]}
                onPageSizeChange={newPageSize => setPageSize(newPageSize)}
                sx={{ "& .MuiDataGrid-columnHeaders": { borderRadius: 0 } }}
                experimentalFeatures={{ newEditingApi: true }}

                // initialState={{
                //   pinnedColumns: {
                //     left: [
                //       "customers",
                //       "marketSegment",
                //       "assetType",
                //       "projectName",
                //       "refCode",
                //       "department",
                //       "activities",
                //     ],
                //   },
                // }}
              />
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default Report;

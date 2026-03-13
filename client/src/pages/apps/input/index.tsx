// ** React Imports
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
// ** MUI Imports
import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, styled, Tooltip, tooltipClasses, TooltipProps, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import { useRouter } from "next/router";

// ** Icon Imports
import RestoreIcon from "@mui/icons-material/Restore";
import Icon from "src/@core/components/icon";

// ** Store Imports
import { useDispatch, useSelector } from "react-redux";

// ** Custom Components Imports
import PageHeader from "src/@core/components/page-header";
import TableHeader from "src/views/apps/input/TableHeader";

// ** Types Imports
import { AppDispatch, RootState } from "src/store";
import { InputRowType } from "src/types/apps/inputTypes";

// ** Types
import {
  CircularProgress,
  DialogActions,
  DialogContentText,
  FormControl,
  FormHelperText,
  Grow,
  MenuItem,
  Paper,
  Popper,
  PopperPlacementType,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import toast from "react-hot-toast";
import { SettingsContext } from "src/@core/context/settingsContext";
import { formatTooltipContent } from "src/@core/utils/format-content";
import { formatDateToAbbreviated, getDateString } from "src/@core/utils/get-dateString";
import { isDateValid } from "src/@core/utils/isDateValid";
import { useAuth } from "src/hooks/useAuth";
import {
  addRecords,
  deleteBatchRecords,
  deleteRecord,
  fetchCurrentUsers,
  fetchRecentProjects,
  fetchRecords,
  fetchRecordsForCurrentUser,
  updateRecords,
} from "src/store/apps/record";
import { RecordStoreType, RecordType } from "src/types/apps/recordTypes";
import { DateType } from "src/types/forms/reactDatepickerTypes";
import AddDuplicateTaskDialog, { AddDuplicateTaskDialogProps } from "src/views/apps/input/AddDuplicateTaskDialog";
import GridToolbarCustom from "src/views/apps/input/GridToolbarCustom";
import ImportDialog from "src/views/apps/input/ImportDialog";

interface CellType {
  row: InputRowType;
}
interface WorkPackageOption {
  label: string;
  value: number;
}

interface KeyValueType {
  [key: number]: number;
}
interface KeyValueStringType {
  [key: number]: string;
}
const ITEM_HEIGHT = 120;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};
const styles = {
  TextField: {
    maxWidth: "250px",
    whiteSpace: "normal",
    margin: "15px 15px",
  },
  MenuItem: {
    maxWidth: "250px", // Set a maximum width for the MenuItem content
    whiteSpace: "normal",
    wordBreak: "break-word",
    margin: "15px 15px", // Add margin-bottom for spacing between menu items
    padding: "10px 0px",
  },
  Button: {
    lineHeight: "40px",
    maxWidth: "300px",
    margin: "10px 15px",
    border: 0,
    borderRadius: 3,
    color: "white",
    padding: "0 10px",
    fontSize: "12px",
    alignItems: "center",
  },
  recentButton: {
    background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  },
};

const DailyReport = () => {
  // ** State
  const [value, setValue] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [rows, setRows] = useState<InputRowType[]>([]);
  const [selectedProjectValue, setSelectedProjectValue] = useState<KeyValueType>({});
  const [selectedWorkPackageValue, setSelectedWorkPackageValue] = useState<KeyValueType>({});
  const [selectedWorkingHours, setSelectedWorkingHours] = useState<KeyValueType>({});
  const [projectValueOptions, setProjectValueOptions] = useState<{ value: number; label: string }[]>([]);
  const [workPackageValueOptions, setWorkPackageValueOptions] = useState<
    { value: number; label: string; project_id: number }[]
  >([]);
  const [prevDate, setPrevDate] = useState<DateType>(new Date());
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [rowIdTemp, setRowIdTemp] = useState(-1);
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [placement, setPlacement] = useState<PopperPlacementType>();
  const [arrowRef, setArrowRef] = useState(null);
  const [deletedId, setDeletedId] = useState(-1);
  const [displayError, setDisplayError] = useState(false);
  const [projectMap, setProjectMap] = useState<KeyValueStringType>({});
  const [workPackageMap, setWorkPackageMap] = useState<KeyValueStringType>({});
  const [rowIdsToDelete, setRowIdsToDelete] = useState<number[]>([]);
  const [showMenuItems, setShowMenuItems] = useState({
    recentProject: false,
    recentWorkPackage: false,
  });
  const [inputProject, setInputProject] = useState<KeyValueStringType>({});
  const [inputWorkPackage, setInputWorkPackage] = useState<KeyValueStringType>({});
  const [openImportDialog, setOpenImportDialog] = useState<boolean>(false);
  const [openDuplicateTaskDialog, setOpenDuplicateTaskDialog] = useState<boolean>(false);
  const handleImportDialogOpen = () => setOpenImportDialog(true);
  const handleImportDialogClose = () => setOpenImportDialog(false);
  const { settings } = useContext(SettingsContext);
  const theme = useTheme();
  const router = useRouter();
  const { selectedDate } = router.query;

  const [date, setDate] = useState<DateType>(selectedDate ? new Date(selectedDate as string) : new Date());

  useEffect(() => {
    if (selectedDate) {
      setDate(new Date(selectedDate as string));
    }
  }, [selectedDate]);

  const backgroundColor = useMemo(() => {
    return settings.mode === "dark" ? theme.palette.grey[100] : theme.palette.grey.A700;
  }, [settings.mode]);

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} placement='bottom' style={{ width: "100%", height: "100%" }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: backgroundColor,
      color: theme.palette.getContrastText(backgroundColor),
      maxWidth: 320,
      fontSize: theme.typography.pxToRem(16),
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
      border: "1px solid #dadde9",
    },
  }));

  const toggleMenuItems = (buttonName: string) => {
    setShowMenuItems(prevState => ({
      ...prevState,
      [buttonName as keyof typeof showMenuItems]: !prevState[buttonName as keyof typeof showMenuItems],
    }));
  };
  const handleKeyDown = (event: any) => {
    event.stopPropagation();
  };

  const renderTooltipButton = (option: WorkPackageOption) => {
    const content = store.workPackges.find(item => item.id === option.value)?.description;
    if (content)
      return (
        <HtmlTooltip title={formatTooltipContent(content)}>
          <Button
            sx={{
              color: theme.palette.primary.main,
            }}
            size='small'
          >
            <Icon icon='mdi:help' fontSize={20} />
          </Button>
        </HtmlTooltip>
      );
    else return <></>;
  };

  const defaultColumns = [
    {
      flex: 0.3,
      field: "projectName",
      headerName: "Project",
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }: CellType) => {
        //return list of projects matched keyword
        const listFilteredProject = projectValueOptions.filter(
          a => a.label !== "" && a.label.toLowerCase().includes((inputProject[row.id] || "").trim().toLowerCase()),
        );

        return (
          <FormControl error={selectedProjectValue[row.id] === 0 || selectedProjectValue[row.id] === null}>
            <Select
              onChange={(e: SelectChangeEvent) => {
                setIsEditing(true);
                setSelectedProjectValue((prev: any) => ({ ...prev, [row.id]: e.target.value }));
                if (!workPackageValueOptions.some(w => w.project_id?.toString() === e.target.value)) {
                  setSelectedWorkPackageValue(prev => ({ ...prev, [row.id]: 0 }));
                  setShowMenuItems({
                    recentProject: false,
                    recentWorkPackage: false,
                  });
                }
              }}
              sx={{ width: { xs: "210px", sm: "210px", md: "230px", lg: "260px", xl: "280px" } }}
              inputProps={{ "aria-label": "Project label" }}
              value={selectedProjectValue[row.id]?.toString() || ""}
              variant='standard'
              MenuProps={MenuProps}
            >
              <Button
                disabled={store.recentProjects.length === 0}
                sx={{ ...styles.Button, ...styles.recentButton }}
                onClick={() => toggleMenuItems("recentProject")}
                startIcon={<RestoreIcon />}
              >
                Most Recent
              </Button>
              {store.recentProjects.map(option => (
                <MenuItem
                  sx={styles.MenuItem}
                  style={{ display: showMenuItems.recentProject ? "block" : "none" }}
                  key={option.value}
                  value={option.value}
                  onClick={handleClose}
                >
                  {option.label}
                </MenuItem>
              ))}
              <br></br>
              <TextField
                sx={styles.TextField}
                onKeyDown={handleKeyDown}
                id='outlined-controlled'
                label='Search Project'
                variant='standard'
                autoComplete='off'
                onFocus={() => {
                  setShowMenuItems(prevState => ({
                    ...prevState,
                    ["recentProject"]: false,
                  }));
                }}
                color='info'
                focused
                value={inputProject[row.id]}
                onChange={(event: any) => {
                  setInputProject((prev: any) => ({ ...prev, [row.id]: event.target.value }));
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <SearchIcon color='info'></SearchIcon>
                    </InputAdornment>
                  ),
                }}
              />
              {listFilteredProject.map(option => (
                <MenuItem sx={styles.MenuItem} key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {selectedProjectValue[row.id] === 0 && displayError && (
              <FormHelperText id='component-error-text'>This field cannot be empty</FormHelperText>
            )}
          </FormControl>
        );
      },
    },
    {
      flex: 0.45,
      field: "workPackage",
      headerName: "Work Package",
      align: "center",
      headerAlign: "center",
      hide: Object.values(selectedProjectValue).every(
        spv => workPackageValueOptions.filter((option: any) => option.project_id === spv).length === 0,
      ),
      renderCell: ({ row }: CellType) => {
        const filteredWorkPackages = workPackageValueOptions.filter(
          (option: any) => option.project_id === selectedProjectValue[row.id],
        );

        // Recent Work Package List base on selected project
        const fetchRecentWorkPackage = () => {
          if (filteredWorkPackages.length > 0) {
            //length of list recent work package should > 0
            let unique = [];
            let recentWorkPackageID = store.userRecords
              .filter(a => a.project_id === selectedProjectValue[row.id])
              .map(a => a.work_package_id);

            const formattedWorkpackageID = recentWorkPackageID.filter(item => item !== 0);

            recentWorkPackageID = [...new Set(formattedWorkpackageID)];
            unique.push(...recentWorkPackageID);
            if (unique.length > 10) {
              unique = unique.slice(0, 10);
            }
            const recentWorkPackageList = unique.map(i => ({ value: i, label: workPackageMap[i] }));

            return recentWorkPackageList;
          }

          return [];
        };

        //return list of work packages matched keywords
        const filteredWorkPackagesBySearch = filteredWorkPackages.filter(a =>
          a.label.toLowerCase().includes((inputWorkPackage[row.id] || "").trim().toLowerCase()),
        );

        return (
          <FormControl
            error={filteredWorkPackages.length > 0 && selectedWorkPackageValue[row.id] === 0}
            sx={{ width: "100%" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                columnGap: 8,
                paddingX: 24,
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Select
                  sx={{
                    height: 40,
                    width: { xs: "210px", sm: "210px", md: "230px", lg: "260px", xl: "280px" },
                    flexGrow: 1,
                  }}
                  inputProps={{ "aria-label": "Work Package label" }}
                  value={selectedWorkPackageValue[row.id]?.toString() || ""}
                  onChange={(e: any) => {
                    setIsEditing(true);
                    setSelectedWorkPackageValue((prev: any) => ({ ...prev, [row.id]: e.target.value }));
                    setShowMenuItems({
                      recentProject: false,
                      recentWorkPackage: false,
                    });
                  }}
                  variant='standard'
                  disabled={filteredWorkPackages.length === 0}
                  MenuProps={MenuProps}
                >
                  <MenuItem disabled value={0}>
                    {workPackageValueOptions.filter((option: any) => option.project_id === selectedProjectValue[row.id])
                      .length === 0 && <em>None</em>}
                  </MenuItem>
                  <Button
                    disabled={fetchRecentWorkPackage().length === 0}
                    sx={{ ...styles.Button, ...styles.recentButton }}
                    onClick={() => toggleMenuItems("recentWorkPackage")}
                    startIcon={<RestoreIcon />}
                  >
                    Most Recent
                  </Button>
                  {fetchRecentWorkPackage().map(option => (
                    <MenuItem
                      style={{ display: showMenuItems.recentWorkPackage ? "block" : "none" }}
                      sx={styles.MenuItem}
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                  <br></br>
                  <TextField
                    sx={styles.TextField}
                    onKeyDown={handleKeyDown}
                    id='outlined-controlled'
                    label='Search Work Package'
                    variant='standard'
                    autoComplete='off'
                    onFocus={() => {
                      setShowMenuItems(prevState => ({
                        ...prevState,
                        ["recentWorkPackage"]: false,
                      }));
                    }}
                    color='info'
                    focused
                    value={inputWorkPackage[row.id]}
                    onChange={(event: any) => {
                      setInputWorkPackage(prev => ({ ...prev, [row.id]: event.target.value }));
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <SearchIcon color='info'></SearchIcon>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {filteredWorkPackagesBySearch.map((option: WorkPackageOption) => (
                    <MenuItem sx={styles.MenuItem} key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              {selectedWorkPackageValue[row.id] > 0 &&
                renderTooltipButton(
                  workPackageValueOptions.find(
                    option => option.value === selectedWorkPackageValue[row.id],
                  ) as WorkPackageOption,
                )}
            </Box>

            {filteredWorkPackages.length > 0 && selectedWorkPackageValue[row.id] === 0 && displayError && (
              <Box sx={{ flexGrow: 1, paddingX: 20 }}>
                <FormHelperText id='component-error-text'>This field cannot be empty</FormHelperText>
              </Box>
            )}
          </FormControl>
        );
      },
    },
    {
      flex: 0.15,
      field: "workingHours",
      headerName: "Working Hours",
      align: "center",
      headerAlign: "center",
      type: "number",
      renderCell: ({ row }: CellType) => (
        <FormControl error={row.workingHours === 0 || row.workingHours > 100}>
          <TextField
            error={selectedWorkingHours[row.id] === 0 || selectedWorkingHours[row.id] > 100}
            id='workingHours'
            type='number'
            value={selectedWorkingHours[row.id]}
            onChange={(e: any) => {
              setIsEditing(true);
              setSelectedWorkingHours((prev: any) => ({ ...prev, [row.id]: Number(e.target.value) }));
            }}
            variant='standard'
            onKeyPress={event => {
              if (event.key == "-") {
                event.preventDefault();
                return false;
              }
            }}
            inputProps={{
              min: 0,
              max: 100,
            }}
          />
          {selectedWorkingHours[row.id] === 0 && displayError && (
            <FormHelperText id='component-error-text'>This field cannot be 0</FormHelperText>
          )}
          {selectedWorkingHours[row.id] > 24 && displayError && (
            <FormHelperText id='component-error-text'>This field cannot be over 24</FormHelperText>
          )}
        </FormControl>
      ),
    },
  ];

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state.record as RecordStoreType);
  const { logout } = useAuth();

  useEffect(() => {
    const projectList = store.projects.map(pr => ({ value: pr.id, label: pr.project_name }));
    setProjectValueOptions(projectList);
    const workPackageList = store.workPackges.map(pr => ({
      value: pr.id,
      label: pr.work_package_name,
      project_id: pr.project_id,
    }));
    setWorkPackageValueOptions(workPackageList);
    const _projectMap: { [id: number]: string } = store.projects.reduce(
      (obj, pr) => ({ ...obj, [pr.id]: pr.project_name }),
      {},
    );
    const _workPackageMap: { [id: number]: string } = store.workPackges.reduce(
      (obj, wp) => ({ ...obj, [wp.id]: wp.work_package_name }),
      {},
    );
    setProjectMap(_projectMap);
    setWorkPackageMap(_workPackageMap);
    if (date !== null && date !== undefined) {
      setRows(
        store.records.map((r: RecordType) => ({
          id: r.id,
          projectName: _projectMap[r.project_id],
          workPackage: r.work_package_id === 0 ? "" : _workPackageMap[r.work_package_id],
          workingHours: r.working_hours,
          date: getDateString(date),
        })),
      );
    }
    setSelectedProjectValue(
      store.records.reduce((obj: KeyValueType, r: RecordType) => ({ ...obj, [r.id]: r.project_id }), {}),
    );
    setSelectedWorkPackageValue(
      store.records.reduce((obj: KeyValueType, r: RecordType) => ({ ...obj, [r.id]: r.work_package_id }), {}),
    );
    setSelectedWorkingHours(
      store.records.reduce((obj: KeyValueType, r: RecordType) => ({ ...obj, [r.id]: r.working_hours }), {}),
    );
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, [store]);

  useEffect(() => {
    if (date === null) {
      setDate(prevDate);
    } else {
      getRecords(date);
      setPrevDate(date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const onSetDate = (date: DateType) => {
    if (isEditing) {
      toast.error("Please save data before selecting a different date!");

      return;
    }
    setDate(date);
  };

  const onAddRow = useCallback(() => {
    if (date !== null && date !== undefined) {
      setRows(preRows => [
        ...preRows,
        {
          id: rowIdTemp,
          projectName: "",
          workPackage: "",
          workingHours: 0,
          date: getDateString(date),
        },
      ]);
    }
    //set default all item when textfield has no keyword
    setInputProject(prev => ({ ...prev, [rowIdTemp]: "" }));
    setInputWorkPackage(prev => ({ ...prev, [rowIdTemp]: "" }));
    setSelectedProjectValue(prev => ({ ...prev, [rowIdTemp]: 0 }));
    setSelectedWorkPackageValue(prev => ({ ...prev, [rowIdTemp]: 0 }));
    setSelectedWorkingHours(prev => ({ ...prev, [rowIdTemp]: 0 }));
    setIsEditing(true);
    setRowIdTemp(prev => prev - 1);
  }, [rowIdTemp]);

  // fetch the latest projects and work packages associated with the selected project.

  const getRecords = (date: DateType) => {
    if (date) {
      const dateString = getDateString(date);
      const user = JSON.parse(window.localStorage.getItem("user") as string);
      if (user != null && user.user_name) {
        //for check auth health
        dispatch(fetchCurrentUsers({ user_name: user.user_name }));
        dispatch(fetchRecentProjects({ user_name: user.user_name }));
        dispatch(fetchRecordsForCurrentUser({ user_name: user.user_name }));

        dispatch(
          fetchRecords({
            user_name: user.user_name,
            date: dateString,
          }),
        );
      } else {
        logout();
      }
    }
  };

  const onSaveData = async () => {
    let invalidRow: any[] = [];
    if (
      Object.values(selectedProjectValue).some(a => a === 0) ||
      Object.values(selectedProjectValue).some(
        (spv, id) =>
          workPackageValueOptions.filter((option: any) => option.project_id === spv).length > 0 &&
          Object.values(selectedWorkPackageValue)[id] === 0,
      ) ||
      Object.values(selectedWorkingHours).some(a => a === 0 || a > 24)
    ) {
      const rowID = Object.keys(selectedProjectValue).map(Number);
      const missingProjectID = rowID.filter(a => selectedProjectValue[a] === 0);
      const missingWorkPackage = rowID.filter(
        e =>
          workPackageValueOptions.filter((option: any) => option.project_id === selectedProjectValue[e]).length > 0 &&
          selectedWorkPackageValue[e] === 0,
      );
      const invalidWorkingHours = Object.entries(selectedWorkingHours)
        .filter(a => a[1] === 0 || a[1] > 24)
        .map(a => a[0])
        .map(Number);
      invalidRow = invalidRow.concat(missingProjectID, invalidWorkingHours, missingWorkPackage);
    }
    let hoursAfterDelete = 0;

    if (Object.values(selectedWorkingHours).length > 0) {
      hoursAfterDelete = Object.values(selectedWorkingHours).reduce((a, b) => a + b); //first, this variable store sum of Working Hours
    }

    if (rowIdsToDelete.length > 0) {
      //row id have value > 0 is stored in database
      const unSavedRows = rowIdsToDelete.filter(a => a < 0);
      if (unSavedRows.length > 0) {
        hoursAfterDelete -= unSavedRows.map(a => selectedWorkingHours[a]).reduce((a, b) => a + b);
      }
    }
    if (invalidRow.every(element => rowIdsToDelete.includes(element) && element < 0)) {
      invalidRow = [];
    }
    if (invalidRow.length > 0 || hoursAfterDelete > 24) {
      if (hoursAfterDelete > 24) toast.error("Working hours in a day cannot exceed 24!");
      setIsEditing(true);
      setDisplayError(true);
      handleClose();
    }
    if (date && invalidRow.length === 0 && hoursAfterDelete <= 24) {
      const dateString = getDateString(date);
      let rowIds = Object.keys(selectedWorkPackageValue); //contains all the row have input value
      if (rowIdsToDelete.length > 0) {
        const recordIds = rowIdsToDelete.filter(a => a > 0);
        if (recordIds.length > 0) await deleteBatchRecords(recordIds);
        for (let i = 0; i < rowIdsToDelete.length; i++)
          rowIds = rowIds.filter(item => item !== rowIdsToDelete[i]?.toString());
      }
      const recordsToInsert = [];
      const recordsToUpdate = [];
      for (let i = 0; i < rowIds.length; i++) {
        const rowId = Number(rowIds[i]);
        if (rowId < 0) {
          recordsToInsert.push({
            user_id: store.currentUsers[0].id,
            project_id: selectedProjectValue[rowId],
            work_package_id: selectedWorkPackageValue[rowId],
            date: dateString,
            working_hours: selectedWorkingHours[rowId],
          });
        } else {
          recordsToUpdate.push({
            id: rowId,
            user_id: store.currentUsers[0].id,
            project_id: selectedProjectValue[rowId],
            work_package_id: selectedWorkPackageValue[rowId],
            date: dateString,
            working_hours: selectedWorkingHours[rowId],
          });
        }
      }
      if (recordsToInsert.length > 0) {
        await addRecords(recordsToInsert);
      }
      if (recordsToUpdate.length > 0) {
        await updateRecords(recordsToUpdate);
      }
      getRecords(date);
      setIsEditing(false);
      toast.success("Saved data successfully!");
      setRowIdTemp(-1);
      setDisplayError(false);
      setRowIdsToDelete([]);
    } else {
      if (!date) toast.error("Please select a valid date!");
    }
  };

  const onCancel = () => {
    getRecords(date);
    setIsEditing(false);
    setDisplayError(false);
  };

  const handleFilter = useCallback((val: string) => {
    setValue(val);
  }, []);

  const handleClick = (newPlacement: PopperPlacementType) => (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(() => true);
    setPlacement(newPlacement);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteRow = async (id: number) => {
    if (isEditing) {
      await toast.error("Please save all data before deleting this row!");
      handleClose();
    } else {
      await deleteRecord(id);
      getRecords(date);
      toast.success("Deleted row successfully!");
      setIsEditing(false);
      handleClose();
    }
  };

  const handleDeleteDirectRow = (id: number) => {
    setRows(prevRow => prevRow.filter(element => element.id !== id));
    const recentRowIdsToDelete = rowIdsToDelete.concat(id);
    setRowIdsToDelete(recentRowIdsToDelete);
    handleClose();
  };

  const handleClickDelete = (e: any, id: number) => {
    handleClick("top-start")(e);
    setDeletedId(id);
  };

  const columns = [
    ...defaultColumns,
    {
      flex: 0.1,
      sortable: false,
      field: "actions",
      headerName: "Actions",
      align: "center",
      disableExport: true,
      headerAlign: "center",
      renderCell: ({ row }: CellType) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            disabled={!isDateValid(date)}
            onClick={e => {
              if (row.id > -1) handleClickDelete(e, row.id);
              else handleDeleteDirectRow(row.id);
            }}
          >
            <Icon icon='mdi:delete-outline' />
          </IconButton>
        </Box>
      ),
    },
    {
      flex: 0.15,
      minWidth: 115,
      sortable: false,
      field: "date",
      headerName: "Date",
      align: "center",
      headerAlign: "center",
      hide: true,
      renderCell: ({ row }: CellType) => <>{formatDateToAbbreviated(row.date)}</>,
    },
  ];

  const importDialogProps = {
    date,
    openImportDialog,
    handleImportDialogClose,
    dispatch,
  };

  const addDuplicateTaskDialogProps: AddDuplicateTaskDialogProps = {
    currentUser: store.currentUsers[0],
    date: date,
    getRecords(date) {
      getRecords(date);
    },
    openDialog: openDuplicateTaskDialog,
    setOpenDialog: setOpenDuplicateTaskDialog,
  };

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader
            title={<Typography variant='h5'>Daily Input</Typography>}
            subtitle={<Typography variant='body2'>Tasks for a specific date are shown below.</Typography>}
          />
        </Grid>
        <Grid item xs={12}>
          <Card>
            <TableHeader
              value={value}
              handleFilter={handleFilter}
              date={date}
              onSetDate={onSetDate}
              onAddRow={onAddRow}
              isEditing={isEditing}
              onOpenDuplicateTaskDialog={() => setOpenDuplicateTaskDialog(true)}
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
                rowHeight={56}
                columns={columns}
                components={{ Toolbar: GridToolbarCustom }}
                componentsProps={{
                  toolbar: {
                    handleImportDialogOpen,
                  },
                }}
                pageSize={pageSize}
                disableSelectionOnClick
                rowsPerPageOptions={[10, 25, 50]}
                onPageSizeChange={newPageSize => setPageSize(newPageSize)}
                sx={{ "& .MuiDataGrid-columnHeaders": { borderRadius: 0 } }}
                experimentalFeatures={{ newEditingApi: true }}
              />
            )}
            <ImportDialog {...importDialogProps} />
            <AddDuplicateTaskDialog {...addDuplicateTaskDialogProps} />
          </Card>
        </Grid>
        {isEditing && (
          <Grid item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Button
              sx={{ mr: 4 }}
              variant='contained'
              disabled={!isDateValid(date)}
              onClick={() => {
                onSaveData();
              }}
            >
              Save Data
            </Button>
            <Button variant='contained' onClick={onCancel}>
              Cancel
            </Button>
          </Grid>
        )}
      </Grid>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        transition
        disablePortal={false}
        modifiers={[
          {
            name: "arrow",
            enabled: true,
            options: {
              element: arrowRef,
            },
          },
        ]}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === "bottom-start" ? "left top" : "left bottom" }}
          >
            <Paper elevation={6} sx={{ border: theme => `1px solid ${theme.palette.divider}` }}>
              <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                  Are you sure you want to delete this row?
                </DialogContentText>
              </DialogContent>
              <DialogActions className='dialog-actions-dense'>
                <Button color='error' onClick={() => handleDeleteRow(deletedId)}>
                  OK
                </Button>
                <Button onClick={handleClose}>Cancel</Button>
              </DialogActions>
              <Box component='span' className='arrow' ref={setArrowRef} />
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
export default DailyReport;

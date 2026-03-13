// ** React Imports
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";

// ** MUI Imports
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import DatePicker from "react-datepicker";
import CustomInput from "./PickersCustomInput";
import DatePickerWrapper from "src/@core/styles/libs/react-datepicker";
import { DateType } from "src/types/forms/reactDatepickerTypes";
import { RecordStoreType, UserType } from "src/types/apps/recordTypes";
import { FormControl, InputLabel, ListItemText, ListSubheader, MenuItem, OutlinedInput, Select } from "@mui/material";
import { styled } from "@mui/system";

interface TableHeaderProps {
  value: string;
  startDate: DateType;
  endDate: DateType;
  handleFilter: (val: string) => void;
  setStartDate: Dispatch<SetStateAction<DateType>>;
  setEndDate: Dispatch<SetStateAction<DateType>>;
  store: RecordStoreType;
  userName: string;
  position: string;
  selectedUsers: number[];
  setSelectedUsers: any;
}

const ITEM_HEIGHT = 120;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const GroupHeader = styled("div")(({ theme }) => ({
  position: "sticky",
  top: "-8px",
  padding: "4px 10px",
  fontFamily: "Monospace",
  fontWeight: 600,
  fontSize: "1.15rem",
  margin: "5px 5px",
}));

const GroupItems = styled("ul")({
  padding: "15px 15px",
  margin: "15px 15px",
});

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    value,
    handleFilter,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    store,
    userName,
    position,
    selectedUsers,
    setSelectedUsers,
  } = props;

  // ** State
  const [open, setOpen] = useState<boolean>(false);
  const [userMap, setUserMap] = useState<any[]>([]);

  useEffect(() => {
    const newUserMap = store.users.reduce((newArr: any, currentUser) => {
      const { id, user_name, department_id } = currentUser;
      const i = newArr.findIndex((na: UserType) => na.department_id === department_id);
      const _newArr = [...newArr];
      if (i > -1) {
        const objToEdit = newArr[i];
        _newArr.splice(i, 1, {
          department_id,
          users: [
            ...objToEdit.users,
            {
              id,
              user_name,
            },
          ],
        });
      } else {
        _newArr.push({
          department_id,
          users: [
            {
              id,
              user_name,
            },
          ],
        });
      }

      return _newArr;
    }, []);
    setUserMap(newUserMap);
  }, [store]);

  const currentUserTeam = store.teams.find(d => d.id === store.currentUsers[0]?.team_id)?.name;
  const teamUsers = store.users.filter(d => d.team_id === store.currentUsers[0]?.team_id)?.map(user => user.id);

  const handleDialogToggle = () => setOpen(!open);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    setOpen(false);
    e.preventDefault();
  };

  const onChangeDateRange = (dates: Date[]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };
  const isSelectTeam = teamUsers.every(id => selectedUsers.includes(id));
  return (
    <DatePickerWrapper>
      <Box sx={{ p: 5, pb: 3, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "right" }}>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id='user-label'>Select employees</InputLabel>
          <Select
            sx={{ mr: 5 }}
            inputProps={{ "aria-label": "Users label" }}
            multiple
            value={selectedUsers}
            onChange={(event: any) => {
              const {
                target: { value },
              } = event;
              if (!value.includes(-2) && !value.includes(-1)) {
                setSelectedUsers(typeof value === "string" ? value.split(",") : value);
              } else if (selectedUsers.length === store.users.length) {
                setSelectedUsers([]);
              } else if (isSelectTeam) {
                setSelectedUsers((prev: number[]) => prev.filter((user: number) => !teamUsers.includes(user)));
              } else {
                if (value.includes(-2)) setSelectedUsers(teamUsers);
                else setSelectedUsers(store.users.map(user => user.id));
              }
            }}
            input={<OutlinedInput label='Select employees' />}
            renderValue={selected => selected.map(s => store.users.find(u => u.id === s)?.user_name).join(", ")}
            MenuProps={MenuProps}
          >
            {currentUserTeam && (
              <MenuItem value={-2}>
                <Checkbox checked={isSelectTeam} />
                <ListItemText>My Team: {currentUserTeam}</ListItemText>
              </MenuItem>
            )}

            {position !== "Manager" && (
              <MenuItem value={store.currentUsers[0]?.id} key={store.currentUsers[0]?.id}>
                <Checkbox checked={selectedUsers.includes(store.currentUsers[0]?.id)} />
                <ListItemText primary={store.currentUsers[0]?.user_name} />
              </MenuItem>
            )}

            {position === "Manager" && (
              <MenuItem value={-1}>
                <Checkbox checked={selectedUsers.length === store.users.length} />
                <ListItemText primary={"Select All Departments"} />
              </MenuItem>
            )}

            {position === "Manager" &&
              userMap.map((dep: any) => {
                const { department_id, users } = dep;
                const departmentMap = (department_id: number) => {
                  return store.departments.find(d => d.id === department_id)?.department_name || "Other";
                };
                const idToDepartment = (id: number) => {
                  return store.users.find(element => element.id === id)?.department_id;
                };
                const rendered = [department_id, ...users];
                return rendered.map((option: any, id: number) =>
                  id === 0 ? (
                    <ListSubheader>
                      {departmentMap(option)}
                      <Checkbox
                        onClick={() => {
                          const filtered = store.users.reduce(
                            (result: any, user: UserType) =>
                              user.department_id === option && selectedUsers?.indexOf(user.id) === -1
                                ? result.push(user.id) && result
                                : result,
                            [],
                          );
                          if (filtered.every(element => selectedUsers.includes(element)))
                            setSelectedUsers(selectedUsers.filter(ele => idToDepartment(ele) !== option));
                          else setSelectedUsers(prev => [...prev, ...filtered]);
                        }}
                        checked={
                          selectedUsers.filter(a => idToDepartment(a) === option).length ===
                          store.users.filter(a => a.department_id === option).length
                        }
                      />
                    </ListSubheader>
                  ) : (
                    <MenuItem key={option.id} value={option.id}>
                      <Checkbox checked={selectedUsers?.indexOf(option.id) > -1} />
                      <ListItemText primary={option.user_name} />
                    </MenuItem>
                  ),
                );
              })}
          </Select>
        </FormControl>
        <div>
          <DatePicker
            selected={startDate}
            id='date-range-input'
            popperPlacement={"bottom-start"}
            onChange={onChangeDateRange}
            autoComplete='off'
            monthsShown={1}
            showMonthDropdown
            showYearDropdown
            startDate={startDate}
            endDate={endDate}
            placeholderText='Click to select a date'
            shouldCloseOnSelect={true}
            customInput={<CustomInput label='Select date range' className='custom-datepicker-input' />}
            selectsRange
            dateFormat='yyyy-MMM-dd'
          />
        </div>
      </Box>
      <Dialog fullWidth maxWidth='sm' onClose={handleDialogToggle} open={open}>
        <DialogTitle sx={{ pt: 12, mx: "auto", textAlign: "center" }}>
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Add New Permission
          </Typography>
          <Typography variant='body2'>Permissions you may use and assign to your users.</Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 12, mx: "auto" }}>
          <Box
            component='form'
            onSubmit={e => onSubmit(e)}
            sx={{ mt: 4, display: "flex", flexDirection: "column", alignItems: "flex-start" }}
          >
            <TextField
              fullWidth
              label='Permission Name'
              sx={{ mb: 1, maxWidth: 360 }}
              placeholder='Enter Permission Name'
            />
            <FormControlLabel control={<Checkbox />} label='Set as core permission' />
            <Box className='demo-space-x' sx={{ "& > :last-child": { mr: "0 !important" } }}>
              <Button size='large' type='submit' variant='contained'>
                Create Permission
              </Button>
              <Button type='reset' size='large' variant='outlined' color='secondary' onClick={handleDialogToggle}>
                Discard
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </DatePickerWrapper>
  );
};

export default TableHeader;

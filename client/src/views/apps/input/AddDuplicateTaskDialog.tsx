import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import DatePicker from "react-datepicker";

import { addBusinessDays, differenceInBusinessDays, format, isWeekend } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DatePickerWrapper from "src/@core/styles/libs/react-datepicker";
import { getDateRange } from "src/@core/utils/get-daterange";
import { getDateString } from "src/@core/utils/get-dateString";
import { isDateValid } from "src/@core/utils/isDateValid";
import { addRecords, deleteBatchRecords, fetchCopiedRecords } from "src/store/apps/record";
import { RecordType, UserType } from "src/types/apps/recordTypes";
import { DateType } from "src/types/forms/reactDatepickerTypes";
import CustomInput from "./PickersCustomInput";

export type AddDuplicateTaskDialogProps = {
  openDialog: boolean;
  setOpenDialog: (openDialog: boolean) => void;
  currentUser: UserType;
  date: DateType;
  getRecords: (date: DateType) => void;
};

const AddDuplicateTaskDialog = ({
  openDialog,
  setOpenDialog,
  currentUser,
  date,
  getRecords,
}: AddDuplicateTaskDialogProps) => {
  const [startDateTo, setStartDateTo] = useState<DateType>(null);
  const [endDateTo, setEndDateTo] = useState<DateType>(null);
  const [startDateFrom, setStartDateFrom] = useState<DateType>(null);
  const [endDateFrom, setEndDateFrom] = useState<DateType>(null);
  const [intervalDate, setIntervalDate] = useState<number>(-1);

  const handleDialogToggle = useCallback(() => {
    setOpenDialog(!openDialog);
    if (openDialog === false) {
      resetSelectedDate();
    }
  }, [openDialog]);

  const resetSelectedDate = useCallback(() => {
    setStartDateTo(null);
    setEndDateTo(null);
    setStartDateFrom(null);
    setEndDateFrom(null);
    setIntervalDate(-1);
  }, []);

  const onSetInterValDate = () => {
    if (startDateFrom && endDateFrom) {
      const interval = differenceInBusinessDays(endDateFrom, startDateFrom);
      setIntervalDate(interval);
      setStartDateTo(null);
      setEndDateTo(null);
    }
  };

  useEffect(() => {
    onSetInterValDate();
  }, [startDateFrom, endDateFrom]);

  const formattedDateFromString = useMemo(() => {
    return startDateFrom ? format(startDateFrom, "yyyy-MM-dd") : "";
  }, [startDateFrom]);

  const intervalSelectedCount = useMemo(() => {
    return startDateTo && endDateTo ? differenceInBusinessDays(endDateTo, startDateTo) : 0;
  }, [startDateTo, endDateTo]);

  const onChangeDateRangeTo = (dates: Date[]) => {
    const [start, end] = dates;
    setStartDateTo(start);
    const endDate = addBusinessDays(start, intervalDate);
    if (startDateFrom && endDateFrom && intervalDate > 0) {
      setEndDateTo(endDate);
    } else setEndDateTo(end);
  };

  const onCancel = useCallback(() => {
    getRecords(date);
    resetSelectedDate();
  }, [date, getRecords, resetSelectedDate]);

  const onChangeDateRangeFrom = (dates: Date[]) => {
    const [start, end] = dates;
    setStartDateFrom(start);
    setEndDateFrom(end);
  };

  const datesToArray = useMemo(() => {
    return startDateTo && endDateTo ? getDateRange(startDateTo, endDateTo) : [];
  }, [startDateTo, endDateTo]);

  const datesFromArray = useMemo(() => {
    return startDateFrom && endDateFrom ? getDateRange(startDateFrom, endDateFrom) : [];
  }, [startDateFrom, endDateFrom]);

  const onDuplicateTask = useCallback(async () => {
    if (startDateFrom && endDateFrom && startDateTo && endDateTo) {
      const startDateFromString = getDateString(startDateFrom);
      const endDateFromString = getDateString(endDateFrom);
      const startDateToString = getDateString(startDateTo);
      const endDateToString = getDateString(endDateTo);

      if (startDateFromString === startDateToString && endDateFromString === endDateToString) {
        toast.error("Nothing changed. Please select different range to paste.");
        onCancel();
        return;
      }

      let recordsToInsert: any = [];
      const response: any = await fetchCopiedRecords({
        user_name: currentUser.user_name,
        start_date: startDateFromString,
        end_date: endDateFromString,
      });

      const copiedRecords: RecordType[] = response.data;

      //copy from one day to day range
      if (intervalDate === 0) {
        datesToArray.map(a => {
          copiedRecords.map(rec => {
            recordsToInsert.push({
              user_id: currentUser.id,
              project_id: rec.project_id,
              work_package_id: rec.work_package_id,
              date: a,
              working_hours: rec.working_hours,
            });
          });
        });
      }
      //copy from range to range
      else {
        for (let i = 0; i < datesToArray.length; i++) {
          const rec = copiedRecords.filter(a => a.date === datesFromArray[i]);
          rec.map(a => {
            recordsToInsert.push({
              user_id: currentUser.id,
              project_id: a.project_id,
              work_package_id: a.work_package_id,
              date: datesToArray[i],
              working_hours: a.working_hours,
            });
          });
        }
      }
      if (recordsToInsert.length > 0) {
        const dataTo = await fetchCopiedRecords({
          user_name: currentUser.user_name,
          start_date: startDateToString,
          end_date: endDateToString,
        });
        const oldRecord: RecordType[] = dataTo.data;
        if (oldRecord.length > 0) {
          const oldRecordId = oldRecord.map(r => r.id);
          await deleteBatchRecords(oldRecordId);
        }

        await addRecords(recordsToInsert);
      }
      recordsToInsert = [];
      toast.success("Copied data successfully");
    } else toast.error("Duplicate failed!");

    onCancel();
    return;
  }, [startDateFrom, startDateTo, endDateFrom, endDateTo]);

  return (
    <Dialog
      open={openDialog}
      onClose={handleDialogToggle}
      aria-labelledby='user-view-edit'
      sx={{ "& .MuiPaper-root": { width: "100%", maxWidth: 650, p: [2, 10] } }}
      aria-describedby='user-view-edit-description'
    >
      <DialogTitle id='user-view-edit' sx={{ textAlign: "center", fontSize: "1.5rem !important" }}>
        Duplicate Tasks
      </DialogTitle>
      <DialogContent sx={{ pb: 12, mx: "auto" }}>
        <DialogContentText variant='body2' id='user-view-edit-description' sx={{ textAlign: "center", mb: 7 }}>
          Duplicate tasks between date ranges for efficient planning.
        </DialogContentText>
        <Typography
          component='div'
          variant='body1'
          color='#ffa726'
          style={{
            display: intervalDate > 0 ? "block" : "none",
            textAlign: "center",
            fontWeight: "bold",
            fontStyle: "italic",
          }}
        >
          <Box>Tasks in {intervalDate + 1} days will be duplicated.</Box>
        </Typography>
        <Typography
          component='div'
          variant='body2'
          color='#ffa726'
          style={{
            display: intervalDate === 0 && startDateFrom && startDateTo && endDateTo ? "block" : "none",
            textAlign: "center",
            fontWeight: "bold",
            fontStyle: "italic",
          }}
        >
          <Box>
            Task copied on {formattedDateFromString} will be duplicated to a {intervalSelectedCount + 1}-day range.
          </Box>
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", pt: 10, pb: 10 }}>
          <div style={{ marginRight: 16 }}>
            <DatePickerWrapper>
              <DatePicker
                autoComplete='off'
                popperPlacement={"right"}
                showMonthDropdown
                showYearDropdown
                selected={startDateFrom}
                id='date-range-input'
                startDate={startDateFrom}
                endDate={endDateFrom}
                onChange={onChangeDateRangeFrom}
                filterDate={date => !isWeekend(date)}
                placeholderText='Click to select a date'
                customInput={<CustomInput label='Copy Tasks From' />}
                selectsRange
                dateFormat='dd/MM/yyyy'
                onKeyDown={(event: any) => {
                  if (event.key === "Delete" || event.key === "Backspace") {
                    resetSelectedDate();
                  }
                }}
              />
            </DatePickerWrapper>
          </div>
          <div>
            <DatePickerWrapper>
              <DatePicker
                popperPlacement={"left"}
                autoComplete='off'
                showMonthDropdown
                showYearDropdown
                selected={endDateTo}
                id='date-range-input'
                onChange={onChangeDateRangeTo}
                filterDate={date => {
                  return isDateValid(date) && !isWeekend(date);
                }}
                startDate={startDateTo}
                endDate={endDateTo}
                placeholderText='Click to select a date'
                customInput={<CustomInput label='Paste Into Date Range' />}
                selectsRange
                dateFormat='dd/MM/yyyy'
                onKeyDown={(event: any) => {
                  if (event.key === "Delete" || event.key === "Backspace") {
                    setStartDateTo(null); // Clear the selected date when the "Delete" key is pressed
                    setEndDateTo(null);
                  }
                }}
              />
            </DatePickerWrapper>
          </div>
        </Box>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            sx={{ mr: 1 }}
            size='large'
            type='submit'
            variant='contained'
            onClick={() => {
              onDuplicateTask();
              handleDialogToggle();
            }}
          >
            Duplicate
          </Button>
          <Button
            type='reset'
            size='large'
            variant='contained'
            color='error'
            onClick={() => {
              handleDialogToggle();
              resetSelectedDate();
            }}
          >
            Discard
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default AddDuplicateTaskDialog;

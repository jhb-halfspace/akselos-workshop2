import { Box, Card, CardContent, CardHeader, Container, Grid, Switch, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { eachDayOfInterval, isToday, isWeekend, lastDayOfMonth } from "date-fns";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import DatePickerWrapper from "src/@core/styles/libs/react-datepicker";
import { getDateString } from "src/@core/utils/get-dateString";
import { RootState } from "src/store";
import { API_URL } from "src/store/apps/record";
import { SumWorkingHoursType } from "src/types/apps/recordTypes";
import { DateType } from "src/types/forms/reactDatepickerTypes";

enum ECellStatus {
  NOT_FILLED = "Blank",
  LESS_THAN_8 = "Less than 8",
  MORE_THAN_8 = "More than 8",
  NORMAL = "Normal",
  CURRENT_DAY = "Today",
}

const CalendarWidget = () => {
  const theme = useTheme();
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<DateType>(undefined);
  const [showTotalWorkingHours, setShowTotalWorkingHours] = useState<boolean>(false);
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth(currentMonth),
    });
  }, [currentMonth]);

  const [data, setData] = useState<SumWorkingHoursType[]>([]);
  const store = useSelector((state: RootState) => state.record);

  const handleSetData = useCallback(async () => {
    const start_date = getDateString(daysInMonth[0]);
    const end_date = getDateString(daysInMonth[daysInMonth.length - 1]);
    try {
      const id = store.currentUsers[0].id.toString() ?? "0";
      const response = await axios.get(`${API_URL}/api/records/get_sum_hours_employees`, {
        params: { user_ids: id, start_date, end_date },
      });
      setData(response.data as SumWorkingHoursType[]);
    } catch (error) {
      return [];
    }
  }, [daysInMonth, store.currentUsers[0]]);

  useEffect(() => {
    handleSetData();
  }, [handleSetData]);

  const getStatus = useMemo(() => {
    return (date: Date) => {
      if (isToday(date)) {
        return ECellStatus.CURRENT_DAY;
      }
      const dateString = getDateString(date);
      const sumOfWorkingHours: SumWorkingHoursType[] = data.filter(
        (item: SumWorkingHoursType) => item.date === dateString,
      );
      if (sumOfWorkingHours.length > 0) {
        const sum = sumOfWorkingHours[0].total_working_hours;
        if ((isWeekend(date) && sum > 0) || sum > 8) {
          return ECellStatus.MORE_THAN_8;
        }
        if (sum === 0) {
          return ECellStatus.NOT_FILLED;
        } else if (sum < 8) {
          return ECellStatus.LESS_THAN_8;
        }
        return ECellStatus.NORMAL;
      }
    };
  }, [data]);

  const getBackgroundColor = useMemo(() => {
    return (date: Date) => {
      const status = getStatus(date);
      switch (status) {
        case ECellStatus.NOT_FILLED:
          return theme.palette.secondary.light;
        case ECellStatus.LESS_THAN_8:
          return theme.palette.warning.main;
        case ECellStatus.NORMAL:
          return theme.palette.success.main;
        case ECellStatus.MORE_THAN_8:
          return theme.palette.error.main;
        case ECellStatus.CURRENT_DAY:
          return theme.palette.primary.main;
        default:
          return theme.palette.primary.contrastText;
      }
    };
  }, [getStatus, theme.palette]);
  return (
    <Card>
      <CardHeader
        title={`Total Working Hours: ${data.reduce((sum: number, item: SumWorkingHoursType) => sum + item.total_working_hours, 0)} `}
      />
      <CardContent>
        <Grid flexDirection={"row"} display='flex' alignItems='center' justifyContent='flex-start'>
          <Typography variant='subtitle2'>Show Working Hours</Typography>
          <Switch checked={showTotalWorkingHours} onChange={e => setShowTotalWorkingHours(e.target.checked)} />
        </Grid>
        <DatePickerWrapper>
          <DatePicker
            showMonthDropdown
            inline
            renderDayContents={(date, day) => {
              const backgroundColor = getBackgroundColor(day);
              const item = data.find((item: SumWorkingHoursType) => item.date === getDateString(day)) ?? {};
              const totalWorkingHours = (item as SumWorkingHoursType).total_working_hours ?? 0;
              const isDisabled =
                (isWeekend(day) && totalWorkingHours === 0) ||
                day > (lastDayOfMonth(currentMonth) as Date) ||
                day < firstDayOfMonth;

              const isSelected = getDateString(selectedDate as Date) === getDateString(day);
              return (
                <Container
                  sx={{
                    height: "100%",
                    width: "100%",
                    backgroundColor: isDisabled ? theme.palette.background.default : backgroundColor,
                    borderRadius: getStatus(day) === ECellStatus.CURRENT_DAY ? "50%" : "0%",
                  }}
                >
                  <Box
                    sx={{
                      background: "none",
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: isSelected ? "bold" : 300, opacity: isDisabled ? 0.5 : 1 }}
                      variant='caption'
                      color={
                        isDisabled
                          ? theme.palette.getContrastText(theme.palette.background.default)
                          : isSelected
                            ? theme.palette.common.black
                            : theme.palette.common.white
                      }
                    >
                      {showTotalWorkingHours ? totalWorkingHours : date}
                    </Typography>
                  </Box>
                </Container>
              );
            }}
            selected={selectedDate}
            onMonthChange={month => {
              setCurrentMonth(month);
            }}
            onChange={(date: DateType) => {
              router.push({
                pathname: "/apps/input",
                query: { selectedDate: getDateString(date) },
              });
              setSelectedDate(date);
            }}
            dateFormat='yyyy-MMM-dd'
          />
        </DatePickerWrapper>
      </CardContent>
    </Card>
  );
};
export default CalendarWidget;

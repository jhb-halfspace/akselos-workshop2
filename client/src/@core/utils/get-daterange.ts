import { eachDayOfInterval, format, isWeekend } from "date-fns";

export const getDateRange = (startDate: Date, endDate: Date) => {
  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  })
    .filter(date => !isWeekend(date))
    .map(date => format(date, "yyyy-MM-dd"));
};

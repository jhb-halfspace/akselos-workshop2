import { format, parseISO } from "date-fns";

export function getDateString(date: Date) {
  let dateString = "";
  if (date) {
    dateString = format(date, "yyyy-MM-dd");
  }

  return dateString;
}

export function formatDateToAbbreviated(inputDate: string) {
  if (inputDate) {
    const parsedDate = parseISO(inputDate);
    return format(parsedDate, "yyyy-MMM-dd");
  }
}

export function convertStringToDate(date: String) {
  const datePart = date.split("-");
  return new Date(datePart);
}

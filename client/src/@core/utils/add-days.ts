export function addDays(date: Date, num: number) {
  const newDate = new Date(date.getTime() + num * 24 * 60 * 60 * 1000);
  if (newDate.getDay() === 0) {
    return new Date(newDate.getTime() + 1 * 24 * 60 * 60 * 1000);
  } else if (newDate.getDay() === 6) {
    return new Date(newDate.getTime() + 2 * 24 * 60 * 60 * 1000);
  } else return newDate;
}

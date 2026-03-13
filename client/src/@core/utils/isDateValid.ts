/**
 * Checks if the provided date is valid for user data modification.
 * The function ensures that users can modify data up to the end of the 2-month period before the current month.
 */

export const isDateValid = date => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Calculate the 2-months previous month
  let targetMonth = (currentMonth - 2 + 12) % 12;
  if (targetMonth === 0) targetMonth = 12;

  const targetYear = currentMonth <= 2 ? currentYear - 1 : currentYear;

  return date.getFullYear() > targetYear || (date.getFullYear() === targetYear && date.getMonth() >= targetMonth);
};

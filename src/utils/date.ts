export function isToday(dateString: string): boolean {
  const showDate = new Date(dateString);
  const today = new Date();

  return (
    showDate.getDate() === today.getDate() &&
    showDate.getMonth() === today.getMonth() &&
    showDate.getFullYear() === today.getFullYear()
  );
}
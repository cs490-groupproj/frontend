import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function toTitleCase(string) {
  return string.replace(/\w\S*/g, (match) => {
    return match.charAt(0).toUpperCase() + match.substring(1).toLowerCase();
  });
}
export default toTitleCase;

//expects a string in the format "XX:XX:XX"
export function formatMilitaryTime(timeString) {
  if (!timeString) return "";

  const [hoursStr, minutesStr] = timeString.split(":");

  let hours = parseInt(hoursStr, 10);
  const am_pm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutesStr} ${am_pm}`;
}

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

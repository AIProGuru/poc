import env from "@beam-australia/react-env";

export const SERVER_URL = import.meta.env.VITE_SERVER_URL;
console.log(SERVER_URL)
export const MAINTAINING = import.meta.env.VITE_MAINTAINING;
// export const MAINTAINING = false;

export const samplifyInteger = (value) => Math.round(Number(value)).toLocaleString('en-US');

export const samplifyString = (value) => value === "" ? '-' : value;

export const samplifyDouble = (value) => Number(value).toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const rcmGPTDateFormat = (value) => {
  // Convert the timestamp from milliseconds to a Date object
  const date = new Date(value);

  // Get today's date
  const today = new Date();

  // Function to get the start of the week (Sunday as the first day)
  function getStartOfWeek(d) {
    const date = new Date(d);
    const day = date.getDay(); // Day of the week (0-6)
    const diff = date.getDate() - day; // Adjust to the nearest Sunday
    return new Date(date.setDate(diff));
  }

  // Function to capitalize the first letter of each word in a string
  function capitalizeWords(input) {
    return input.replace(/\b(\w)/g, (match, p1, offset, string) => {
      // Do not capitalize if the next character after the match is a colon, indicating a time, or if it is 'a' or 'p' followed by 'm'
      if (string[offset + 1] === ':' || (string.slice(offset, offset + 2).toLowerCase() === 'am' || string.slice(offset, offset + 2).toLowerCase() === 'pm')) {
        return match;
      }
      return match.toUpperCase();
    });
  }

  // Calculate the start of the week for today and the provided date
  const startOfThisWeek = getStartOfWeek(today);
  const startOfDateWeek = getStartOfWeek(date);

  // Reset the hours, minutes, seconds, and milliseconds to 0
  startOfThisWeek.setHours(0, 0, 0, 0);
  startOfDateWeek.setHours(0, 0, 0, 0);

  // Check if the date falls within the same week as today
  let formattedDate;
  if (startOfDateWeek.getTime() === startOfThisWeek.getTime()) {
    // Same week
    formattedDate = date.toLocaleString('en-US', {
      weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: true
    }).toLowerCase();
  } else {
    // Different week
    formattedDate = date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    }).toLowerCase();
  }

  return capitalizeWords(formattedDate);
}

export const getCurrentDateTime = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const parseDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
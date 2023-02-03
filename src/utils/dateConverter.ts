export default function dateConverter(date_created: string, short?: boolean) {
  const d = new Date(date_created);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let day = d.getDay();
  let date = String(d.getDate());
  let month = d.getMonth();
  let year = d.getFullYear();
  interface INum {
    [key: number | string]: string;
  }
  let num: INum = {
    1: "st",
    2: "nd",
    3: "rd",
    4: "th",
    5: "th",
    6: "th",
    7: "th",
    8: "th",
    9: "th",
    10: "th",
    11: "th",
    12: "th",
    13: "th",
    14: "th",
    15: "th",
    16: "th",
    17: "th",
    18: "th",
    19: "th",
    20: "th",
    21: "st",
    22: "nd",
    23: "rd",
    24: "th",
    25: "th",
    26: "th",
    27: "th",
    28: "th",
    29: "th",
    30: "th",
    31: "st",
  };

  if (short) {
    return `${months[month]} ${date}${num[date]}, ${year}`;
  }
  return `${days[day]} ${date}${num[date]}, ${months[month]} ${year}`;
}

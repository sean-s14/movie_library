/** Converts time from minutes to hours & minutes */
export default function timeConverter(t: number | string): string {
  if (typeof t === "string") {
    try {
      t = parseInt(t);
    } catch (e: any) {
      console.error(e);
      throw `Error: Could not convert string "${t}" to a number`;
    }
  }
  const hours = Math.floor(t / 60);
  const minutes = t % 60;
  return `${hours}h ${minutes}m`;
}

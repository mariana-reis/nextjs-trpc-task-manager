// Formats timestamps using the local system timezone, ensuring users see creation dates
// in their actual local time rather than an offset UTC timezone.
const formatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCreatedAt(timestamp: number): string {
  return formatter.format(timestamp);
}

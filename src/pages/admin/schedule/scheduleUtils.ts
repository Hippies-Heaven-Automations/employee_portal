// ---------- Week Utilities ----------
export function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff));
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

// ---------- Timezone Utilities ----------
export function getTzDiffHours(dateISO: string) {
  const probe = new Date(dateISO + "T12:00:00Z");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    timeZoneName: "short",
  }).formatToParts(probe);
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value || "";
  const chicagoOffset = tzName.includes("CDT") ? -5 : -6;
  return 8 - chicagoOffset; // Manila (UTC+8)
}

// ---------- Time Formatters ----------
export function formatDisplayTimeRaw(timeString: string) {
  if (!timeString) return "";
  const [hh, mm] = timeString.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatHourCompact(h: number) {
  if (h === 0) return "12mn";
  if (h === 12) return "12nn";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
}

// ---------- Slot Conversion ----------
export function convertSlotLabel(
  slot: string,
  dateISO: string,
  tz: "CST" | "PHT"
) {
  const [a, b] = slot.split(" - ");
  const to24 = (label: string) => {
    const [num, mer] = label.split(" ");
    let h = parseInt(num, 10);
    if (mer === "PM" && h < 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return h;
  };

  if (tz === "CST") return slot;

  const diff = getTzDiffHours(dateISO);
  const startH = (to24(a) + diff + 24) % 24;
  const endH = (to24(b) + diff + 24) % 24;

  return `${formatHourCompact(startH)} - ${formatHourCompact(endH)}`;
}

// ---------- Slot Generation ----------
export function generateTimeSlots() {
  return [
    "8 AM - 11 AM",
    "11 AM - 2 PM",
    "2 PM - 5 PM",
    "5 PM - 8 PM",
    "8 PM - 11 PM",
    "11 PM - 2 AM",
    "2 AM - 5 AM",
    "5 AM - 8 AM",
  ];
}

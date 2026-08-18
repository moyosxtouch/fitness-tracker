export function findWeightForDate(records, date) {
  const record = records.find((item) => item.date === date);

  if (!record) return null;

  const weight = Number(record.weight);
  return Number.isFinite(weight) ? weight : null;
}

export function parseOptionalNumber(value) {
  if (value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getDaysBetween(firstDate, currentDate) {
  const first = new Date(`${firstDate}T00:00:00`);
  const current = new Date(`${currentDate}T00:00:00`);
  const difference = current.getTime() - first.getTime();

  return Math.max(0, Math.round(difference / (1000 * 60 * 60 * 24)));
}

export function formatShortDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function hasValidNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
}

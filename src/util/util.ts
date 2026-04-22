import { isBefore, parse, startOfDay } from "date-fns";
import { DateTime } from "luxon";

export const capitalizeFirstLetter = (str: string) => {
  return `${str.charAt(0).toUpperCase()}${str.substring(1)}`;
};
export const INPUT_CLASS = `block w-full rounded-md border-0  pl-1.5 py-1.5  text-black shadow-sm ring-1 ring-inset  ring-black/30  focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6`;

export const exists = (value: string) => {
  if (!value) {
    return false;
  }
  return true;
};
export const isEmail = (value: string) => {
  return /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(value);
};
export const isPhoneWithCountryCode = (value: string) => {
  return (
    /^\+\d{1,3}\s?\d{1,14}(\s?\d{1,13})?$/.test(value) ||
    /^\(\d{3}\) \d{3}-\d{4}$/.test(value) ||
    /^[0-9]{10}$/.test(value)
  );
};

export const isPhone = (value: string) => {
  return (
    /^\+\d{1,3}\s?\d{1,14}(\s?\d{1,13})?$/.test(value) ||
    /^\(\d{3}\) \d{3}-\d{4}$/.test(value) ||
    /^[0-9]{10}$/.test(value)
  );
};

export const sanitizeFileName = (name: string): string => {
  return (name || "").replace(/[/\\?%*:|"<>]/g, "-").replace(/\s+/g, "-");
};

export const isValidDate = (value: any): boolean => {
  if (!value) {
    return false;
  }

  let date: Date;

  // Handle different input types
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "string" || typeof value === "number") {
    date = new Date(value);
  } else {
    return false;
  }

  // Check if date is valid and not Invalid Date
  if (!(date instanceof Date && !isNaN(date.getTime()))) {
    return false;
  }

  // Check if date is not more than 50 years from now
  const now = new Date();
  const fiftyYearsFromNow = new Date();
  fiftyYearsFromNow.setFullYear(now.getFullYear() + 50);

  return date <= fiftyYearsFromNow;
};

export const getVal = (num: number, unit: string, total: number) => {
  const val = unit == "dollar" ? +num : +((total * +num) / 100).toFixed(2);
  return val;
};
export const isValidPassword = (value: string) => {
  return (
    !!value &&
    value.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&-_])[A-Za-z\d@$!%*?&-_]{8,}$/,
    )
  );
};

export const openFile = (url: string) => {
  window.open(`${url}`, "_blank")?.focus();
};
export function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

export const flattenTree = (unitTypes: any[]) => {
  const flatList: any[] = [];
  const seenIds = new Set<number>();

  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (!seenIds.has(node.id)) {
        seenIds.add(node.id);
        flatList.push(node);
      }
      if (node.children && node.children.length) {
        traverse(node.children);
      }
    }
  };

  traverse(unitTypes);
  return flatList;
};
export const getRootUnits = (
  organizationUnitIds: number[],
  organizationTree: any[],
) => {
  let ids: number[] = [];
  const getNestedIds = (unit: any): number[] => {
    let nestedIds = [unit.id];
    if (!unit.children) {
      return nestedIds;
    }
    for (const child of unit.children) {
      nestedIds = [...nestedIds, ...getNestedIds(child)];
    }
    return nestedIds;
  };

  for (const id of organizationUnitIds) {
    const unit = organizationTree.find((u) => u.id === id);
    if (unit) {
      ids = [...ids, ...getNestedIds(unit)];
    } else {
      ids.push(id);
    }
  }

  return [...new Set(ids)];
};
export const timeSince = (createdAt: number): string => {
  return (
    DateTime.fromMillis(+createdAt)
      .setZone("utc")
      .toRelative() || ""
  );
};
export const isInPast = (date: string): boolean => {
  const dueDateParsed = parse(date || "", "yyyy-MM-dd", new Date());
  const today = startOfDay(new Date());
  if (isBefore(dueDateParsed, today)) {
    return true;
  }
  return false;
};
export const formatDate = (date: number): string => {
  return DateTime.fromMillis(+date)
    .toFormat("DDD  HH:mm");
};
export const formatDateToTime = (date: number): string => {
  return DateTime.fromMillis(+date).toFormat("dd MMM yyyy HH:mm");
};
export const formatDateToDay = (date: number): string => {
  return DateTime.fromMillis(+date)
    .setZone("utc")
    .toFormat("dd MMM yyyy");
};
export const formatDateToInput = (date: number): string => {
  const newDate = DateTime.fromMillis(+date)
    .setZone("utc")
    .toFormat("yyyy-MM-dd");
  return newDate;
};
export const formatDateToInputWithTime = (date: number): string => {
  return DateTime.fromMillis(+date)
    .setZone("utc")
    .toFormat("yyyy-MM-dd'T'HH:mm");
};

export const formatDurationFromTimestamps = (
  start?: number | null,
  end?: number | null,
  options?: { fallbackToNow?: boolean },
): string => {
  const numericStart = Number(start);
  if (!Number.isFinite(numericStart) || numericStart <= 0) {
    return "—";
  }

  const numericEnd = Number(end);
  const shouldFallback = options?.fallbackToNow ?? false;
  const resolvedEnd =
    Number.isFinite(numericEnd) && numericEnd >= numericStart
      ? numericEnd
      : shouldFallback
      ? Date.now()
      : null;

  if (resolvedEnd === null) {
    return "—";
  }

  const diffMs = Math.max(0, resolvedEnd - numericStart);
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const durationToMinutes = (hours: number, minutes: number): number => {
  const safeHours = Number.isFinite(hours) ? Math.max(0, Math.floor(hours)) : 0;
  const safeMinutes = Number.isFinite(minutes)
    ? Math.max(0, Math.floor(minutes))
    : 0;
  return safeHours * 60 + safeMinutes;
};

export const minutesToDuration = (
  totalMinutes: number,
): { hours: number; minutes: number } => {
  const safeTotal = Number.isFinite(totalMinutes)
    ? Math.max(0, Math.floor(totalMinutes))
    : 0;
  return {
    hours: Math.floor(safeTotal / 60),
    minutes: safeTotal % 60,
  };
};
export const mapDocumentStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "ready_for_approval":
      return "Ready for Approval";
    case "published":
      return "Published";
    case "obsolete":
      return "Obsolete";
    case "None":
      return "None";
    default:
      return "Rejected";
  }
};
export const formatTimeAgo = (timestamp: number) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(timestamp);
};

export const mapChangeRequestStatus = (status: string) => {
  switch (status) {
    case "active":
      return "Active";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
};

export const mapActionTypeToMessage = (actionType: string) => {
  switch (actionType) {
    case "reviewed":
      return "Ready for Approval";
    case "reviewed_rejected":
      return "Request Changes";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "send_for_review":
      return "Send for Review";
    case "published":
      return "Published";
    case "obsolete":
      return "Obsolete";
    case "ready_for_approval":
      return "Send for Approval";
  }
};

export function snakeToCamelCase(str: string): string {
  return str
    .toLowerCase()
    .split("_")
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export const getFileNameFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  // First split by '/' to handle the UUID prefix
  const parts = url.split("/");
  // Get the last part which contains the filename
  const filename = parts[parts.length - 1];
  // Remove the UUID prefix (everything before the first underscore)
  return filename.substring(filename.indexOf("_") + 1);
};

export const parseCSVContentWithErrors = (
  csvContent: string,
): {
  recipients: Array<{
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
  }>;
  errors: string[];
} => {
  const lines = csvContent.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error("CSV file must contain headers and at least one data row");
  }

  // Parse headers (expected: name, email, phone, companyName)
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const expectedHeaders = ["name", "email", "phone", "companyName"];

  // Validate headers and create header map
  const headerMap: { [key: string]: number } = {};
  expectedHeaders.forEach((expectedHeader) => {
    const headerIndex = headers.findIndex(
      (h) => h.toLowerCase() === expectedHeader.toLowerCase(),
    );
    if (headerIndex === -1 && expectedHeader === "email") {
      throw new Error(`Required header '${expectedHeader}' not found in CSV`);
    }
    if (headerIndex !== -1) {
      headerMap[expectedHeader] = headerIndex;
    }
  });

  // Parse data rows
  const recipients: Array<{
    name: string;
    email: string;
    phone?: string;
    companyName?: string;
  }> = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      // Parse CSV row (handle quoted fields)
      const values = parseCSVRow(line);

      if (values.length < Math.max(...Object.values(headerMap)) + 1) {
        errors.push(`Row ${i + 1}: Not enough columns`);
        continue;
      }

      const name =
        headerMap.name !== undefined ? values[headerMap.name]?.trim() : "";
      const email =
        headerMap.email !== undefined ? values[headerMap.email]?.trim() : "";
      const phone =
        headerMap.phone !== undefined ? values[headerMap.phone]?.trim() : "";
      const companyName =
        headerMap.companyName !== undefined
          ? values[headerMap.companyName]?.trim()
          : "";

      if (!name || !email) {
        errors.push(`Row ${i + 1}: Name and email are required`);
        continue;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Row ${i + 1}: Invalid email format: ${email}`);
        continue;
      }

      recipients.push({
        name,
        email,
        phone: phone || undefined,
        companyName: companyName || undefined,
      });
    } catch (error) {
      errors.push(
        `Row ${i + 1}: Error parsing row - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  return { recipients, errors };
};

const parseCSVRow = (row: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < row.length) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
    i++;
  }

  result.push(current);
  return result.map((field) => field.replace(/^"|"$/g, ""));
};

export const formatNumber = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return "0";
  }
  return new Intl.NumberFormat("en-US").format(numeric);
};

export const formatCurrency = (
  value: number | string | null | undefined,
  currency: string = "USD",
) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(0);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numeric);
};

export const dateInputToEpoch = (
  value: string | null | undefined,
): number | null => {
  if (!value) {
    return null;
  }
  const candidate = DateTime.fromISO(value, { zone: "utc" });
  if (candidate.isValid) {
    return candidate.startOf("day").toMillis();
  }
  return null;
};

/** Pretty-print JSON for display (2-space indent). Handles strings (tries parse) and non-objects. */
export function formatJson(value: unknown): string {
  if (value == null) return "";
  try {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return value;
      }
    }
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

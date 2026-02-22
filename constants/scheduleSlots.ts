/**
 * Logic TKB: Ca sáng tiết 1-6, ca chiều 7-12, ca tối 13-15.
 * Mỗi tiết = 1 dòng trên lưới, xếp data đúng ô (absolute).
 */
export const SLOT_COUNT = 7;

/** Nhãn từng dòng: Tiết 1-2, 3-4, ..., 13-15 */
export const SLOT_LABELS: string[] = [
  "Tiết 1-2",   // Sáng
  "Tiết 3-4",
  "Tiết 5-6",
  "Tiết 7-8",   // Chiều
  "Tiết 9-10",
  "Tiết 11-12",
  "Tiết 13-15", // Tối
];

/**
 * Lấy giờ bắt đầu từ chuỗi (API trả "HH:mm" hoặc "HH:mm - HH:mm").
 */
function parseStartHour(startTime: string): number {
  if (!startTime || typeof startTime !== "string") return 7;
  const part = startTime.includes("-") ? startTime.split("-")[0].trim() : startTime.trim();
  const [h] = part.split(":").map((x) => parseInt(x, 10) || 0);
  return h;
}

/**
 * Map giờ bắt đầu → index dòng tiết 0..6.
 * Data load theo giờ (11:00-13:00, 13:30-15:30...) nên map đúng: 7→Tiết1-2, 9→3-4, 11→5-6, 13→7-8, 15→9-10, 17→11-12, 19→13-15.
 */
export function getSlotIndexFromStartTime(startTime: string): number {
  const h = parseStartHour(startTime);
  if (h <= 8) return 0;   // Tiết 1-2 (7h, 8h)
  if (h <= 10) return 1;  // Tiết 3-4 (9h)
  if (h <= 12) return 2;  // Tiết 5-6 (11h)
  if (h <= 14) return 3;  // Tiết 7-8 (13h, 13h30)
  if (h <= 16) return 4;  // Tiết 9-10 (15h, 15h30)
  if (h <= 18) return 5;  // Tiết 11-12 (17h)
  return 6;               // Tiết 13-15 (19h)
}

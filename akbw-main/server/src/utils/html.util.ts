/** Telegram parse_mode=HTML uchun foydalanuvchi matnini xavfsiz qilish (ism orqali havola/teg kiritilmasin) */
export const escapeHtml = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

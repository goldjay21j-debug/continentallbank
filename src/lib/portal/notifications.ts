/**
 * Continental Bank notification feed types and labels.
 *
 * Notifications are loaded from Supabase and shown in the bell popover
 * and full notification center.
 */

export type NotificationKind =
  | "account"
  | "withdrawal"
  | "refund"
  | "message"
  | "security"
  | "document";

export type NotificationSeverity = "info" | "success" | "warning" | "danger";

export type Notification = {
  id: string;
  user_id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  body: string;
  /** Optional link the row navigates to. */
  href?: string;
  /** Optional currency tag rendered as a small badge. */
  currency?: "USD" | "EUR" | "GBP";
  /** Optional figure shown right-aligned. */
  amount?: string;
  read: boolean;
  created_at: string;
};

export const NOTIFICATION_KIND_LABELS: Record<NotificationKind, string> = {
  account: "Account",
  withdrawal: "Withdrawal",
  refund: "Refund",
  message: "Message",
  security: "Security",
  document: "Document",
};

export function unreadCount(list: Notification[]) {
  return list.filter((n) => !n.read).length;
}

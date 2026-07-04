export type MessageSenderRole = "client" | "officer";
export type MessageThreadStatus = "open" | "awaiting_client" | "resolved" | "closed";

export type MessageAttachment = {
  id: string;
  name: string;
  size: string;
  /** e.g. "PDF", "PNG" */
  kind: string;
};

export type Message = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: MessageSenderRole;
  body: string;
  attachments?: MessageAttachment[];
  created_at: string;
};

export type MessageThread = {
  id: string;
  user_id: string;
  subject: string;
  status: MessageThreadStatus;
  /** Officer assigned (for admin view). */
  assigned_to?: { id: string; full_name: string } | null;
  last_message_at: string;
  unread_for_client: boolean;
  unread_for_officer: boolean;
  created_at: string;
  messages: Message[];
};

export const MESSAGE_STATUS_LABEL: Record<MessageThreadStatus, string> = {
  open: "Open",
  awaiting_client: "Awaiting reply",
  resolved: "Resolved",
  closed: "Closed",
};

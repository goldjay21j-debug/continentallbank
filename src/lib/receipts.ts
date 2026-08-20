import { formatCurrency } from "@/lib/utils";
import {
  BENEFICIARY_RAIL_LABEL,
  type BeneficiaryRail,
} from "@/lib/portal/beneficiaries";
import { DOCUMENT_TYPE_LABELS, type DocumentRecord, type DocumentType } from "@/lib/portal/documents";
import { KYC_METHODS, KYC_STATUS, type KycStatus } from "@/lib/constants";
import { formatWithdrawalMethod } from "@/lib/withdrawal-methods";
import type {
  BeneficiaryRow,
  GeneratedDocument,
  NotificationRow,
  Profile,
  RefundClaim,
  WithdrawalRequest,
} from "@/lib/types/database";

type DbClient = {
  from: (table: string) => any;
};

type DocumentBody = DocumentRecord["body"];
type Currency = "USD" | "EUR" | "GBP";

export type GeneratedDocumentInput = {
  userId: string;
  type: DocumentType;
  title: string;
  description: string;
  body: DocumentBody;
  currency?: Currency | null;
  reference?: string | null;
  sourceType?: string;
  sourceId?: string;
  adminId?: string | null;
};

export type NotificationInput = {
  userId: string;
  kind: NotificationRow["kind"];
  severity?: NotificationRow["severity"];
  title: string;
  body: string;
  href?: string;
  currency?: Currency | null;
  amountLabel?: string | null;
};

export async function issueGeneratedDocument(
  service: DbClient,
  input: GeneratedDocumentInput,
) {
  const body = JSON.stringify(input.body);
  const sizeLabel = `${Math.max(48, Math.ceil(body.length / 16))} KB`;

  const { data } = await service
    .from("generated_documents")
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      description: input.description,
      size_label: sizeLabel,
      currency: input.currency ?? null,
      reference: input.reference ?? referenceFor(input.type),
      source_type: input.sourceType ?? null,
      source_id: input.sourceId ?? null,
      body: input.body,
      issued_by_admin_id: input.adminId ?? null,
    })
    .select()
    .maybeSingle();

  return data as GeneratedDocument | null;
}

export async function notifyClient(service: DbClient, input: NotificationInput) {
  await service.from("notifications").insert({
    user_id: input.userId,
    kind: input.kind,
    severity: input.severity ?? "info",
    title: input.title,
    body: input.body,
    href: input.href ?? null,
    currency: input.currency ?? null,
    amount_label: input.amountLabel ?? null,
    read: false,
  });
}

export async function issueKycSubmissionReceipt(
  service: DbClient,
  profile: Profile,
  method: string,
  documentName: string,
) {
  const methodLabel = kycMethodLabel(method);
  const doc = await issueGeneratedDocument(service, {
    userId: profile.id,
    type: "kyc",
    title: "KYC submission receipt",
    description: `${methodLabel} received for compliance review.`,
    reference: referenceFor("kyc"),
    sourceType: "kyc",
    sourceId: profile.id,
    body: {
      heading: "KYC verification package received",
      subheading: "Compliance review pending",
      rows: [
        { label: "Account holder", value: profile.full_name },
        { label: "Account reference", value: profile.account_number ?? "Pending assignment" },
        { label: "Verification method", value: methodLabel },
        { label: "Document received", value: documentName },
        { label: "Status", value: "Submitted for admin review" },
      ],
      paragraph:
        "Continental Bank confirms receipt of the verification material above. A compliance officer will review the submission and update your account file.",
      closing: "Continental Bank · Compliance Office",
    },
  });

  await notifyClient(service, {
    userId: profile.id,
    kind: "account",
    severity: "info",
    title: "KYC submitted",
    body: `${methodLabel} received. Your verification package is awaiting admin review.`,
    href: "/dashboard/profile",
  });

  return doc;
}

export async function issueKycDecisionReceipt(
  service: DbClient,
  profile: Profile,
  status: Extract<KycStatus, "under_review" | "approved" | "rejected">,
  adminId: string,
  note?: string | null,
) {
  const statusLabel = KYC_STATUS[status];
  const severity: NotificationRow["severity"] =
    status === "approved" ? "success" : status === "rejected" ? "danger" : "warning";
  const doc = await issueGeneratedDocument(service, {
    userId: profile.id,
    type: "kyc",
    title: `KYC ${statusLabel.toLowerCase()} notice`,
    description: `Compliance has marked your verification as ${statusLabel.toLowerCase()}.`,
    reference: referenceFor("kyc"),
    sourceType: "kyc",
    sourceId: profile.id,
    adminId,
    body: {
      heading: `KYC verification ${statusLabel.toLowerCase()}`,
      subheading: "Compliance decision notice",
      rows: [
        { label: "Account holder", value: profile.full_name },
        { label: "Account reference", value: profile.account_number ?? "Pending assignment" },
        { label: "Decision", value: statusLabel },
        { label: "Reviewed by", value: "Continental Bank Compliance" },
        { label: "Officer note", value: note || "No exceptions recorded." },
      ],
      paragraph:
        status === "approved"
          ? "Your verification file has been accepted. Please keep your profile details current so the account remains in good standing."
          : status === "rejected"
            ? "Your verification file needs attention. Please review the officer note and submit an updated document from your profile."
            : "A compliance officer is actively reviewing your verification package.",
      closing: "Continental Bank · Compliance Office",
    },
  });

  await notifyClient(service, {
    userId: profile.id,
    kind: "account",
    severity,
    title: `KYC ${statusLabel.toLowerCase()}`,
    body:
      status === "approved"
        ? "Your verification package has been approved."
        : status === "rejected"
          ? "Your verification package needs a corrected document."
          : "Your verification package is now under active review.",
    href: "/dashboard/profile",
  });

  return doc;
}

export async function issueWithdrawalReceipt(
  service: DbClient,
  profile: Pick<Profile, "id" | "full_name" | "account_number">,
  request: Pick<WithdrawalRequest, "id" | "currency" | "amount" | "method" | "status" | "admin_note">,
  status: WithdrawalRequest["status"],
  adminId?: string | null,
) {
  const amount = formatCurrency(request.amount, request.currency);
  const label = statusLabel(status);
  const methodLabel = formatWithdrawalMethod(request.method);
  const doc = await issueGeneratedDocument(service, {
    userId: profile.id,
    type: "withdrawal_receipt",
    title: `Withdrawal ${label.toLowerCase()} · ${amount}`,
    description: `Outbound instruction via ${methodLabel}.`,
    currency: request.currency as Currency,
    reference: referenceFor("withdrawal_receipt"),
    sourceType: "withdrawal",
    sourceId: request.id,
    adminId,
    body: {
      heading: `Withdrawal ${label.toLowerCase()}`,
      subheading: "Outbound settlement instruction",
      rows: [
        { label: "Account holder", value: profile.full_name },
        { label: "Account reference", value: profile.account_number ?? "—" },
        { label: "Amount", value: amount },
        { label: "Method", value: methodLabel },
        { label: "Status", value: label },
        { label: "Officer note", value: request.admin_note || "No officer note recorded." },
      ],
      paragraph:
        status === "completed"
          ? "Continental Bank confirms the outbound instruction above has been marked completed."
          : status === "rejected"
            ? "The instruction above was not completed. Any reserved funds are returned according to account controls."
            : "The instruction above has been recorded and remains subject to officer controls before final settlement.",
      closing: "Continental Bank · Finance Office",
    },
  });

  await notifyClient(service, {
    userId: profile.id,
    kind: "withdrawal",
    severity: status === "rejected" ? "danger" : status === "pending" ? "info" : "success",
    title: `Withdrawal ${label.toLowerCase()}`,
    body: `${amount} via ${methodLabel} is ${label.toLowerCase()}.`,
    href: status === "completed" ? "/dashboard/documents?type=withdrawal_receipt" : "/dashboard/withdrawals",
    currency: request.currency as Currency,
    amountLabel: amount,
  });

  return doc;
}

export async function issueRefundReceipt(
  service: DbClient,
  claim: RefundClaim,
  status: RefundClaim["status"],
  adminId?: string | null,
  note?: string | null,
) {
  if (!claim.user_id) return null;
  const amount = claim.currency ? formatCurrency(claim.amount, claim.currency) : String(claim.amount);
  const label = statusLabel(status);
  const doc = await issueGeneratedDocument(service, {
    userId: claim.user_id,
    type: "refund_evidence",
    title: `Refund ${label.toLowerCase()} · ${amount}`,
    description: claim.transaction_reference
      ? `Request reference ${claim.transaction_reference}.`
      : "Refund request record and officer note.",
    currency: claim.currency,
    reference: referenceFor("refund_evidence"),
    sourceType: "refund",
    sourceId: claim.id,
    adminId,
    body: {
      heading: `Refund request ${label.toLowerCase()}`,
      subheading: "Refund and dispute record",
      rows: [
        { label: "Client", value: claim.claimant_name },
        { label: "Account reference", value: claim.account_reference ?? "—" },
        { label: "Amount", value: amount },
        { label: "Transaction reference", value: claim.transaction_reference ?? "—" },
        { label: "Status", value: label },
        { label: "Officer note", value: note || claim.admin_note || "No officer note recorded." },
      ],
      paragraph:
        status === "completed"
          ? "The refund request has been marked completed. Retain this receipt with your account records."
          : status === "rejected"
            ? "The refund request has been rejected. The officer note above explains the decision."
            : "The refund request has been recorded and remains subject to bank review.",
      closing: "Continental Bank · Refunds Desk",
    },
  });

  await notifyClient(service, {
    userId: claim.user_id,
    kind: "refund",
    severity: status === "rejected" ? "danger" : status === "pending" ? "info" : "success",
    title: `Refund ${label.toLowerCase()}`,
    body: `${amount} refund request is ${label.toLowerCase()}.`,
    href: status === "completed" || status === "approved" ? "/dashboard/documents?type=refund_evidence" : "/dashboard/refunds",
    currency: claim.currency,
    amountLabel: amount,
  });

  return doc;
}

export async function issueBeneficiaryReceipt(
  service: DbClient,
  beneficiary: BeneficiaryRow,
  status: BeneficiaryRow["status"],
  adminId?: string | null,
  note?: string | null,
) {
  const label = statusLabel(status);
  const railLabel = BENEFICIARY_RAIL_LABEL[beneficiary.rail as BeneficiaryRail];
  const doc = await issueGeneratedDocument(service, {
    userId: beneficiary.user_id,
    type: "beneficiary_receipt",
    title: `Beneficiary ${label.toLowerCase()} · ${beneficiary.nickname}`,
    description: `${beneficiary.currency} destination via ${railLabel}.`,
    currency: beneficiary.currency,
    reference: referenceFor("beneficiary_receipt"),
    sourceType: "beneficiary",
    sourceId: beneficiary.id,
    adminId,
    body: {
      heading: `Beneficiary ${label.toLowerCase()}`,
      subheading: "Outbound destination review",
      rows: [
        { label: "Nickname", value: beneficiary.nickname },
        { label: "Recipient", value: beneficiary.account_holder },
        { label: "Rail", value: railLabel },
        { label: "Currency", value: beneficiary.currency },
        { label: "Country", value: beneficiary.country },
        { label: "Destination", value: beneficiary.destination_masked },
        { label: "Status", value: label },
        { label: "Officer note", value: note || beneficiary.review_note || "No officer note recorded." },
      ],
      paragraph:
        status === "approved"
          ? "This beneficiary is approved for use in withdrawal routing, subject to normal account controls."
          : status === "rejected"
            ? "This beneficiary is not approved for withdrawal routing. Please review the officer note before resubmitting."
            : "This beneficiary has been submitted for officer verification.",
      closing: "Continental Bank · Finance Office",
    },
  });

  await notifyClient(service, {
    userId: beneficiary.user_id,
    kind: "document",
    severity: status === "approved" ? "success" : status === "rejected" ? "danger" : "info",
    title: `Beneficiary ${label.toLowerCase()}`,
    body: `${beneficiary.nickname} is ${label.toLowerCase()}.`,
    href: status === "pending" ? "/dashboard/beneficiaries" : "/dashboard/documents?type=beneficiary_receipt",
    currency: beneficiary.currency,
  });

  return doc;
}

export async function issueManualClientDocument(
  service: DbClient,
  input: {
    profile: Profile;
    type: DocumentType;
    title: string;
    description: string;
    paragraph: string;
    adminId: string;
  },
) {
  const label = DOCUMENT_TYPE_LABELS[input.type];
  const doc = await issueGeneratedDocument(service, {
    userId: input.profile.id,
    type: input.type,
    title: input.title,
    description: input.description,
    reference: referenceFor(input.type),
    sourceType: "manual_admin_issue",
    sourceId: input.profile.id,
    adminId: input.adminId,
    body: {
      heading: input.title,
      subheading: label,
      rows: [
        { label: "Account holder", value: input.profile.full_name },
        { label: "Account reference", value: input.profile.account_number ?? "—" },
        { label: "Document class", value: label },
        { label: "Issued by", value: "Continental Bank Private Office" },
      ],
      paragraph: input.paragraph,
      closing: "Continental Bank · Private Office",
    },
  });

  await notifyClient(service, {
    userId: input.profile.id,
    kind: "document",
    severity: "info",
    title: "New document issued",
    body: `${input.title} has been posted to your Document Vault.`,
    href: `/dashboard/documents?type=${input.type}`,
  });

  return doc;
}

export async function issueSecurityReceipt(
  service: DbClient,
  profile: Profile,
  eventTitle: string,
  details: string,
) {
  const doc = await issueGeneratedDocument(service, {
    userId: profile.id,
    type: "security_receipt",
    title: eventTitle,
    description: details,
    reference: referenceFor("security_receipt"),
    sourceType: "security",
    sourceId: profile.id,
    body: {
      heading: eventTitle,
      subheading: "Security control receipt",
      rows: [
        { label: "Account holder", value: profile.full_name },
        { label: "Account reference", value: profile.account_number ?? "—" },
        { label: "Event", value: eventTitle },
        { label: "Status", value: "Completed" },
      ],
      paragraph: details,
      closing: "Continental Bank · Security Office",
    },
  });

  await notifyClient(service, {
    userId: profile.id,
    kind: "security",
    severity: "success",
    title: eventTitle,
    body: details,
    href: "/dashboard/documents?type=security_receipt",
  });

  return doc;
}

export async function issueSupportReceipt(
  service: DbClient,
  input: {
    userId: string;
    subject: string;
    status: string;
    reply: string;
    adminId: string;
  },
) {
  const doc = await issueGeneratedDocument(service, {
    userId: input.userId,
    type: "support_receipt",
    title: `Support case ${input.status}`,
    description: input.subject,
    reference: referenceFor("support_receipt"),
    sourceType: "support",
    adminId: input.adminId,
    body: {
      heading: `Support case ${input.status}`,
      subheading: "Private office service receipt",
      rows: [
        { label: "Subject", value: input.subject },
        { label: "Status", value: statusLabel(input.status) },
        { label: "Officer reply", value: input.reply.slice(0, 240) },
      ],
      paragraph:
        "Continental Bank confirms the support case above has been updated by the Private Office.",
      closing: "Continental Bank · Private Office",
    },
  });

  await notifyClient(service, {
    userId: input.userId,
    kind: "message",
    severity: input.status === "resolved" || input.status === "closed" ? "success" : "info",
    title: `Support case ${input.status}`,
    body: input.subject,
    href: "/dashboard/documents?type=support_receipt",
  });

  return doc;
}

function kycMethodLabel(method: string | null | undefined) {
  return KYC_METHODS.find((m) => m.id === method)?.label ?? "Verification document";
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function referenceFor(type: DocumentType) {
  const prefix: Record<DocumentType, string> = {
    statement: "STMT",
    account_letter: "LTR",
    kyc: "KYC",
    withdrawal_receipt: "WD",
    refund_evidence: "REF",
    beneficiary_receipt: "BEN",
    security_receipt: "SEC",
    support_receipt: "SUP",
    tax: "TAX",
  };
  return `${prefix[type]}-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

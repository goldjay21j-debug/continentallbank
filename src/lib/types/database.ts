// Generated-style Database type for Supabase. Keep in sync with /supabase/migrations.

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          country: string | null;
          company: string | null;
          preferred_language: string;
          preferred_currency: string;
          role: "super_admin" | "finance_admin" | "support_admin" | "client";
          account_status: "pending" | "approved" | "rejected" | "suspended";
          is_verified: boolean;
          escrow_account_status: "not_started" | "active";
          escrow_account_reference: string | null;
          escrow_account_opened_at: string | null;
          kyc_status: "not_submitted" | "submitted" | "under_review" | "approved" | "rejected";
          kyc_method:
            | "passport"
            | "national_id"
            | "drivers_license"
            | "proof_of_address"
            | "source_of_funds"
            | "business_registry"
            | null;
          kyc_document_name: string | null;
          kyc_document_path: string | null;
          kyc_document_mime_type: string | null;
          kyc_submitted_at: string | null;
          kyc_reviewed_at: string | null;
          kyc_reviewed_by_admin_id: string | null;
          kyc_review_note: string | null;
          account_number: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["profiles"]["Row"],
          "created_at" | "updated_at"
        > & { created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          currency: "USD" | "EUR" | "GBP";
          available_balance: number;
          pending_balance: number;
          total_withdrawn: number;
          updated_at: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["wallets"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["wallets"]["Row"]>;
      };
      ledger_entries: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          admin_id: string | null;
          currency: string;
          action_type: string;
          amount: number;
          balance_before: number;
          balance_after: number;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ledger_entries"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        // Immutability is enforced by a DB trigger, not the TS layer
        Update: Partial<Database["public"]["Tables"]["ledger_entries"]["Row"]>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          currency: string;
          type:
            | "deposit"
            | "withdrawal"
            | "adjustment"
            | "fee"
            | "transfer"
            | "interest";
          amount: number;
          status: "pending" | "completed" | "rejected";
          description: string | null;
          created_by_admin_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transactions"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
      };
      withdrawal_requests: {
        Row: {
          id: string;
          user_id: string;
          currency: string;
          amount: number;
          method: string;
          payment_details: Json;
          notes: string | null;
          status:
            | "draft"
            | "submitted"
            | "pending"
            | "pending_review"
            | "awaiting_fee_completion"
            | "approved"
            | "approved_for_processing"
            | "processing"
            | "paid"
            | "completed"
            | "rejected"
            | "failed"
            | "cancelled";
          case_id: string | null;
          escrow_contract_id: string | null;
          release_processing_fee: number;
          release_processing_fee_percentage: number;
          net_amount: number | null;
          fee_status: "unpaid" | "pending_verification" | "completed";
          release_status: "not_eligible" | "eligible" | "blocked" | "under_review";
          provider_status: string | null;
          provider_reference: string | null;
          admin_note: string | null;
          processed_by_admin_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["withdrawal_requests"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["withdrawal_requests"]["Row"]>;
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          message: string;
          status: "open" | "in_progress" | "resolved" | "closed";
          admin_reply: string | null;
          assigned_to_admin_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["support_tickets"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["support_tickets"]["Row"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          admin_id: string;
          user_id: string | null;
          action_type: string;
          currency: string | null;
          old_value: Json | null;
          new_value: Json | null;
          note: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
      admin_notes: {
        Row: {
          id: string;
          admin_id: string;
          user_id: string;
          note: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["admin_notes"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_notes"]["Row"]>;
      };
      login_history: {
        Row: {
          id: string;
          user_id: string;
          ip_address: string | null;
          device: string | null;
          browser: string | null;
          location: string | null;
          login_time: string;
        };
        Insert: Omit<Database["public"]["Tables"]["login_history"]["Row"], "id" | "login_time"> & {
          id?: string;
          login_time?: string;
        };
        Update: Partial<Database["public"]["Tables"]["login_history"]["Row"]>;
      };
      refund_claims: {
        Row: {
          id: string;
          user_id: string | null;
          claim_type: "transaction_dispute" | "public_claim";
          claimant_name: string;
          claimant_email: string;
          claimant_phone: string | null;
          account_reference: string | null;
          transaction_reference: string | null;
          related_transaction_id: string | null;
          currency: "USD" | "EUR" | "GBP" | null;
          amount: number;
          description: string;
          supporting_info: Json;
          status: "pending" | "under_review" | "approved" | "rejected" | "completed";
          admin_note: string | null;
          processed_by_admin_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["refund_claims"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["refund_claims"]["Row"]>;
      };
      generated_documents: {
        Row: {
          id: string;
          user_id: string;
          type:
            | "statement"
            | "account_letter"
            | "kyc"
            | "withdrawal_receipt"
            | "refund_evidence"
            | "beneficiary_receipt"
            | "security_receipt"
            | "support_receipt"
            | "tax";
          title: string;
          description: string;
          size_label: string;
          currency: "USD" | "EUR" | "GBP" | null;
          reference: string | null;
          source_type: string | null;
          source_id: string | null;
          body: Json;
          issued_by_admin_id: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["generated_documents"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["generated_documents"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: "account" | "withdrawal" | "refund" | "message" | "security" | "document";
          severity: "info" | "success" | "warning" | "danger";
          title: string;
          body: string;
          href: string | null;
          currency: "USD" | "EUR" | "GBP" | null;
          amount_label: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["notifications"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      beneficiaries: {
        Row: {
          id: string;
          user_id: string;
          nickname: string;
          account_holder: string;
          rail:
            | "bank_wire"
            | "sepa"
            | "uk_faster"
            | "paypal"
            | "wise"
            | "revolut"
            | "zelle"
            | "cashapp";
          currency: "USD" | "EUR" | "GBP";
          country: string;
          destination_masked: string;
          bank: string | null;
          notes: string | null;
          status: "pending" | "approved" | "rejected" | "expired";
          is_default: boolean;
          submitted_by_full_name: string;
          reviewed_by_admin_id: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["beneficiaries"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["beneficiaries"]["Row"]>;
      };
      cases: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          complaint_type: string;
          summary: string;
          evidence_summary: string | null;
          counterparty_name: string | null;
          counterparty_contact: string | null;
          amount_claimed: number;
          currency: "USD" | "EUR" | "GBP";
          status:
            | "draft"
            | "submitted"
            | "under_review"
            | "accepted"
            | "rejected"
            | "assigned"
            | "recovered"
            | "closed";
          assigned_to_admin_id: string | null;
          provider_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["cases"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["cases"]["Row"]>;
      };
      case_parties: {
        Row: {
          id: string;
          case_id: string;
          user_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          role:
            | "claimant"
            | "counterparty"
            | "beneficiary"
            | "provider"
            | "legal_representative"
            | "other";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["case_parties"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["case_parties"]["Row"]>;
      };
      kyc_submissions: {
        Row: {
          id: string;
          user_id: string;
          method:
            | "passport"
            | "national_id"
            | "drivers_license"
            | "proof_of_address"
            | "source_of_funds"
            | "business_registry";
          status: "not_started" | "pending_review" | "verified" | "declined" | "resubmission_required";
          document_file_id: string | null;
          notes: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by_admin_id: string | null;
          review_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["kyc_submissions"]["Row"],
          "id" | "submitted_at" | "created_at" | "updated_at"
        > & { id?: string; submitted_at?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["kyc_submissions"]["Row"]>;
      };
      uploaded_files: {
        Row: {
          id: string;
          user_id: string;
          case_id: string | null;
          kyc_submission_id: string | null;
          file_kind: "evidence" | "kyc" | "receipt" | "admin_document" | "message_attachment";
          bucket: string;
          path: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          visibility: "private" | "admin_only";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["uploaded_files"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["uploaded_files"]["Row"]>;
      };
      recovery_kyc_reviews: {
        Row: {
          id: string;
          user_id: string;
          kyc_submission_id: string | null;
          admin_id: string;
          decision: "verified" | "declined" | "resubmission_required";
          note: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["recovery_kyc_reviews"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["recovery_kyc_reviews"]["Row"]>;
      };
      escrow_contracts: {
        Row: {
          id: string;
          user_id: string;
          case_id: string;
          reference: string;
          status:
            | "draft"
            | "pending_setup"
            | "active"
            | "ready_for_release"
            | "release_approved"
            | "frozen"
            | "closed";
          release_status: "not_eligible" | "eligible" | "blocked" | "under_review";
          release_conditions_open: boolean;
          provider_reference: string | null;
          currency: "USD" | "EUR" | "GBP";
          total_recovered: number;
          available_for_withdrawal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["escrow_contracts"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["escrow_contracts"]["Row"]>;
      };
      recovered_funds_entries: {
        Row: {
          id: string;
          escrow_contract_id: string;
          case_id: string;
          user_id: string;
          currency: "USD" | "EUR" | "GBP";
          amount: number;
          source: string | null;
          provider_reference: string | null;
          note: string | null;
          recorded_by_admin_id: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["recovered_funds_entries"]["Row"],
          "id" | "created_at"
        > & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["recovered_funds_entries"]["Row"]>;
      };
      disputes: {
        Row: {
          id: string;
          user_id: string;
          case_id: string | null;
          escrow_contract_id: string | null;
          status: "open" | "under_review" | "resolved" | "closed";
          title: string;
          description: string;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["disputes"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["disputes"]["Row"]>;
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          case_id: string | null;
          escrow_contract_id: string | null;
          sender_id: string;
          body: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Wallet = Database["public"]["Tables"]["wallets"]["Row"];
export type LedgerEntry = Database["public"]["Tables"]["ledger_entries"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type WithdrawalRequest = Database["public"]["Tables"]["withdrawal_requests"]["Row"];
export type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type AdminNote = Database["public"]["Tables"]["admin_notes"]["Row"];
export type LoginHistoryEntry = Database["public"]["Tables"]["login_history"]["Row"];
export type RefundClaim = Database["public"]["Tables"]["refund_claims"]["Row"];
export type GeneratedDocument = Database["public"]["Tables"]["generated_documents"]["Row"];
export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
export type BeneficiaryRow = Database["public"]["Tables"]["beneficiaries"]["Row"];
export type RecoveryCase = Database["public"]["Tables"]["cases"]["Row"];
export type CaseParty = Database["public"]["Tables"]["case_parties"]["Row"];
export type KycSubmission = Database["public"]["Tables"]["kyc_submissions"]["Row"];
export type UploadedFile = Database["public"]["Tables"]["uploaded_files"]["Row"];
export type RecoveryKycReview = Database["public"]["Tables"]["recovery_kyc_reviews"]["Row"];
export type EscrowContract = Database["public"]["Tables"]["escrow_contracts"]["Row"];
export type RecoveredFundsEntry =
  Database["public"]["Tables"]["recovered_funds_entries"]["Row"];
export type Dispute = Database["public"]["Tables"]["disputes"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseConfigured } from "@/lib/auth-mode";
import { createServiceClient } from "@/lib/supabase/server";

const KYC_BUCKET = "kyc-documents";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  await requireAdmin();
  const { userId } = await params;

  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "KYC document storage is not configured." }, { status: 404 });
  }

  const service = createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("kyc_document_path")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.kyc_document_path) {
    return NextResponse.json({ error: "No KYC document found." }, { status: 404 });
  }

  const { data, error } = await service.storage
    .from(KYC_BUCKET)
    .createSignedUrl(profile.kyc_document_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Could not open document." }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}

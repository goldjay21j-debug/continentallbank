import { NextResponse, type NextRequest } from "next/server";
import { type DocumentRecord, DOCUMENT_TYPE_LABELS } from "@/lib/portal/documents";
import { getAuthedUser, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/auth-mode";

/**
 * Serves a printable A4-styled HTML page for a document. The browser's
 * "Save as PDF" produces a fully laid-out, brand-correct PDF —
 * no external libraries, no fonts to ship.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getAuthedUser();
  let doc: DocumentRecord | null = null;

  if (user && supabaseConfigured()) {
    const service = createServiceClient();
    const { data } = await service
      .from("generated_documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (data && (data.user_id === user.id || isAdmin(user.profile.role))) {
      doc = {
        id: data.id,
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        description: data.description,
        size: data.size_label,
        currency: data.currency ?? undefined,
        reference: data.reference ?? undefined,
        created_at: data.created_at,
        body: isDocumentBody(data.body)
          ? data.body
          : {
              heading: data.title,
              rows: [{ label: "Reference", value: data.reference ?? data.id }],
              paragraph: data.description,
            },
      };
    }
  }

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  const html = renderDocumentHTML(doc);
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=0",
    },
  });
}

function renderDocumentHTML(doc: DocumentRecord) {
  const date = new Date(doc.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const typeLabel = DOCUMENT_TYPE_LABELS[doc.type];

  const rows = doc.body.rows
    .map(
      (r) => `
      <tr>
        <th>${escape(r.label)}</th>
        <td>${escape(r.value)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escape(doc.title)} · Continental Bank</title>
  <style>
    :root {
      --navy: #07111F;
      --champagne: #C8A96A;
      --champagne-soft: #DBBC72;
      --muted: #8A9099;
      --ivory: #F6F1E8;
      --line: rgba(7, 17, 31, 0.08);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ECE5D4; color: var(--navy); font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    body { padding: 32px; }
    .toolbar {
      max-width: 820px;
      margin: 0 auto 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .toolbar a, .toolbar button {
      font-family: inherit;
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 9px 16px;
      border-radius: 3px;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid var(--line);
      background: white;
      color: var(--navy);
    }
    .toolbar button.primary {
      background: var(--navy);
      color: white;
      border-color: var(--navy);
    }
    .page {
      max-width: 820px;
      min-height: 1100px;
      margin: 0 auto;
      padding: 56px 64px 80px;
      background: #FCFAF5;
      box-shadow: 0 24px 56px -28px rgba(7, 17, 31, 0.18), 0 8px 20px -16px rgba(7, 17, 31, 0.1);
      position: relative;
      overflow: hidden;
    }
    .page::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(at 15% 15%, rgba(200,169,106,0.06) 0%, transparent 50%),
        radial-gradient(at 85% 85%, rgba(7,17,31,0.03) 0%, transparent 50%);
    }
    .head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 22px;
      border-bottom: 1px solid var(--line);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .crest {
      width: 44px;
      height: 44px;
      border: 1px solid var(--champagne);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: Georgia, serif;
      color: var(--champagne);
      font-size: 18px;
      letter-spacing: 1px;
    }
    .wordmark { line-height: 1; }
    .wordmark .name {
      font-size: 14px;
      letter-spacing: 0.06em;
      font-weight: 600;
      text-transform: uppercase;
    }
    .wordmark .tag {
      margin-top: 4px;
      font-size: 9px;
      letter-spacing: 0.3em;
      color: var(--champagne);
      text-transform: uppercase;
    }
    .doc-meta {
      text-align: right;
      font-size: 10.5px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .doc-meta .ref {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      letter-spacing: 0.04em;
      color: var(--navy);
      margin-top: 4px;
    }

    .eyebrow {
      margin-top: 40px;
      font-size: 10.5px;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--champagne);
    }
    h1.title {
      margin: 12px 0 6px;
      font-family: Georgia, serif;
      font-size: 30px;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .sub {
      font-size: 13px;
      color: var(--muted);
    }

    table {
      width: 100%;
      margin-top: 30px;
      border-collapse: collapse;
    }
    table th, table td {
      padding: 12px 0;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
      font-size: 12.5px;
    }
    table th {
      width: 44%;
      text-align: left;
      color: var(--muted);
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 10.5px;
    }
    table td {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-weight: 500;
    }

    .body-p {
      margin-top: 28px;
      font-size: 12.5px;
      line-height: 1.7;
      color: rgba(7,17,31,0.78);
      max-width: 60ch;
    }
    .closing {
      margin-top: 28px;
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
    }

    .foot {
      position: absolute;
      left: 64px;
      right: 64px;
      bottom: 32px;
      display: flex;
      justify-content: space-between;
      gap: 24px;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      border-top: 1px solid var(--line);
      padding-top: 18px;
    }

    @media print {
      body { background: white; padding: 0; }
      .toolbar { display: none; }
      .page { box-shadow: none; max-width: none; min-height: 0; margin: 0; padding: 28mm 22mm; background: white; }
      .page::after { display: none; }
    }
    @page { size: A4; margin: 0; }
  </style>
</head>
<body>
  <div class="toolbar">
    <a href="javascript:history.back()">Back</a>
    <button class="primary" onclick="window.print()">Save as PDF</button>
  </div>

  <article class="page">
    <header class="head">
      <div class="brand">
        <span class="crest">CB</span>
        <div class="wordmark">
          <div class="name">Continental</div>
          <div class="tag">Private · Bank</div>
        </div>
      </div>
      <div class="doc-meta">
        <div>${escape(typeLabel)}</div>
        ${doc.reference ? `<div class="ref">${escape(doc.reference)}</div>` : ""}
        <div style="margin-top:4px;">${escape(date)}</div>
      </div>
    </header>

    <div class="eyebrow">${escape(typeLabel)}</div>
    <h1 class="title">${escape(doc.body.heading)}</h1>
    ${doc.body.subheading ? `<div class="sub">${escape(doc.body.subheading)}</div>` : ""}

    <table>
      <tbody>${rows}</tbody>
    </table>

    ${doc.body.paragraph ? `<p class="body-p">${escape(doc.body.paragraph)}</p>` : ""}
    ${doc.body.closing ? `<div class="closing">${escape(doc.body.closing)}</div>` : ""}

    <footer class="foot">
      <span>Continental Bank · Geneva</span>
      <span>Place de la Concorde 12 · CH-1204 Geneva</span>
    </footer>
  </article>
</body>
</html>`;
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isDocumentBody(value: unknown): value is DocumentRecord["body"] {
  return Boolean(
    value &&
      typeof value === "object" &&
      "heading" in value &&
      "rows" in value &&
      Array.isArray((value as { rows?: unknown }).rows),
  );
}

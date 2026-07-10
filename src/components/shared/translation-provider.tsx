"use client";

import { useEffect } from "react";
import { RTL_LOCALES, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Whole-site translation layer.
 *
 * The app's UI text is authored in English. Rather than rewire every component
 * through a key-based `t()`, this provider translates the *rendered* DOM into the
 * active locale using a source-keyed dictionary (English string → translation): it
 * swaps matching text nodes and a few user-facing attributes, re-applying to nodes
 * added on client navigation via a MutationObserver.
 *
 * Matching is whitespace- and entity-normalized: dictionary keys come from source
 * where a multi-line paragraph collapses to one line and characters like `&`/`<`
 * appear as `&amp;`/`&lt;`, whereas the rendered DOM text has original whitespace and
 * decoded characters. We normalize both sides so long paragraphs and `&`-strings
 * translate too. English is a no-op; dynamic values never match a key. The observer
 * processes only changed nodes — never a full re-walk — so it stays cheap.
 *
 * Opt out of translation for a subtree with `data-no-translate`.
 */

type Dict = Record<string, string>;

const LOADERS: Partial<Record<Locale, () => Promise<{ default: Dict }>>> = {
  fr: () => import("@/lib/i18n/locales/fr"),
  de: () => import("@/lib/i18n/locales/de"),
  es: () => import("@/lib/i18n/locales/es"),
  it: () => import("@/lib/i18n/locales/it"),
  ar: () => import("@/lib/i18n/locales/ar"),
  zh: () => import("@/lib/i18n/locales/zh"),
};

const ATTRS = ["placeholder", "title", "aria-label", "alt"] as const;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "SVG"]);

let decoderEl: HTMLTextAreaElement | null = null;
function decodeEntities(s: string): string {
  if (s.indexOf("&") === -1) return s;
  if (!decoderEl) decoderEl = document.createElement("textarea");
  decoderEl.innerHTML = s;
  return decoderEl.value;
}

function normalize(s: string): string {
  // Unify "smart" punctuation to ASCII so curly-vs-straight quotes never break a
  // match (extraction flattens them; the rendered DOM keeps the curly originals),
  // then collapse whitespace. Applied to both dictionary keys and looked-up DOM text.
  return s
    .replace(/[‘’‚‛′]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/…/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build a normalized+decoded lookup: decoded/collapsed English → decoded translation. */
function buildLookup(raw: Dict): Dict {
  const out: Dict = {};
  for (const en in raw) {
    const key = normalize(decodeEntities(en));
    if (!key) continue;
    const val = decodeEntities(raw[en]);
    if (val && val !== key) out[key] = val;
  }
  return out;
}

function isSkipped(el: Element | null): boolean {
  let node: Element | null = el;
  while (node) {
    const tag = node.tagName ? node.tagName.toUpperCase() : "";
    if (SKIP_TAGS.has(tag)) return true;
    if ((node as HTMLElement).isContentEditable) return true;
    if (node.hasAttribute && node.hasAttribute("data-no-translate")) return true;
    node = node.parentElement;
  }
  return false;
}

function translateTextNode(node: Text, dict: Dict) {
  if (isSkipped(node.parentElement)) return;
  const raw = node.nodeValue ?? "";
  if (!raw.trim()) return;
  const t = dict[normalize(raw)];
  if (t != null) {
    const lead = raw.slice(0, raw.length - raw.trimStart().length);
    const trail = raw.slice(raw.trimEnd().length);
    node.nodeValue = lead + t + trail;
  }
}

function translateAttrs(el: Element, dict: Dict) {
  for (const attr of ATTRS) {
    if (!el.hasAttribute(attr)) continue;
    const v = el.getAttribute(attr) ?? "";
    if (!v.trim()) continue;
    const t = dict[normalize(v)];
    if (t != null) el.setAttribute(attr, t);
  }
}

function translateSubtree(root: Element, dict: Dict) {
  if (isSkipped(root)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const v = node.nodeValue;
      if (!v || !v.trim()) return NodeFilter.FILTER_REJECT;
      return isSkipped(node.parentElement) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  for (const node of nodes) translateTextNode(node, dict);

  translateAttrs(root, dict);
  root.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(",")).forEach((el) => {
    if (!isSkipped(el)) translateAttrs(el, dict);
  });
}

export function TranslationProvider({ locale }: { locale: Locale }) {
  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

    // English is the source language — the DOM is already correct.
    if (locale === "en") return;
    const loader = LOADERS[locale];
    if (!loader) return;

    let cancelled = false;
    let observer: MutationObserver | null = null;

    loader()
      .then((mod) => {
        if (cancelled) return;
        const dict = buildLookup(mod.default);

        const process = (records: MutationRecord[]) => {
          for (const r of records) {
            if (r.type === "characterData") {
              if (r.target.nodeType === Node.TEXT_NODE) translateTextNode(r.target as Text, dict);
            } else if (r.type === "childList") {
              r.addedNodes.forEach((added) => {
                if (added.nodeType === Node.TEXT_NODE) translateTextNode(added as Text, dict);
                else if (added.nodeType === Node.ELEMENT_NODE) translateSubtree(added as Element, dict);
              });
              if (r.target.nodeType === Node.ELEMENT_NODE) translateAttrs(r.target as Element, dict);
            }
          }
        };

        observer = new MutationObserver((records) => {
          observer!.disconnect();
          try {
            process(records);
          } finally {
            observer!.observe(document.body, { childList: true, subtree: true, characterData: true });
          }
        });

        translateSubtree(document.body, dict);
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      })
      .catch(() => {
        /* locale chunk unavailable — leave the page in English */
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [locale]);

  return null;
}

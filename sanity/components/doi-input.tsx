"use client";

import { Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useState } from "react";
import { type StringInputProps, useDocumentOperation, useFormValue } from "sanity";

type CrossrefWork = {
  title?: string[];
  subtitle?: string[];
  author?: { given?: string; family?: string; name?: string }[];
  "container-title"?: string[];
  volume?: string;
  issue?: string;
  page?: string;
  "article-number"?: string;
  publisher?: string;
  issued?: { "date-parts"?: number[][] };
  type?: string;
};

const TYPE_MAP: Record<string, string> = {
  "journal-article": "journal-article",
  "book-chapter": "book-chapter",
  book: "book",
  monograph: "book",
  "proceedings-article": "conference-paper",
  report: "report",
  dataset: "dataset",
};

const initials = (given = "") =>
  given.split(/[\s-]+/).filter(Boolean).map((g) => `${g[0].toUpperCase()}.`).join("");

export const normalizeDoi = (raw: string) =>
  raw.trim().replace(/^doi:\s*/i, "").replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");

/**
 * DOI field with a "Fill from DOI" button: fetches the registered metadata from Crossref
 * (public API, no key) and fills the citation fields. Editors review before publishing.
 */
export function DoiInput(props: StringInputProps) {
  const id = String(useFormValue(["_id"]) ?? "").replace(/^drafts\./, "");
  const type = String(useFormValue(["_type"]) ?? "publication");
  const { patch } = useDocumentOperation(id, type);
  const [state, setState] = useState<{ tone: "default" | "positive" | "critical"; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const fill = async () => {
    const doi = normalizeDoi(props.value ?? "");
    if (!/^10\.\d{4,9}\/\S+$/.test(doi)) {
      setState({ tone: "critical", msg: "Enter a DOI that starts with 10." });
      return;
    }
    setBusy(true);
    setState(null);
    try {
      const res = await fetch(`https://api.crossref.org/works/${doi.split("/").map(encodeURIComponent).join("/")}`);
      if (!res.ok) throw new Error(res.status === 404 ? "This DOI is not registered with Crossref." : `Crossref error ${res.status}`);
      const m = (await res.json()).message as CrossrefWork;
      const title = [m.title?.[0], m.subtitle?.[0]].filter(Boolean).join(": ").replace(/<[^>]+>/g, "");
      const authors = (m.author ?? []).map((a) => (a.family ? `${a.family}, ${initials(a.given)}` : a.name ?? "")).filter(Boolean);
      const year = m.issued?.["date-parts"]?.[0]?.[0];
      const set: Record<string, unknown> = {
        doi,
        ...(title && { title }),
        ...(authors.length && { authors }),
        ...(year && { year }),
        ...(m["container-title"]?.[0] && { container: m["container-title"][0] }),
        ...(m.volume && { volume: m.volume }),
        ...(m.issue && { issue: m.issue }),
        ...((m.page || m["article-number"]) && { pages: m.page ?? m["article-number"] }),
        ...(m.publisher && { publisher: m.publisher }),
        ...(m.type && TYPE_MAP[m.type] && { type: TYPE_MAP[m.type] }),
        verificationStatus: "verified",
        verificationNotes: [`Imported from Crossref on ${new Date().toISOString().slice(0, 10)}`],
      };
      patch.execute([{ set }]);
      setState({ tone: "positive", msg: "Citation filled from Crossref. Please check the fields, add themes and generate the slug." });
    } catch (e) {
      setState({ tone: "critical", msg: e instanceof Error ? e.message : "Could not reach Crossref." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap={3}>
      <Flex gap={2} align="flex-start">
        <div style={{ flex: 1 }}>{props.renderDefault(props)}</div>
        <Button text={busy ? "Fetching…" : "Fill from DOI"} mode="ghost" onClick={fill} disabled={busy || !props.value} />
      </Flex>
      {state && (
        <Card padding={3} radius={2} tone={state.tone}>
          <Text size={1}>{state.msg}</Text>
        </Card>
      )}
    </Stack>
  );
}

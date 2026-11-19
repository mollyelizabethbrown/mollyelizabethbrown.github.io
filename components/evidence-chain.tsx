import type { ChainStep } from "@/lib/types";

/**
 * "Orbit to outcome": the five links from satellite observation to decision.
 * Rendered as an ordered list (semantic), drawn as a connected sequence.
 */
export function EvidenceChain({ steps, tone = "pine" }: { steps: ChainStep[]; tone?: "pine" | "paper" }) {
  const onPine = tone === "pine";
  return (
    <ol className="relative grid gap-10 md:grid-cols-5 md:gap-6" aria-label="From satellite observation to decision">
      <span
        aria-hidden
        className={`absolute left-[0.6rem] top-3 bottom-3 w-px md:left-0 md:right-0 md:top-[0.6rem] md:bottom-auto md:h-px md:w-auto ${onPine ? "bg-gold/40" : "bg-stone"}`}
      />
      {steps.map((s, i) => (
        <li key={s.step} className="relative pl-10 md:pl-0 md:pt-10">
          <span
            aria-hidden
            className={`absolute left-0 top-0 grid h-5 w-5 place-items-center rounded-full border ${onPine ? "border-gold bg-pine" : "border-gold-ink bg-paper"}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${onPine ? "bg-gold" : "bg-gold-ink"}`} />
          </span>
          <p className={`font-serif text-sm ${onPine ? "text-gold" : "text-gold-ink"}`}>{String(i + 1).padStart(2, "0")}</p>
          <h3 className="mt-1 font-serif text-xl leading-snug">{s.step}</h3>
          <p className={`mt-2 text-sm leading-relaxed ${onPine ? "text-mist" : "text-muted"}`}>{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

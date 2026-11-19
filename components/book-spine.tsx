/** Typographic stand-in shown only until verified cover artwork is approved. */
export function BookSpine({ title, year }: { title: string; year: number }) {
  return (
    <div className="on-pine flex h-full flex-col justify-between bg-pine p-3 text-paper" role="img" aria-label={`${title} (${year})`}>
      <span className="font-serif text-[0.8rem] leading-tight">{title}</span>
      <span className="text-[0.6rem] tracking-[0.14em] text-gold">M. E. BROWN · {year}</span>
    </div>
  );
}

export const SectionHeading = ({ overline, title, subtitle, align = "left" }) => (
  <div className={`mb-6 md:mb-10 ${align === "center" ? "text-center" : ""}`}>
    {overline && (
      <div className="text-xs font-bold tracking-[0.25em] uppercase text-[#00D4AA] mb-2">{overline}</div>
    )}
    <h2 className="font-display font-black text-3xl md:text-5xl uppercase leading-[0.95]">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-3 text-sm md:text-base text-[#94A3B8] max-w-2xl">{subtitle}</p>
    )}
  </div>
);

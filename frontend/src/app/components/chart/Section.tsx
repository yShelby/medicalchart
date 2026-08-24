export function Section({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="font-mono uppercase tracking-widest text-muted-foreground mb-1 text-[12px]">{label}</p>
      <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

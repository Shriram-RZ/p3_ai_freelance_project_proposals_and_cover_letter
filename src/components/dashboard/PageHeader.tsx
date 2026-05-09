type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-brand-300/80">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-white/60 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

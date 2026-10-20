type Crumb = {
  label: string;
  current?: boolean;
};

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Caminho da página">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
            )}
            <span
              aria-current={item.current ? "page" : undefined}
              className={
                item.current
                  ? "font-bold text-blue-600"
                  : "font-medium text-slate-500"
              }
            >
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
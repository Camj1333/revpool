interface EmptyStateProps {
  icon?: "trophy" | "chart" | "users" | "folder";
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const icons: Record<string, React.ReactNode> = {
  trophy: (
    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6h24v4a12 12 0 01-24 0V6zM8 6h4M36 6h4M8 6v6a4 4 0 004 4M40 6v6a4 4 0 01-4 4M20 26v4M28 26v4M16 34h16a2 2 0 012 2v2H14v-2a2 2 0 012-2zM20 30h8" />
    </svg>
  ),
  chart: (
    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 40V24M16 40V16M24 40V20M32 40V12M40 40V8" />
    </svg>
  ),
  users: (
    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 20a6 6 0 100-12 6 6 0 000 12zM30 20a6 6 0 100-12 6 6 0 000 12zM6 40v-2a8 8 0 018-8h8a8 8 0 018 8v2M34 30a8 8 0 018 8v2" />
    </svg>
  ),
  folder: (
    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 14V10a2 2 0 012-2h10l4 4h18a2 2 0 012 2v22a2 2 0 01-2 2H8a2 2 0 01-2-2V14z" />
    </svg>
  ),
};

export function EmptyState({ icon = "folder", title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-center">
      <div className="flex justify-center mb-4">{icons[icon]}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>}
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm"
          >
            {action.label}
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}

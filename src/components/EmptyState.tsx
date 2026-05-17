import Link from "next/link";

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-[28px] border border-dashed border-gray-200 bg-white/80 px-6 py-10 text-center shadow-[0_12px_40px_rgba(15,23,42,0.03)] ${className}`}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
        {icon}
      </div>
      <p className="font-semibold text-gray-950 mb-2">{title}</p>
      <p className="mx-auto max-w-md text-sm leading-6 text-gray-500">{description}</p>
      {actionHref && actionLabel && (
        <div className="mt-5">
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}

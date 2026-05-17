import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  href: string;
  className?: string;
  iconSize?: string;
  textSize?: string;
  showWordmark?: boolean;
};

export function Brand({
  href,
  className = "",
  iconSize = "h-9 w-9",
  textSize = "text-lg",
  showWordmark = true,
}: BrandProps) {
  return (
    <Link
      href={href}
      aria-label="DownFor"
      className={`inline-flex items-center gap-3 shrink-0 ${className}`}
    >
      <Image
        src="/downfor-mark.svg"
        alt=""
        aria-hidden="true"
        width={64}
        height={64}
        className={`${iconSize} flex-none`}
      />
      {showWordmark ? (
        <span
          className={`${textSize} font-black tracking-[-0.05em] leading-none font-[family:var(--font-body)]`}
        >
          <span className="text-gray-950">Down</span>
          <span className="text-indigo-600">For</span>
        </span>
      ) : null}
    </Link>
  );
}

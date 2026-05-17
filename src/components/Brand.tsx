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
      <svg
        viewBox="0 0 512 512"
        aria-hidden="true"
        className={`${iconSize} flex-none`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="brandBlueGradient" x1="112" y1="92" x2="410" y2="430" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4C5CFF" />
            <stop offset="1" stopColor="#3346F4" />
          </linearGradient>
        </defs>
        <path
          d="M136 82H290C387.336 82 466 160.664 466 258C466 355.336 387.336 434 290 434H239.5L196 482V434H136C68.6211 434 14 379.379 14 312V204C14 136.621 68.6211 82 136 82Z"
          fill="url(#brandBlueGradient)"
        />
        <path
          d="M158 122H272C352.843 122 418 187.157 418 268C418 348.843 352.843 414 272 414H229.2L192 454V414H158C90.9345 414 36 359.065 36 292V244C36 176.935 90.9345 122 158 122Z"
          fill="white"
        />
        <circle cx="226" cy="236" r="48" fill="#0B1024" />
        <circle cx="314" cy="280" r="34" fill="#0B1024" />
        <path
          d="M174 326C174 294.519 199.519 269 231 269H232C263.481 269 289 294.519 289 326V352H174V326Z"
          fill="#0B1024"
        />
        <path
          d="M278 340C278 320.118 294.118 304 314 304H314C333.882 304 350 320.118 350 340V364H278V340Z"
          fill="#0B1024"
        />
      </svg>
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

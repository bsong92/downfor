"use client";

import { useState } from "react";

export function CopyLinkButton({
  href,
  className = "",
}: {
  href: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = new URL(href, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      aria-label="Copy activity link"
      title={copied ? "Link copied" : "Copy activity link"}
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

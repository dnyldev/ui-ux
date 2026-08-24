import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative rounded-xl border border-line bg-[#0b0c10]">
      <button
        type="button"
        aria-label="کپی کد"
        onClick={() => {
          navigator.clipboard?.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        className="absolute end-2.5 top-2.5 flex size-7 items-center justify-center rounded-md border border-line bg-raised text-ink-3 transition-colors hover:text-ink cursor-pointer"
      >
        {copied ? <Check className="size-3.5 text-green" /> : <Copy className="size-3.5" />}
      </button>
      <pre className="overflow-x-auto p-4 pe-10 font-mono text-[12px] leading-relaxed text-ink-2">
        <code>{code}</code>
      </pre>
    </div>
  );
}

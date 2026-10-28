"use client";
// Jumps to a collapsed dropdown and opens it.
export default function OpenLink({ target, className, children }: { target: string; className?: string; children: React.ReactNode }) {
  return (
    <a
      href={`#${target}`}
      className={className}
      onClick={() => {
        const el = document.getElementById(target);
        if (el instanceof HTMLDetailsElement) el.open = true;
      }}
    >
      {children}
    </a>
  );
}

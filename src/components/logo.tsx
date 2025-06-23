import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 28"
      width="100"
      height="21"
      aria-label="Financier"
      {...props}
    >
      <text
        x="0"
        y="22"
        fontFamily="var(--font-poppins), Poppins, sans-serif"
        fontSize="24"
        fontWeight="600"
        fill="currentColor"
        className="font-headline"
      >
        Financier
      </text>
    </svg>
  );
}

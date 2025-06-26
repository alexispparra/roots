import type { SVGProps } from "react";

export function LandingIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 500 250"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo oo."
      {...props}
    >
      <style>
        {`
          .oo-text {
            font-family: var(--font-poppins), Poppins, sans-serif;
            font-size: 250px;
            font-weight: 300;
            fill: hsl(var(--foreground));
            letter-spacing: -0.02em;
          }
        `}
      </style>
      <text x="0" y="200" className="oo-text">
        oo
      </text>
      <rect x="410" y="165" width="35" height="35" fill="hsl(var(--foreground))" />
    </svg>
  );
}

import type { SVGProps } from "react";

export function LandingLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 170 130"
      aria-label="Roots.co"
      {...props}
    >
      <style>
        {`
          .roots-text {
            font-family: var(--font-poppins), Poppins, sans-serif;
            font-size: 50px;
            font-weight: 300;
            letter-spacing: 0.05em;
            fill: currentColor;
          }
          .roots-bar {
            fill: hsl(var(--primary));
          }
        `}
      </style>
      <text x="0" y="50" className="roots-text">
        roots.
      </text>
      <rect x="0" y="65" width="165" height="12" rx="6" className="roots-bar" />
      <text x="0" y="115" className="roots-text">
        co.
      </text>
    </svg>
  );
}

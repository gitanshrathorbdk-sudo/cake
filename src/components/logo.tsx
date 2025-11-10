import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 12h12" />
      <path d="M14 12v-4a2 2 0 1 1 4 0v4" />
      <circle cx="16" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

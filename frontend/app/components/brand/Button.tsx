import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "link";

type BaseProps = {
  variant?: Variant;
  // Switches the focus ring to Petal so it stays visible on Highland bands
  onDark?: boolean;
  className?: string;
  children: React.ReactNode;
};

type AsLink = BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type AsButton = BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

const variants: Record<Variant, string> = {
  primary:
    "inline-flex items-center justify-center rounded-control bg-adey-petal px-5 py-3 text-base font-bold text-adey-seed hover:bg-[#E5B41F]",
  secondary:
    "inline-flex items-center justify-center rounded-control border-[1.5px] border-current px-5 py-3 text-base font-bold text-adey-seed hover:bg-adey-seed/5",
  link: "font-medium text-adey-highland underline decoration-1 underline-offset-[3px] hover:decoration-2",
};

export function focusRing(onDark = false) {
  return cn(
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    onDark ? "focus-visible:outline-adey-petal" : "focus-visible:outline-adey-highland"
  );
}

// Internal paths go through next/link; external, mailto: and #anchors stay plain <a>
const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

const Button = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, AsLink | AsButton>(
  function Button(props, ref) {
    const { variant = "primary", onDark = false, className, children, ...rest } = props;
    const classes = cn(
      variants[variant],
      focusRing(onDark),
      "transition-[color,background-color,border-color,text-decoration-color,transform] duration-100 disabled:cursor-not-allowed disabled:opacity-50",
      // Press feedback on pointer-down; text links don't shrink
      variant !== "link" && "active:scale-[0.97] disabled:active:scale-100",
      className
    );

    if (rest.href !== undefined) {
      const { href, ...anchorProps } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        href: string;
      };
      const linkRef = ref as React.Ref<HTMLAnchorElement>;
      if (isInternal(href)) {
        return (
          <Link ref={linkRef} href={href} className={classes} {...anchorProps}>
            {children}
          </Link>
        );
      }
      return (
        <a ref={linkRef} href={href} className={classes} {...anchorProps}>
          {children}
        </a>
      );
    }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);

export default Button;

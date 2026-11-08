import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

/**
 * Every button is a pill with `label` type (500, uppercase). Primary is solid ink;
 * `brand` is Roo orange for Post / Rent this, with ink text (white on orange fails AA).
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-pill border border-transparent bg-clip-padding font-sans font-medium tracking-[0.04em] uppercase whitespace-nowrap outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:bg-surface-2 disabled:text-ink-3 aria-busy:cursor-progress aria-invalid:border-deal [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-ink text-white hover:bg-ink/85",
        brand: "bg-roo text-ink hover:bg-roo-deep hover:text-white",
        outline:
          "border-ink/20 bg-transparent text-ink hover:border-ink aria-expanded:border-ink",
        secondary: "bg-surface text-ink hover:bg-surface-2",
        ghost: "text-ink hover:bg-surface aria-expanded:bg-surface",
        destructive: "bg-deal/10 text-deal hover:bg-deal/20",
        link: "text-ink underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-5 text-[0.75rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 px-3 text-[0.6875rem] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3.5 text-[0.6875rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-7 text-[0.8125rem] tracking-[0.03em] md:text-[0.875rem]",
        icon: "size-10 bg-surface hover:bg-surface-2",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

import * as React from "react";
import { cn } from "@/app/_libs/shadcn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;
const Card = React.forwardRef<
  HTMLDivElement, //
  CardProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
const CardHeader = React.forwardRef<
  HTMLDivElement, //
  CardHeaderProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
const CardTitle = React.forwardRef<
  HTMLParagraphElement, //
  CardTitleProps
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;
const CardDescription = React.forwardRef<
  HTMLParagraphElement, //
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;
const CardContent = React.forwardRef<
  HTMLDivElement, //
  CardContentProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;
const CardFooter = React.forwardRef<
  HTMLDivElement, //
  CardFooterProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

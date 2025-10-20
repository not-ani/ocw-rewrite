"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type TabsVariant = "default" | "underline";
type Orientation = "horizontal" | "vertical";

interface LinkTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
}

function LinkTabs({
  className,
  orientation = "horizontal",
  ...props
}: LinkTabsProps) {
  return (
    <div
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "flex flex-col gap-2",
        orientation === "vertical" && "flex-row",
        className,
      )}
      {...props}
    />
  );
}

interface LinkTabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: TabsVariant;
  orientation?: Orientation;
}

function LinkTabsList({
  variant = "default",
  className,
  orientation = "horizontal",
  ...props
}: LinkTabsListProps) {
  return (
    <div
      data-slot="tabs-list"
      data-orientation={orientation}
      className={cn(
        "text-muted-foreground relative z-0 flex w-fit items-center justify-center gap-x-0.5",
        orientation === "vertical" && "flex-col",
        variant === "default"
          ? "bg-muted text-muted-foreground/64 rounded-lg p-0.5"
          : orientation === "horizontal"
            ? "[&>a]:hover:bg-accent py-1"
            : "[&>a]:hover:bg-accent px-1",
        className,
      )}
      {...props}
    />
  );
}

interface LinkTabsTabProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> {
  href: string;
  orientation?: Orientation;
  exact?: boolean;
}

function LinkTabsTab({
  className,
  href,
  orientation = "horizontal",
  exact = true,
  ...props
}: LinkTabsTabProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      {...props}
      href={href as any}
      data-slot="tabs-trigger"
      data-selected={isActive ? "" : undefined}
      data-orientation={orientation}
      className={cn(
        "focus-visible:ring-ring flex flex-1 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition-[color,background-color,box-shadow] outline-none focus-visible:ring-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "hover:text-muted-foreground",
        isActive ? "text-foreground" : "",
        "gap-1.5 px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1.5)-1px)]",
        orientation === "vertical" && "w-full justify-start",
        className,
      )}
    />
  );
}

export { LinkTabs, LinkTabsList, LinkTabsTab, LinkTabsTab as LinkTabsTrigger };

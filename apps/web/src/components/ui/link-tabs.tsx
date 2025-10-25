"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";

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
        className
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
  children,
  ...props
}: LinkTabsListProps) {
  return (
    <div
      data-slot="tabs-list"
      data-orientation={orientation}
      className={cn(
        "relative z-0 flex w-fit items-center justify-center gap-x-0.5 text-muted-foreground",
        orientation === "vertical" && "flex-col",
        variant === "default"
          ? "rounded-lg bg-muted p-0.5 text-muted-foreground/64"
          : orientation === "horizontal"
            ? "py-1 [&>a]:hover:bg-accent"
            : "px-1 [&>a]:hover:bg-accent",
        className
      )}
      {...props}
    >
      {children}
      {variant === "underline" ? (
        <div
          data-slot="tab-indicator"
          className={cn(
            "-translate-y-(--active-tab-bottom) absolute bottom-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) transition-[width,translate] duration-200 ease-in-out",
            "data-[orientation=horizontal]:-bottom-[calc(--spacing(1)+1px)] data-[orientation=vertical]:-start-[calc(--spacing(1)+1px)] z-10 bg-primary data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5"
          )}
        />
      ) : null}
    </div>
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
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      {...props}
      href={href as any}
      data-slot="tabs-trigger"
      data-selected={isActive ? "" : undefined}
      data-orientation={orientation}
      className={cn(
        "flex flex-1 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-transparent font-medium text-sm outline-none transition-[color,background-color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "hover:text-muted-foreground",
        isActive ? "text-foreground" : "",
        "gap-1.5 px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1.5)-1px)]",
        orientation === "vertical" && "w-full justify-start",
        className
      )}
    />
  );
}

export { LinkTabs, LinkTabsList, LinkTabsTab, LinkTabsTab as LinkTabsTrigger };

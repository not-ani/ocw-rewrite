"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LinkTabs, LinkTabsList, LinkTabsTab } from "@ocw/ui/link-tabs";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/mission", label: "Mission" },
  { href: "/team", label: "Team" },
  { href: "/analytics", label: "Analytics" },
] as const;

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 p-4">
        <div className="mx-auto flex items-center gap-1 sm:mx-0">
          <div className="text-muted-foreground sm:text-lg">OCW Project</div>
        </div>

        <div className="hidden md:block">
          <LinkTabs orientation="horizontal">
            <LinkTabsList variant="underline">
              {navItems.map((item) => (
                <LinkTabsTab key={item.href} href={item.href}>
                  {item.label}
                </LinkTabsTab>
              ))}
            </LinkTabsList>
          </LinkTabs>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-x-0 top-[73px] z-50 flex flex-col gap-2 border-b bg-background p-4 shadow-lg md:hidden">
          {navItems.map((item) => (
            <LinkTabsTab
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="justify-start px-4 py-3 text-base"
            >
              {item.label}
            </LinkTabsTab>
          ))}
        </div>
      )}
    </>
  );
};

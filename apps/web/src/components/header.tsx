"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import { Menu, MoveRight, Shield, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "./search";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { useSite } from "@/lib/multi-tenant/context";
import type { Route } from "next";

const navigationItems = [
  {
    title: "Courses",
    href: "/courses",
    description: "All the courses on our website",
  },
  {
    title: "About OCW",
    description: "More information about the OCW Project",
    items: [
      {
        title: "About Us",
        href: "/about",
      },
      {
        title: "For teachers",
        href: "/teachers",
      },

      {
        title: "Contributors",
        href: "/contributors",
      },
    ],
  },
  {
    title: "Contribute to OCW",
    description: "Contribute to the OCW Project",
    items: [
      {
        title: "Contribute",
        href: "/contribute",
      },
      {
        title: "Contact",
        href: "/contact",
      },
    ],
  },
];

function Header() {
  const route = usePathname();
  const { user, siteConfig } = useSite();

  const isCoursesPage = route.endsWith("/courses");
  const [isOpen, setOpen] = useState(false);
  return (
    <header className={"bg-background sticky top-0 z-50 flex border-b"}>
      <div className="flex min-h-20 w-full flex-row items-center justify-evenly gap-4 px-5 lg:grid lg:grid-cols-3">
        <div className="hidden flex-row items-center justify-start gap-4 lg:flex">
          <NavigationMenu
            className="flex items-start justify-start"
            viewport={false}
          >
            <NavigationMenuList className="flex flex-row justify-start gap-4">
              {navigationItems.map((item) =>
                item.href ? (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href={item.href as Route}>{item.title}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-4">
                        {item.items?.map((subItem) => (
                          <li key={subItem.title}>
                            <NavigationMenuLink asChild>
                              <Link href={subItem.href as Route}>
                                {subItem.title}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex lg:justify-center">
          <Link href="/">
            <p className="font-semibold">
              {siteConfig?.school?.toUpperCase()} OCW
            </p>
          </Link>
        </div>
        <div className="flex w-full justify-end gap-4">
          {!isCoursesPage && <Search />}
          <div className="hidden border-r md:inline" />
          <SignedIn>
            {user?.isSiteAdmin && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            )}
            <UserButton />
          </SignedIn>
        </div>
        <div className="flex w-12 shrink items-end justify-end lg:hidden">
          <Button onClick={() => setOpen(!isOpen)} variant="ghost">
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {isOpen && (
            <div className="absolute left-0 right-0 top-20 z-50 flex w-full flex-col gap-8 border-b border-t bg-background px-5 py-4 shadow-lg backdrop-blur-sm">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  <div className="flex flex-col gap-2">
                    {item.href ? (
                      <Link
                        className="flex items-center justify-between"
                        href={item.href as Route}
                      >
                        <span className="text-lg">{item.title}</span>
                        <MoveRight className="text-muted-foreground h-4 w-4 stroke-1" />
                      </Link>
                    ) : (
                      <p className="text-lg">{item.title}</p>
                    )}
                    {item.items?.map((subItem) => (
                      <Link
                        className="flex items-center justify-between"
                        key={subItem.title}
                        href={subItem.href as Route}
                      >
                        <span className="text-muted-foreground">
                          {subItem.title}
                        </span>
                        <MoveRight className="h-4 w-4 stroke-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { Header };

"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageOpen,
} from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { BrandMark } from "@/components/brand-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { AuthUser } from "@/lib/domain";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/produtos", label: "Produtos", icon: PackageOpen },
  { href: "/categorias", label: "Categorias", icon: FolderTree },
  { href: "/movimentacoes", label: "Movimentações", icon: BarChart3 },
] as const;

interface AppShellProps {
  user: AuthUser;
  children: ReactNode;
}

function Navigation({ pathname }: { pathname: string }) {
  return (
    <nav className="space-y-1" aria-label="Navegação principal">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} className={cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-sidebar-accent/60 hover:text-foreground", active && "bg-sidebar-accent text-foreground shadow-sm shadow-black/10")}>
            <span className={cn("flex size-8 items-center justify-center rounded-lg border border-transparent transition-colors", active && "border-primary/20 bg-primary/10 text-primary")}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            {label}
            {active && <span className="ml-auto size-1.5 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({ user }: { user: AuthUser }) {
  const initials = user.name.slice(0, 2).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-2">
          <Avatar className="size-8 border border-primary/20 bg-primary/10"><AvatarFallback className="bg-transparent text-xs font-semibold text-primary">{initials}</AvatarFallback></Avatar>
          <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block text-sm">{user.name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem asChild><button type="submit" className="w-full"><LogOut />Sair do sistema</button></DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar/92 p-4 backdrop-blur-xl lg:flex lg:flex-col">
        <BrandMark className="px-2 py-2" />
        <Separator className="my-5" />
        <Navigation pathname={pathname} />
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/60 bg-background/82 px-4 backdrop-blur-xl md:px-7">
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="icon" className="lg:hidden"><Menu /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Menu principal</SheetTitle>
              <BrandMark className="px-2 py-2" />
              <Separator className="my-5" />
              <Navigation pathname={pathname} />
            </SheetContent>
          </Sheet>
          <div className="ml-auto flex items-center gap-2">
            <UserMenu user={user} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 md:p-7 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

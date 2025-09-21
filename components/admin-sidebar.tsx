"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building,
  ImageIcon,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Architects",
    href: "/admin/architects",
    icon: Building,
  },
  {
    title: "Designs",
    href: "/admin/designs",
    icon: ImageIcon,
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn("bg-background border-r border-border transition-all duration-300", collapsed ? "w-16" : "w-64")}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold">Admin Panel</span>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn("w-full justify-start", collapsed && "px-2")}
              >
                <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                {!collapsed && item.title}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <Link href="/">
          <Button variant="outline" className={cn("w-full", collapsed && "px-2")}>
            <Home className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Back to Site"}
          </Button>
        </Link>
      </div>
    </div>
  )
}

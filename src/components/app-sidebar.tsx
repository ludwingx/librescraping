"use client"

import * as React from "react"
import {
  BarChart3,
  MapPin,
  TrendingUp,
  Smartphone,
  ScrollText,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { CompanyHeader } from "@/components/company-header"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation data for TodoFundas system
const data = {
  user: {
    name: "Usuario",
    email: "usuario@librescraping.com",
    avatar: "/avatars/default.jpg",
  },
  company: {
    name: "Libre Scraping",
    logo: ScrollText,
    plan: "Sistema de visualización de datos de redes sociales",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Informe General",
      url: "/dashboard/igeneral",
      icon: TrendingUp,
    },
    {
      title: "Santa Cruz",
      url: "/dashboard/santacruz",
      icon: MapPin,
    },
    {
      title: "Cochabamba",
      url: "/dashboard/cochabamba",
      icon: MapPin,
    },
    {
      title: "La Paz",
      url: "/dashboard/lapaz",
      icon: MapPin,
    },
    {
      title: "Oruro",
      url: "/dashboard/oruro",
      icon: MapPin,
    },
    {
      title: "Potosí",
      url: "/dashboard/potosi",
      icon: MapPin,
    },
    {
      title: "Tarija",
      url: "/dashboard/tarija",
      icon: MapPin,
    },
    {
      title: "Chuquisaca",
      url: "/dashboard/chuquisaca",
      icon: MapPin,
    },
    {
      title: "Beni",
      url: "/dashboard/beni",
      icon: MapPin,
    },
    {
      title: "Pando",
      url: "/dashboard/pando",
      icon: MapPin,
    }
  ]
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: { name: string; email: string; avatar: string } }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanyHeader company={data.company} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
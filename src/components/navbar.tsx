"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav className="w-full bg-white border-b shadow-sm flex items-center px-6 py-2 z-20">
        
      {/* Izquierda con "Libre scrapping" */}
      <span className="ml-2 font-bold text-xl text-gray-800 truncate">Libre-Scraping</span>
      

      {/* Centro: Logos y nombre */}
      <div className="flex-1 flex justify-center items-center gap-3 min-w-0">
        <Link href="/">
          <img className="w-25 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping Logo 1" />
        </Link>
        <Link href="/">
          <img className="w-25 h-10 object-contain" src="https://tuto-noticias-test.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping Logo 2" />
        </Link>
      </div>
      {/* Derecha: Navegación */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" className="text-blue-700 font-semibold px-4">Inicio</Button>
        </Link>
        <Link href="/home">
          <Button variant="ghost" className="text-blue-700 font-semibold px-4">Publicaciones</Button>
        </Link>
      </div>
    </nav>
  );
}


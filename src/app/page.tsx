import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="flex flex-col items-center gap-4 w-full max-w-2xl px-4">
        <div className="flex flex-row items-center justify-center gap-3 mt-4 mb-2">
          <img className="w-24 h-14 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping Logo 1" />
          <img className="w-20 h-14 object-contain" src="https://tuto-noticias-test.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping Logo 2" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 mb-2 tracking-tight text-center">¡Bienvenido a Libre-Scraping!</h1>
        <h2 className="text-lg md:text-2xl text-blue-700 mb-4 font-semibold text-center">Visualiza y analiza publicaciones públicas de Facebook de manera centralizada y moderna</h2>
        <p className="mb-8 text-gray-700 text-base md:text-lg leading-relaxed text-center max-w-2xl">Explora tendencias, titulares y estadísticas de perfiles públicos extraídos automáticamente. Accede a dashboards por departamento o consulta el informe general.</p>
        <Link href="/dashboard" className="w-full max-w-xs">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-xl shadow-md transition-all duration-150">Ver publicaciones</Button>
        </Link>
        <footer className="mt-12 text-l text-gray-400 text-center w-full">© {new Date().getFullYear()} Desarrollado por Other Brain</footer>
      </div>
    </main>
  );
}

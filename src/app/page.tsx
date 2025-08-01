import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="flex justify-center items-center  gap-6"><img className="w-32 mb-6" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping" />
      <img src="https://tuto-noticias-test.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping" className="w-32 mb-6" /></div>
      <div className="max-w-lg w-full text-center p-8 bg-white rounded shadow">
        
        <h1 className="text-3xl font-bold mb-4">¡Bienvenido a Libre-Scraping!</h1>
        <p className="mb-6 text-gray-700">Esta es una aplicación para visualizar publicaciones de perfiles de Facebook extraídas automáticamente.</p>
        <Link href="/home">
          <Button className="w-full" size="lg">Ver publicaciones</Button>
        </Link>
      </div>
    </main>
  );
}

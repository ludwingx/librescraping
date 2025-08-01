import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Prisma sólo se debe instanciar una vez en Next.js
const prisma = new PrismaClient();

export default async function HomeList() {
  const posts = await prisma.face_scrap.findMany({
    orderBy: { fechapublicacion: "desc" },
    take: 20,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Publicaciones de Facebook</h2>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">Descargar Boletín</Button>
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2">Perfil</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Texto</th>
              <th className="px-3 py-2">Likes</th>
              <th className="px-3 py-2">Comentarios</th>
              <th className="px-3 py-2">Compartidos</th>
              <th className="px-3 py-2">Miniatura</th>
              <th className="px-3 py-2">Red</th>
              <th className="px-3 py-2">Ver post</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.map(post => (
              <tr key={post.postid} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  {post.fotoperfil && (
                    <img src={post.fotoperfil} alt={post.perfil} className="w-8 h-8 rounded-full" />
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="font-semibold">{post.perfil}</div>
                  <a href={post.perfilurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">Perfil</a>
                </td>
                <td className="px-3 py-2 max-w-xs truncate" title={post.texto}>{post.texto.slice(0, 80)}{post.texto.length > 80 ? '...' : ''}</td>
                <td className="px-3 py-2">{post.likes}</td>
                <td className="px-3 py-2">{post.comentarios}</td>
                <td className="px-3 py-2">{post.compartidos}</td>
                <td className="px-3 py-2">
                  {post.img && (
                    <img src={post.img} alt="Miniatura post" className="w-10 h-10 object-cover rounded" />
                  )}
                </td>
                <td className="px-3 py-2">{post.redsocial}</td>
                <td className="px-3 py-2">
                  <a href={post.posturl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">Ver</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

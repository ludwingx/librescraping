"use client";
import { Button } from "@/components/ui/button";
import { generarBoletinPDF } from "./pdfBoletin";
import React from "react";

interface Post {
  nombrepagina: string;
  texto: string;
  posturl: string;
  titularidad: string;
  fechapublicacion: string;
}

interface SinActividadItem {
  candidato: string;
  titularidad: string;
  departamento: string;
  redsocial: string;
}

export function BoletinDownloader({ posts, titularidades, sinActividad = [] }: { posts: Post[]; titularidades: string[]; sinActividad?: SinActividadItem[] }) {
  const handleDownload = React.useCallback(() => {
    const destacados = ["Jorge Tuto Quiroga", "Juan Pablo Velazco"];
    const fechaHoy = new Date();
    const fechaHoyStr = fechaHoy.toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" });
    generarBoletinPDF({
      posts,
      titularesDestacados: destacados,
      titularidades,
      sinActividad,

      fechaHoy: fechaHoyStr
    });
  }, [posts, titularidades, sinActividad]);

  return (
    <Button
      variant="default"
      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
      onClick={handleDownload}
    >
      Descargar Boletín
    </Button>
  );
}

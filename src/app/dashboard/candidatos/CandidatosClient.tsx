"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CandidateFormModal } from "@/components/CandidateFormModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@radix-ui/react-separator";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const titularidades = [
  "PRESIDENTE",
  "VICEPRESIDENTE",
  "SENADOR",
  "DIPUTADO PLURINOMINAL",
  "DIPUTADO UNINOMINAL URBANO",
  "DIPUTADO UNINOMINAL RURAL",
  "DIPUTADO SUPRAESTATAL",
  "DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL",
];

export default function CandidatosClient() {
  const [candidatos, setCandidatos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editCandidate, setEditCandidate] = React.useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [candidateToDelete, setCandidateToDelete] = React.useState<any | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const fetchCandidatos = () => {
    setLoading(true);
    fetch("/api/candidatos")
      .then(res => res.json())
      .then(data => {
        setCandidatos(data.candidatos || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchCandidatos();
  }, []);

  const handleNew = () => {
    setEditCandidate(null);
    setModalOpen(true);
  };
  const handleEdit = (candidato: any) => {
    setEditCandidate(candidato);
    setModalOpen(true);
  };
  const handleDelete = (candidato: any) => {
    setCandidateToDelete(candidato);
    setDeleteModalOpen(true);
  };
  const handleSubmit = async (data: any) => {
    try {
      let res;
      let action = editCandidate ? "editado" : "creado";
      if (editCandidate) {
        res = await fetch("/api/candidatos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, id: editCandidate.id }),
        });
      } else {
        res = await fetch("/api/candidatos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      const result = await res.json();
      if (res.ok) {
        toast.success(`Candidato ${action}: ${result.candidato.nombre_completo}`);
        fetchCandidatos();
      } else {
        toast.error(result.error || `Error al guardar candidato`);
      }
    } catch (e) {
      toast.error("Error de red al guardar candidato");
    }
    setModalOpen(false);
    setEditCandidate(null);
  };

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/candidatos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: candidateToDelete.id }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Candidato inactivado: ${result.candidato.nombre_completo}`);
        fetchCandidatos();
      } else {
        toast.error(result.error || "Error al eliminar candidato");
      }
    } catch (e) {
      toast.error("Error de red al eliminar candidato");
    }
    setDeleting(false);
    setDeleteModalOpen(false);
    setCandidateToDelete(null);
  };

  return (
   <>
     <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center justify-between w-full gap-2 px-4">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/candidatos">Candidatos</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2 ml-auto pr-2">
            <img
              className="w-35 h-10 object-contain"
              src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75"
              alt="Libre-Scraping Logo 1"
              width={120}
              height={40}
            />
            <img
              className="w-22 h-10 object-contain"
              src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75"
              alt="Libre-Scraping Logo 2"
              width={80}
              height={40}
            />
          </div>
        </div>
      </div>
    </header>
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 sm:py-4 text-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Candidatos</h1>
        <Button onClick={handleNew}>Nuevo candidato <Plus /></Button>
        <CandidateFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleSubmit}
          initialData={editCandidate}
        />
        <ConfirmDeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          loading={deleting}
        />
      </div>
      <div className="overflow-x-auto p-2">
        <Table className="w-full min-w-[500px] sm:min-w-[900px] border border-gray-200 rounded-lg bg-white text-xs">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="px-1 py-1 min-w-[40px] w-12">ID</TableHead>
              <TableHead className="px-1 py-1 min-w-[100px] w-32">Departamento</TableHead>
              <TableHead className="px-1 py-1 min-w-[120px] w-40">Titularidad</TableHead>
              <TableHead className="px-1 py-1 min-w-[140px] w-52">Nombre completo</TableHead>
              <TableHead className="px-1 py-1 min-w-[90px] w-32">Facebook</TableHead>
              <TableHead className="px-1 py-1 min-w-[90px] w-32">Instagram</TableHead>
              <TableHead className="px-1 py-1 min-w-[90px] w-32">TikTok</TableHead>
              <TableHead className="px-1 py-1 min-w-[80px] w-24 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : candidatos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">Sin datos</TableCell>
              </TableRow>
            ) : (
              [...candidatos]
                .sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0))
                .map((candidato) => (
                  <TableRow key={candidato.id}>
                    <TableCell className="px-1 py-1 text-center">{candidato.id}</TableCell>
                    <TableCell className="px-1 py-1 truncate max-w-[100px]">{["PRESIDENTE", "VICEPRESIDENTE"].includes((candidato.titularidad || '').toUpperCase()) ? "PAIS" : candidato.departamento}</TableCell>
                    <TableCell className="px-1 py-1 truncate max-w-[120px]">{candidato.titularidad}</TableCell>
                    <TableCell className="px-1 py-1 truncate max-w-[140px]">{candidato.nombre_completo}</TableCell>
                    <TableCell className="px-1 py-1 max-w-[120px] truncate">
                      {candidato.facebook_url ? (
                        <a href={candidato.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate inline-block max-w-[100px]">{candidato.facebook_url}</a>
                      ) : <span className="text-red-600 font-semibold">NO TIENE</span>}
                    </TableCell>
                    <TableCell className="px-1 py-1 max-w-[120px] truncate">
                      {candidato.instagram_url ? (
                        <a href={candidato.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 underline truncate inline-block max-w-[100px]">{candidato.instagram_url}</a>
                      ) : <span className="text-red-600 font-semibold">NO TIENE</span>}
                    </TableCell>
                    <TableCell className="px-1 py-1 max-w-[120px] truncate">
                      {candidato.tiktok_url ? (
                        <a href={candidato.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-black underline truncate inline-block max-w-[100px]">{candidato.tiktok_url}</a>
                      ) : <span className="text-red-600 font-semibold">NO TIENE</span>}
                    </TableCell>
                    <TableCell className="px-1 py-1 text-center">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(candidato)} className="mr-2">Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(candidato)}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
   </>
  );
}


import jsPDF from "jspdf";

interface Post {
  nombrepagina: string;
  texto: string;
  posturl: string;
  titularidad: string;
  fechapublicacion: string;
  redsocial?: string;
}

export async function generarBoletinPDF({
  posts,
  titularesDestacados = ["Jorge Tuto Quiroga", "Juan Pablo Velazco"],
  titularidades = [],
  sinActividad = [],
  fechaHoy,
  logoUrl = "/logos/LibreLogo.png" // Cambia aquí la URL de tu logo
}: {
  posts: Post[];
  titularesDestacados?: string[];
  titularidades: string[];
  sinActividad: {
    candidato: string;
    titularidad: string;
    departamento: string;
    redsocial: string;
  }[];
  fechaHoy: string;
  logoUrl?: string;
}) {
  const doc = new jsPDF();
  let y = 20;

  // Cabecera
  // Convertir logoUrl a base64 y mostrar el logo centrado
  const logoBase64 = await urlToBase64(logoUrl);
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 80, y, 50, 15); // x, y, width, height
    y += 22;
  }

  doc.setFontSize(15);
  doc.text(`BOLETIN ${fechaHoy} DE REDES SOCIALES`, 105, y, { align: "center" });
  y += 15;

  // Publicaciones de Presidente
  doc.setFontSize(16);
  doc.text("Publicaciones de Presidente: Jorge Tuto Quiroga", 15, y);
  y += 8;
  const postsPresidente = posts.filter(p => p.nombrepagina.toLowerCase().includes("jorge tuto quiroga"));
  if (postsPresidente.length > 0) {
    postsPresidente.forEach(post => {
      doc.setFontSize(12);
      doc.text("Perfil: " + post.nombrepagina + " | Red social: " + (post.redsocial || ""), 20, y);
      y += 6;
      doc.text("Texto: " + (post.texto?.slice(0, 90) || ""), 20, y);
      y += 6;
      doc.setTextColor(0, 0, 255);
      doc.textWithLink("Ver Más", 20, y, { url: post.posturl });
      doc.setTextColor(0, 0, 0);
      y += 10;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 4;
  } else {
    doc.setFontSize(12);
    doc.text("Sin publicaciones", 20, y);
    y += 10;
  }

  // Publicaciones de Vicepresidente
  doc.setFontSize(16);
  doc.text("Publicaciones de Vicepresidente: Juan Pablo Velazco", 15, y);
  y += 8;
  const postsVice = posts.filter(p => p.nombrepagina.toLowerCase().includes("juan pablo velazco") || p.nombrepagina.toLowerCase().includes("juan pablo velasco"));
  if (postsVice.length > 0) {
    postsVice.forEach(post => {
      doc.setFontSize(12);
      doc.text("Perfil: " + post.nombrepagina + " | Red social: " + (post.redsocial || ""), 20, y);
      y += 6;
      doc.text("Texto: " + (post.texto?.slice(0, 90) || ""), 20, y);
      y += 6;
      doc.setTextColor(0, 0, 255);
      doc.textWithLink("Ver Más", 20, y, { url: post.posturl });
      doc.setTextColor(0, 0, 0);
      y += 10;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 4;
  } else {
    doc.setFontSize(12);
    doc.text("Sin publicaciones", 20, y);
    y += 10;
  }

  // Publicaciones en Santa Cruz
  doc.setFontSize(12);
  doc.text("Publicaciones en Santa Cruz:", 15, y);
  y += 8;
  titularidades.filter(tit => tit !== "SIN ACTIVIDAD EN RRSS").forEach((tit) => {
    doc.setFontSize(12);
    doc.text(tit, 20, y);
    y += 8;
    const postsTit = posts.filter(p => (p.titularidad || "").toUpperCase() === tit);
    if (postsTit.length > 0) {
      postsTit.forEach(post => {
        doc.setFontSize(12);
        doc.text("Perfil: " + post.nombrepagina + " | Red social: " + (post.redsocial || ""), 25, y);
        y += 6;
        // Ajustar texto de la publicación al ancho de la hoja
        let texto = post.texto || "";
        let textoLines = doc.splitTextToSize("Texto: " + texto, 155); // 155 es el ancho máximo
        // Limitar a 2 líneas
        if (textoLines.length > 2) {
          textoLines = textoLines.slice(0, 2);
          // Añadir '...' al final de la última línea
          textoLines[1] = textoLines[1].slice(0, -3) + '...';
        }
        textoLines.forEach((line: string | string[]) => {
          doc.text(line, 25, y);
          y += 6;
        });
        doc.setTextColor(0, 0, 255);
        doc.textWithLink("Ver Más", 25, y, { url: post.posturl });
        doc.setTextColor(0, 0, 0);
        y += 10;
        if (y > 270) { doc.addPage(); y = 20; }
      });
      y += 4;
    } else {
      doc.setFontSize(12);
      doc.text("Sin publicaciones", 25, y);
      y += 10;
    }
  });

  // Sin Actividad en RRSS
  if (sinActividad.length) {
    // Filtrar solo Santa Cruz
    const sinActividadSantaCruz = sinActividad.filter(item => (item.departamento || '').toUpperCase().includes('SANTA CRUZ'));

    // Orden personalizado de titularidad
    const titularidadOrden = [
      'PRESIDENTE',
      'VICEPRESIDENTE',
      'SENADOR',
      'DIPUTADO PLURINOMINAL',
      'DIPUTADO UNINOMINAL URBANO',
      'DIPUTADO UNINOMINAL RURAL',
      'DIPUTADO SUPRAESTATAL',
      'DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL',
      'OTRO'
    ];
    // Ordenar por redsocial y luego por titularidad
    sinActividadSantaCruz.sort((a, b) => {
      const redA = (a.redsocial || '').toUpperCase();
      const redB = (b.redsocial || '').toUpperCase();
      if (redA < redB) return -1;
      if (redA > redB) return 1;
      const titA = titularidadOrden.indexOf((a.titularidad || '').toUpperCase());
      const titB = titularidadOrden.indexOf((b.titularidad || '').toUpperCase());
      return (titA === -1 ? 999 : titA) - (titB === -1 ? 999 : titB);
    });

    y += 10;
    doc.setFontSize(12);
    doc.text("Sin actividad en RRSS", 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(12);
    // Encabezado tabla
    const colX = [30, 85, 145]; // Nombre, Titularidad, Red Social
    const colW = [50, 55, 45];  // Anchos máximos para recorte
    doc.setFontSize(12);
    doc.text("Nombre", colX[0], y);
    doc.text("Titularidad", colX[1], y);
    doc.text("Red Social", colX[2], y);
    y += 7;
    doc.setLineWidth(0.2);
    doc.line(18, y, 190, y);
    y += 3;
    // Filas
    sinActividadSantaCruz.forEach((item: any) => {
      // Recortar cada campo si es necesario
      function crop(text: string, maxLen: number) {
        return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
      }
      doc.text(crop(item.candidato || '', 22), colX[0], y);
      doc.text(crop(item.titularidad || '', 20), colX[1], y);
      doc.text(crop(item.redsocial || '', 12), colX[2], y);
      // Línea horizontal por fila
      doc.setDrawColor(220,220,220);
      doc.line(18, y+2, 190, y+2);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  }

  doc.save(`boletin_${fechaHoy}.pdf`);
}

// Utilidad para convertir una imagen de URL a base64
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('No se pudo convertir la imagen a base64:', e);
    return null;
  }
}


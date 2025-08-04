import jsPDF from "jspdf";

interface Post {
  nombrepagina: string;
  texto: string;
  posturl: string;
  titularidad: string;
  fechapublicacion: string;
  redsocial?: string;
}

export function generarBoletinPDF({
  posts,
  titularesDestacados = ["Jorge Tuto Quiroga", "Juan Pablo Velazco"],
  titularidades = [],
  sinActividad = [],
  fechaHoy
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
}) {
  const doc = new jsPDF();
  let y = 20;

  // Cabecera
  // Reemplazar 'Libre' por el logo centrado
  const logoUrl = "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";
  // NOTA: doc.addImage requiere la imagen en formato base64 o como recurso cargado. 
  // Aquí te muestro cómo hacerlo si ya tienes la imagen en base64. Si necesitas ayuda para convertir la imagen, avísame.
  // doc.addImage(LOGO_BASE64, 'PNG', 80, y, 50, 15); // x, y, width, height
  // y += 18;
  // Si no tienes la imagen en base64, deja un espacio por ahora:
  doc.setFontSize(10);
  doc.text("[Logo aquí]", 105, y + 8, { align: "center" });
  y += 18;
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

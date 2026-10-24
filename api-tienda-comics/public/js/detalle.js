import { obtenerComic } from "./api.js";

const titulo = document.getElementById("titulo");
const detalle = document.getElementById("detalle");
const mensaje = document.getElementById("mensaje");

const formatoPeso = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

function agregarFila(etiqueta, valor, clase) {
  const dt = document.createElement("dt");
  dt.textContent = etiqueta;

  const dd = document.createElement("dd");
  dd.textContent = valor;
  if (clase) dd.className = clase;

  detalle.append(dt, dd);
}

function mostrarError(texto) {
  titulo.textContent = "Cómic no disponible";
  mensaje.textContent = texto;
  mensaje.className = "mensaje error";
  mensaje.hidden = false;
}

async function iniciar() {
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    mostrarError("No se indicó el cómic a consultar");
    return;
  }

  try {
    const comic = await obtenerComic(id);

    document.title = `${comic.titulo} | Tienda de Cómics`;
    titulo.textContent = comic.titulo;

    agregarFila("Autor", comic.autor?.nombre ?? "Autor desconocido");
    agregarFila("Nacionalidad", comic.autor?.nacionalidad ?? "No registrada");
    agregarFila("Editorial", comic.editorial ?? "No registrada");
    agregarFila("Año de publicación", comic.anioPublicacion ?? "No registrado");
    agregarFila("Precio", formatoPeso.format(comic.precio), "precio");
    agregarFila("Stock", comic.stock);
  } catch (error) {
    mostrarError(error.message);
  }
}

iniciar();

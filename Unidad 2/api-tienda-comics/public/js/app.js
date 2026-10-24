import { listarAutores, crearAutor, listarComics, crearComic } from "./api.js";

const $ = (id) => document.getElementById(id);

const formFiltros = $("form-filtros");
const filtroAutor = $("filtro-autor");
const filtroEditorial = $("filtro-editorial");
const btnLimpiar = $("btn-limpiar");
const contador = $("contador");
const listaComics = $("lista-comics");
const mensaje = $("mensaje");
const formAutor = $("form-autor");
const formComic = $("form-comic");
const comicAutor = $("comic-autor");

function crearElemento(etiqueta, texto, clase) {
  const elemento = document.createElement(etiqueta);
  elemento.textContent = texto;
  if (clase) elemento.className = clase;
  return elemento;
}

let temporizadorMensaje;
function mostrarMensaje(texto, tipo = "ok") {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
  mensaje.hidden = false;

  clearTimeout(temporizadorMensaje);
  temporizadorMensaje = setTimeout(() => {
    mensaje.hidden = true;
  }, 5000);
}

function limpiarVacios(objeto) {
  return Object.fromEntries(
    Object.entries(objeto).filter(([, valor]) => valor !== "")
  );
}

const formatoPeso = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

function crearTitulo(comic) {
  const titulo = document.createElement("h3");
  const enlace = document.createElement("a");
  enlace.href = `detalle.html?id=${encodeURIComponent(comic._id)}`;
  enlace.textContent = comic.titulo;
  titulo.append(enlace);
  return titulo;
}

function validarAutor(datos) {
  if (!datos.nombre || datos.nombre.trim().length < 2) {
    return "El nombre del autor debe tener al menos 2 caracteres";
  }
  if (datos.fechaNacimiento && new Date(datos.fechaNacimiento) > new Date()) {
    return "La fecha de nacimiento no puede ser futura";
  }
  return null;
}

function validarComic(datos) {
  if (!datos.titulo || datos.titulo.trim().length < 2) {
    return "El título debe tener al menos 2 caracteres";
  }
  if (!datos.autor) {
    return "Seleccione un autor";
  }
  if (!Number.isFinite(datos.precio) || datos.precio <= 0) {
    return "El precio debe ser mayor que cero";
  }
  if (
    datos.anioPublicacion !== undefined &&
    (!Number.isInteger(datos.anioPublicacion) ||
      datos.anioPublicacion < 1900 ||
      datos.anioPublicacion > new Date().getFullYear() + 1)
  ) {
    return "El año de publicación no es válido";
  }
  if (datos.stock !== undefined && (!Number.isInteger(datos.stock) || datos.stock < 0)) {
    return "El stock debe ser un entero mayor o igual a cero";
  }
  return null;
}

function llenarSelect(select, opciones, textoInicial) {
  const seleccionado = select.value;

  select.replaceChildren(new Option(textoInicial, ""));
  opciones.forEach(({ valor, texto }) => select.add(new Option(texto, valor)));

  select.value = seleccionado;
  if (select.selectedIndex === -1) select.selectedIndex = 0;
}

function renderComics(comics) {
  listaComics.replaceChildren();

  contador.textContent =
    comics.length === 1 ? "1 cómic encontrado" : `${comics.length} cómics encontrados`;

  if (comics.length === 0) {
    listaComics.append(
      crearElemento("p", "No se encontraron cómics con ese filtro.", "vacio")
    );
    return;
  }

  comics.forEach((comic) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "comic";

    tarjeta.append(
      crearTitulo(comic),
      crearElemento("p", `✍️ ${comic.autor?.nombre ?? "Autor desconocido"}`),
      crearElemento(
        "p",
        [comic.editorial, comic.anioPublicacion].filter(Boolean).join(" · ")
      ),
      crearElemento("p", formatoPeso.format(comic.precio), "precio"),
      crearElemento("p", `Stock: ${comic.stock}`)
    );

    listaComics.append(tarjeta);
  });
}

async function cargarAutores() {
  const autores = await listarAutores();
  const opciones = autores.map((autor) => ({ valor: autor._id, texto: autor.nombre }));

  llenarSelect(filtroAutor, opciones, "Todos los autores");
  llenarSelect(comicAutor, opciones, "Seleccione un autor");
}

async function cargarEditoriales() {
  const comics = await listarComics();
  const editoriales = [...new Set(comics.map((c) => c.editorial).filter(Boolean))].sort();

  llenarSelect(
    filtroEditorial,
    editoriales.map((editorial) => ({ valor: editorial, texto: editorial })),
    "Todas las editoriales"
  );
}

async function buscar() {
  const comics = await listarComics({
    autor: filtroAutor.value,
    editorial: filtroEditorial.value
  });
  renderComics(comics);
}

formFiltros.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    await buscar();
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
});

[filtroAutor, filtroEditorial].forEach((select) => {
  select.addEventListener("change", async () => {
    try {
      await buscar();
    } catch (error) {
      mostrarMensaje(error.message, "error");
    }
  });
});

btnLimpiar.addEventListener("click", async () => {
  formFiltros.reset();
  try {
    await buscar();
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
});

formAutor.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const datos = limpiarVacios(Object.fromEntries(new FormData(formAutor)));

    const errorValidacion = validarAutor(datos);
    if (errorValidacion) {
      mostrarMensaje(errorValidacion, "error");
      return;
    }

    const autor = await crearAutor(datos);

    mostrarMensaje(`Autor "${autor.nombre}" guardado correctamente`);
    formAutor.reset();
    await cargarAutores();
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
});

formComic.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  try {
    const datos = limpiarVacios(Object.fromEntries(new FormData(formComic)));

    datos.precio = Number(datos.precio);
    if (datos.anioPublicacion) datos.anioPublicacion = Number(datos.anioPublicacion);
    if (datos.stock) datos.stock = Number(datos.stock);

    const errorValidacion = validarComic(datos);
    if (errorValidacion) {
      mostrarMensaje(errorValidacion, "error");
      return;
    }

    const comic = await crearComic(datos);

    mostrarMensaje(`Cómic "${comic.titulo}" guardado correctamente`);
    formComic.reset();
    await Promise.all([cargarEditoriales(), buscar()]);
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
});

async function iniciar() {
  try {
    await Promise.all([cargarAutores(), cargarEditoriales()]);
    await buscar();
  } catch (error) {
    mostrarMensaje(`No se pudo conectar con la API: ${error.message}`, "error");
  }
}

iniciar();

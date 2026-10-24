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
      crearElemento("h3", comic.titulo),
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

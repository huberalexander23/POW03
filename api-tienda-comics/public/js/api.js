const API_URL = "/api";

async function peticion(ruta, opciones = {}) {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error en la petición");
  }

  return datos;
}

export function listarAutores() {
  return peticion("/autores");
}

export function crearAutor(autor) {
  return peticion("/autores", {
    method: "POST",
    body: JSON.stringify(autor)
  });
}

export function listarComics(filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor) params.set(clave, valor);
  });

  const query = params.toString();
  return peticion(`/comics${query ? `?${query}` : ""}`);
}

export function crearComic(comic) {
  return peticion("/comics", {
    method: "POST",
    body: JSON.stringify(comic)
  });
}

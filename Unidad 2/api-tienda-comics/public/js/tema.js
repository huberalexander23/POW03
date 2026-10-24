(function () {
  const clave = "tema";
  const raiz = document.documentElement;

  function leerGuardado() {
    try {
      return localStorage.getItem(clave);
    } catch (error) {
      return null;
    }
  }

  function guardar(tema) {
    try {
      localStorage.setItem(clave, tema);
    } catch (error) {
      return;
    }
  }

  function temaInicial() {
    const guardado = leerGuardado();
    if (guardado === "claro" || guardado === "oscuro") return guardado;
    const oscuroSistema = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return oscuroSistema ? "oscuro" : "claro";
  }

  function aplicar(tema) {
    raiz.setAttribute("data-tema", tema);
    const boton = document.getElementById("btn-tema");
    if (boton) boton.textContent = tema === "oscuro" ? "Modo claro" : "Modo oscuro";
  }

  aplicar(temaInicial());

  document.addEventListener("DOMContentLoaded", () => {
    aplicar(raiz.getAttribute("data-tema"));
    const boton = document.getElementById("btn-tema");
    if (!boton) return;
    boton.addEventListener("click", () => {
      const nuevo = raiz.getAttribute("data-tema") === "oscuro" ? "claro" : "oscuro";
      guardar(nuevo);
      aplicar(nuevo);
    });
  });
})();

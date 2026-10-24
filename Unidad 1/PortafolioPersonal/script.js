document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // EDITAR PRESENTACIÓN (MODAL)
    // ==========================================
    const modalPerfilElement = document.getElementById('modalPerfil');
    const modalPerfil = new bootstrap.Modal(modalPerfilElement);
    const btnEditar = document.getElementById("btnEditar");
    const btnGuardarPerfil = document.getElementById("btnGuardarPerfil");

    btnEditar.addEventListener("click", function () {
        document.getElementById("inputNombre").value = document.getElementById("nombre").textContent.trim();
        document.getElementById("inputDescripcion").value = document.getElementById("descripcion").textContent.trim();
        document.getElementById("inputTelefono").value = document.getElementById("telefono").textContent.trim();
        document.getElementById("inputCorreo").value = document.getElementById("correo").textContent.trim();
    });

    btnGuardarPerfil.addEventListener("click", function () {
        let nombre = document.getElementById("inputNombre").value.trim();
        let descripcion = document.getElementById("inputDescripcion").value.trim();
        let telefono = document.getElementById("inputTelefono").value.trim();
        let correo = document.getElementById("inputCorreo").value.trim();

        if (nombre !== "") document.getElementById("nombre").textContent = nombre;
        if (descripcion !== "") document.getElementById("descripcion").textContent = descripcion;
        if (telefono !== "") document.getElementById("telefono").textContent = telefono;
        if (correo !== "") document.getElementById("correo").textContent = correo;

        modalPerfil.hide();
    });

    // ==========================================
    // IMAGEN DE PERFIL
    // ==========================================
    const inputImagen = document.getElementById("inputImagen");

    inputImagen.addEventListener("change", function () {
        let archivo = inputImagen.files[0];
        if (archivo) {
            let imagen = document.getElementById("imagenPerfil");
            imagen.src = URL.createObjectURL(archivo);
        }
    });

    // ==========================================
    // MODO OSCURO (Bootstrap 5 Dark Theme API)
    // ==========================================
    const btnModoOscuro = document.getElementById("btnModoOscuro");
    const iconoModo = document.getElementById("iconoModo");
    const textoModo = document.getElementById("textoModo");

    btnModoOscuro.addEventListener("click", function () {
        const html = document.documentElement;
        const esOscuro = html.getAttribute("data-bs-theme") === "dark";

        if (esOscuro) {
            html.setAttribute("data-bs-theme", "light");
            iconoModo.className = "bi bi-moon-stars-fill me-1";
            textoModo.textContent = "Modo oscuro";
            btnModoOscuro.className = "btn btn-outline-light rounded-pill px-3";
        } else {
            html.setAttribute("data-bs-theme", "dark");
            iconoModo.className = "bi bi-sun-fill me-1";
            textoModo.textContent = "Modo claro";
            btnModoOscuro.className = "btn btn-outline-warning rounded-pill px-3";
        }
    });

    // ==========================================
    // HISTORIA ACADÉMICA
    // ==========================================
    const btnMostrarAcademico = document.getElementById("btnMostrarAcademico");
    const formularioAcademico = document.getElementById("formularioAcademico");
    const btnCancelarAcademico = document.getElementById("btnCancelarAcademico");
    const btnGuardarAcademico = document.getElementById("btnGuardarAcademico");

    btnMostrarAcademico.addEventListener("click", function () {
        formularioAcademico.classList.remove("d-none");
    });

    btnCancelarAcademico.addEventListener("click", function () {
        formularioAcademico.classList.add("d-none");
    });

    btnGuardarAcademico.addEventListener("click", function () {
        let institucion = document.getElementById("institucion").value.trim();
        let titulo = document.getElementById("titulo").value.trim();
        let fecha = document.getElementById("fechaAcademica").value.trim();

        if (institucion === "" || titulo === "" || fecha === "") {
            alert("Complete todos los campos.");
            return;
        }

        let tarjeta = document.createElement("div");
        tarjeta.className = "card tarjeta-academica shadow-sm bg-body border-0 rounded-3";

        tarjeta.innerHTML = `
            <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h5 class="card-title fw-bold mb-1 text-body-emphasis">${titulo}</h5>
                    <p class="card-text mb-1 text-body-secondary">
                        <strong>Institución:</strong> ${institucion}
                    </p>
                    <p class="card-text mb-0 small text-body-tertiary">
                        <strong>Periodo:</strong> ${fecha}
                    </p>
                </div>
                <button class="btn btn-outline-danger btn-sm rounded-pill btn-eliminar">Eliminar</button>
            </div>
        `;

        tarjeta.querySelector(".btn-eliminar").addEventListener("click", function () {
            tarjeta.remove();
        });

        document.getElementById("listaAcademica").appendChild(tarjeta);

        document.getElementById("institucion").value = "";
        document.getElementById("titulo").value = "";
        document.getElementById("fechaAcademica").value = "";

        formularioAcademico.classList.add("d-none");
    });

    // ==========================================
    // HISTORIAL LABORAL
    // ==========================================
    const btnMostrarLaboral = document.getElementById("btnMostrarLaboral");
    const formularioLaboral = document.getElementById("formularioLaboral");
    const btnCancelarLaboral = document.getElementById("btnCancelarLaboral");
    const btnGuardarLaboral = document.getElementById("btnGuardarLaboral");

    btnMostrarLaboral.addEventListener("click", function () {
        formularioLaboral.classList.remove("d-none");
    });

    btnCancelarLaboral.addEventListener("click", function () {
        formularioLaboral.classList.add("d-none");
    });

    btnGuardarLaboral.addEventListener("click", function () {
        let empresa = document.getElementById("empresa").value.trim();
        let cargo = document.getElementById("cargo").value.trim();
        let fecha = document.getElementById("fechaLaboral").value.trim();
        let descripcion = document.getElementById("descripcionTrabajo").value.trim();

        if (empresa === "" || cargo === "" || fecha === "" || descripcion === "") {
            alert("Complete todos los campos.");
            return;
        }

        let tarjeta = document.createElement("div");
        tarjeta.className = "card tarjeta-laboral shadow-sm bg-body border-0 rounded-3";

        tarjeta.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                    <div>
                        <h5 class="card-title fw-bold mb-1 text-body-emphasis">${cargo}</h5>
                        <h6 class="card-subtitle text-success mb-2">Empresa: ${empresa}</h6>
                    </div>
                    <button class="btn btn-outline-danger btn-sm rounded-pill btn-eliminar">Eliminar</button>
                </div>
                <p class="card-text mb-2 text-body-secondary">${descripcion}</p>
                <p class="card-text mb-0 small text-body-tertiary">
                    <strong>Periodo:</strong> ${fecha}
                </p>
            </div>
        `;

        tarjeta.querySelector(".btn-eliminar").addEventListener("click", function () {
            tarjeta.remove();
        });

        document.getElementById("listaLaboral").appendChild(tarjeta);

        document.getElementById("empresa").value = "";
        document.getElementById("cargo").value = "";
        document.getElementById("fechaLaboral").value = "";
        document.getElementById("descripcionTrabajo").value = "";

        formularioLaboral.classList.add("d-none");
    });

});


let productos = [];
/* ======================================================
   NAVEGACIÓN SPA
====================================================== */

window.mostrarVista = function (id) {
  document.querySelectorAll(".vista").forEach(vista => {
    vista.classList.remove("activa");
  });

  const vistaActiva = document.getElementById(id);
  if (vistaActiva) {
    vistaActiva.classList.add("activa");
  }

  const menu = document.getElementById("menu");
  if (menu) menu.style.display = "none";
};

window.toggleMenu = function () {
  const menu = document.getElementById("menu");
  if (!menu) return;

  menu.style.display =
    menu.style.display === "flex" ? "none" : "flex";
};



async function cargarProductos() {
  try {
    const response = await fetch("https://6975800a265838bbea97757a.mockapi.io/prove/products");
    const data = await response.json();

    productos = data; // guardamos los datos
    mostrarProductos(productos); // pintamos catálogo
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}


/* ======================================================
   CATÁLOGO
====================================================== */

const gridProductos = document.getElementById("grid-productos");

function mostrarProductos(lista) {
  if (!gridProductos) return;

  gridProductos.innerHTML = "";

  lista.forEach(producto => {
    const card = document.createElement("div");
    card.classList.add("producto");

    card.innerHTML = `
      <img src="${producto.image}" alt="${producto.name}">
      <h3>${producto.name}</h3>

      <button class="btn-detalle" data-id="${producto.id}">
        Ver detalle
      </button>

      <button class="btn-ar">
        Visualizar en AR
      </button>
    `;

    // 👉 botón detalle
    card.querySelector(".btn-detalle").addEventListener("click", () => {
  verDetalle(producto);
});

    // 👉 botón AR
    card.querySelector(".btn-ar").addEventListener("click", () => {
      verAR(producto.model_glb, producto.model_usdz);
    });

    gridProductos.appendChild(card);
  });
}



window.verDetalle = function (producto) {
  // cerrar modal previo
  const anterior = document.querySelector(".detalle-modal");
  if (anterior) anterior.remove();

  const modal = document.createElement("div");
  modal.className = "detalle-modal";

  modal.innerHTML = `
    <div class="detalle-header">
      <h2>${producto.name}</h2>
      <button onclick="cerrarDetalle()">✕</button>
    </div>

    <div class="detalle-contenido">
      <img src="${producto.image}" alt="${producto.name}">
      <p>${producto.description}</p>

      <div class="medidas">
        <p><strong>Alto:</strong> ${producto.height} cm</p>
        <p><strong>Ancho:</strong> ${producto.width} cm</p>
        <p><strong>Profundidad:</strong> ${producto.depth} cm</p>
      </div>

      <button class="btn-ar"
        onclick="verAR('${producto.model_glb}', '${producto.model_usdz}')">
        Visualizar en mi espacio
      </button>
    </div>
  `;

  document.body.appendChild(modal);
};



window.cerrarDetalle = function () {
  const modal = document.querySelector(".detalle-modal");
  if (modal) modal.remove();
};



let modeloPendiente = null;

/* =============================
   ESTADO LOGIN
============================= */

function estaLogueado() {
  return localStorage.getItem("usuarioAR") !== null;
}

function actualizarEstadoLogin() {
  const btnLogout = document.getElementById("btn-logout");
  if (!btnLogout) return;

  if (estaLogueado()) {
    btnLogout.classList.remove("hidden");
  } else {
    btnLogout.classList.add("hidden");
  }
}

/* =============================
   LOGIN
============================= */

function abrirLogin(modeloGLB, modeloUSDZ) {
  modeloPendiente = { modeloGLB, modeloUSDZ };
  document.getElementById("login-modal").classList.remove("hidden");
}

function cerrarLogin() {
  document.getElementById("login-modal").classList.add("hidden");
  modeloPendiente = null;
}

/* =============================
   LOGOUT
============================= */

function logoutSimulado() {
  localStorage.removeItem("usuarioAR");

  cerrarAR?.();
  cerrarDetalle?.();

  actualizarEstadoLogin();
  alert("Sesión cerrada correctamente");
}

/* =============================
   EVENTOS
============================= */

document.addEventListener("DOMContentLoaded", () => {
  actualizarEstadoLogin();

  const btnLogin = document.getElementById("btn-login");
  const btnLogout = document.getElementById("btn-logout");

  if (btnLogin) {
    btnLogin.addEventListener("click", () => {
      const nombre = document.getElementById("login-nombre").value;
      const email = document.getElementById("login-email").value;

      if (!nombre || !email) {
        alert("Completa todos los campos");
        return;
      }

      localStorage.setItem(
        "usuarioAR",
        JSON.stringify({ nombre, email })
      );

      cerrarLogin();
      actualizarEstadoLogin();

      if (modeloPendiente) {
        verAR(modeloPendiente.modeloGLB, modeloPendiente.modeloUSDZ);
        modeloPendiente = null;
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", logoutSimulado);
  }
});


/* ======================================================
   REALIDAD AUMENTADA
====================================================== */

window.verAR = function (modeloGLB, modeloUSDZ) {
  if (!estaLogueado()) {
    abrirLogin(modeloGLB, modeloUSDZ);
    return;
  }

  const modal = document.createElement("div");
  modal.className = "ar-modal";

  modal.innerHTML = `
  <div class="logo">
    <img src="img/logo-prove.webp" alt="Provefabrica">
  </div>
    <div class="ar-header">
      <span>Vista en Realidad Aumentada</span>
      <button onclick="cerrarAR()">✕</button>
    </div>

    <p class="ar-instrucciones">
      Mueve tu celular para detectar una superficie plana.
    </p>

    <model-viewer
      src="${modeloGLB}"
      ios-src="${modeloUSDZ}"
      ar
      ar-modes="scene-viewer webxr quick-look"
      camera-controls
      shadow-intensity="1"
      style="width:100%; height:80vh;">
    </model-viewer>
  `;

  document.body.appendChild(modal);
};


window.cerrarAR = function () {
  const modal = document.querySelector(".ar-modal");
  if (modal) modal.remove();
};

/* ======================================================
   INIT
====================================================== */

cargarProductos();


let estadoFiltros = {
  busqueda: "",
  categoria: "todas",
  orden: "nombre-asc"
};


function aplicarFiltros() {
  let resultado = [...productos];

  if (estadoFiltros.busqueda) {
    resultado = resultado.filter(p =>
      p.name.toLowerCase().includes(estadoFiltros.busqueda)
    );
  }

  if (estadoFiltros.categoria !== "todas") {
    resultado = resultado.filter(
      p => p.category === estadoFiltros.categoria
    );
  }

  resultado.sort((a, b) => {
    if (estadoFiltros.orden === "nombre-asc") {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  mostrarProductos(resultado);
}


const inputBusqueda = document.getElementById("busqueda");
const selectCategoria = document.getElementById("categoria");
const selectOrden = document.getElementById("ordenar");

if (inputBusqueda) {
  inputBusqueda.addEventListener("input", e => {
    estadoFiltros.busqueda = e.target.value.toLowerCase();
    aplicarFiltros();
  });
}

if (selectCategoria) {
  selectCategoria.addEventListener("change", e => {
    estadoFiltros.categoria = e.target.value;
    aplicarFiltros();
  });
}

if (selectOrden) {
  selectOrden.addEventListener("change", e => {
    estadoFiltros.orden = e.target.value;
    aplicarFiltros();
  });
}
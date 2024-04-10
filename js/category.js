// Para traer las variables desde el CSS
let colRoj = getComputedStyle(document.documentElement).getPropertyValue(
	"--colRojo"
);

let colVer = getComputedStyle(document.documentElement).getPropertyValue(
	"--colVerde"
);

function mensaje_debajo_input(mensaje, color) {
	if (color === "verde")
		document.getElementById("mns-input-cat").style.color = `${colVer}`;
	else document.getElementById("mns-input-cat").style.color = `${colRoj}`;
	document.getElementById("mns-input-cat").innerHTML = `${mensaje}`;
}

/* ============================================ */
const categ_cancelar = document.getElementById("categ-cancelar");
const categ_agregar = document.getElementById("categ-agregar");
const categ_editar = document.getElementById("categ-editar");
const categ_nombre = document.getElementById("categ-nombre");
let categoria = {}; //objeto vacío para crear y editar.
let idCat_paraEditar;

/* ============================================ */
/* -- Limpia el Input cuando cancela Crear o Editar -- */
categ_cancelar.addEventListener("click", () => {
	mensaje_debajo_input("Ingrese el nombre de la Categoría.", "verde");

	categ_agregar.style.display = `flex`;
	categ_editar.style.display = `none`;

	categ_nombre.value = "";
});

/* ============== NUEVA CATEGORIA ============= */
categ_agregar.addEventListener("click", () => {
	categoria = {};
	categoria.nombre = categ_nombre.value.toUpperCase().slice(0, 20);
	registrarCategoria(categoria); //manda a la DBF
	categ_nombre.value = "";
});

// Agrega una categoría en la DBF
let registrarCategoria = async (categoria) => {
	try {
		let peticion = await fetch("http://localhost:8080/api_watch/cat/crear", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify(categoria),
		});
	} catch (error) {
		console.log("ERROR - Alta de categoría: ", error);
	}
	listarCategorias(); //actualizar listado
};

/* ============== LISTAR CATEGORIA ============= */
const spinner_cat = document.getElementById("spinner-cat");
function listarCategorias() {
	spinner_cat.removeAttribute("hidden");

	let respuestaFetch = fetch("http://localhost:8080/api_watch/cat/listar", {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json; charset=utf-8",
		},
	});

	respuestaFetch
		.then((respuesta) => {
			return respuesta.json();
		})
		.then((data) => {
			spinner_cat.setAttribute("hidden", "");
			mostrarCategorias(data);
		})
		.catch((error) => {
			console.log("ERROR - Listar categorías: ", error);
		});
}

//------------------------------------
const categ_tabla_listado = document.getElementById("categ-tabla-listado");
function mostrarCategorias(listCat) {
	categ_tabla_listado.innerHTML = "";
	if (listCat.length === 0) categ_tabla_listado.innerHTML += `¡Sin Categorías!`;
	else {
		for (const cat of listCat) {
			categ_tabla_listado.innerHTML += `
		<div class="categoria__listado-fila">
				<div class="categoria__listado-nombres">${cat.id}-${cat.nombre}</div>
				<div class="categoria__listado-iconos">

					<span onClick="editarCategoria(${cat.id})" class="material-symbols-outlined categoria__listado-iconos--edi"> edit </span>
					
					<span onClick="borrarCategoria(${cat.id})" class="material-symbols-outlined categoria__listado-iconos--bor"> delete </span>
					
				</div>
		</div>`;
		}
	}
}

/* ============== BORRAR CATEGORIA ============= */
let borrarCategoria = async (idCat) => {
	try {
		const peticion = await fetch(
			"http://localhost:8080/api_watch/cat/" + idCat,
			{
				method: "DELETE",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json; charset=utf-8",
				},
			}
		);
	} catch (error) {
		console.log("ERROR - Borrar una categoría: ", error);
	}
	listarCategorias();
};

/* ============== EDITAR CATEGORIA ============= */
// 1- Busca la categoría a editar y la muestra en el input.
function editarCategoria(idCat) {
	idCat_paraEditar = idCat;

	let respuestaFetch = fetch("http://localhost:8080/api_watch/cat/" + idCat, {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json; charset=utf-8",
		},
	});

	respuestaFetch
		.then((respuesta) => {
			return respuesta.json();
		})
		.then((data) => {
			mostrarCatParaEditar(data);
		})
		.catch((error) => {
			console.log("ERROR - Buscar una categoría: ", error);
		});
}
// 2-Mostrar
function mostrarCatParaEditar(categoria) {
	categ_agregar.style.display = `none`;
	categ_editar.style.display = `flex`;
	mensaje_debajo_input("EDITE el nombre de la Categoría.", "rojo");
	categ_nombre.value = categoria.nombre;
}

// 3-Btn "guardar categoría editada"
categ_editar.addEventListener("click", () => {
	categoria = {};
	categoria.nombre = categ_nombre.value.toUpperCase().slice(0, 20);
	guardarEditarCategoria(idCat_paraEditar, categoria);

	categ_agregar.style.display = `flex`;
	categ_editar.style.display = `none`;
	categ_nombre.value = "";
	mensaje_debajo_input("Ingrese el nombre de la Categoría.", "verde");
});

//4- Guarda la categoría editada
let guardarEditarCategoria = async (id, categoria) => {
	try {
		let peticion = await fetch("http://localhost:8080/api_watch/cat/" + id, {
			method: "PUT",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify(categoria),
		});
	} catch (error) {
		console.log("ERROR - Guardar una categoría editada: ", error);
	}
	listarCategorias(); //actualizar listado
};

/* ======================================================== */
/* Funciones que deben ejecutarse al cargar menú Categorías */
//(desde main.js)
function funcionesCategorias() {
	listarCategorias();
}

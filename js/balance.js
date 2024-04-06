//++++++++++++++++++++++++++++++++++++++++++++++++++++//
//            Variables Globales
let operListado = []; //Aquí se guarda Operaciones desde la DBF
let operFiltros = []; //copia de Operaciones, para FILTROS

//++++++++++++++++++++++++++++++++++++++++++++++++++++//
//            BALANCE  y FILTROS
//++++++++++++++++++++++++++++++++++++++++++++++++++++//

// ===================================================
// Inicializa fechas en los filtros y para Nueva operación
function inicializarFechaInput(id_del_input, que_hago) {
	var fecha;
	if (que_hago === "restarMes") {
		let fechaMiliseg = new Date().getTime();
		fecha = new Date(fechaMiliseg - 2629800000);
	} else {
		fecha = new Date();
	}

	var fecParaInput = fecha.getFullYear() + "-";

	fecha.getMonth() + 1 < 10
		? (fecParaInput += "0" + (fecha.getMonth() + 1) + "-")
		: (fecParaInput += fecha.getMonth() + 1 + "-");
	fecha.getDate() < 10
		? (fecParaInput += "0" + fecha.getDate())
		: (fecParaInput += fecha.getDate());
	document
		.getElementById(`${id_del_input}`)
		.setAttribute("value", fecParaInput);
}

function inicializarFechas() {
	inicializarFechaInput("filtro-fecha-desde", "restarMes");
	inicializarFechaInput("filtro-fecha-hasta", "noRestarMes");
	//inicializarFechaInput("fecha-oper-input", "noRestarMes");
}

// ===================================================
// Muestra/Oculta filtros
const ocultar_filtros = document.getElementById("ocultar-filtros");
const contenedor_filtros = document.getElementById("contenedor-filtros");

ocultar_filtros.addEventListener("click", () => {
	contenedor_filtros.classList.toggle("ocultar");
	if (contenedor_filtros.classList.contains("ocultar")) {
		ocultar_filtros.innerHTML = `<i class="fa-regular fa-eye"></i><p class=""> Mostrar Filtros </p>`;
	} else {
		ocultar_filtros.innerHTML = `<i class="fa-regular fa-eye-slash"></i><p class=""> Ocultar Filtros </p>`;
	}
});

// ===================================================
// Funciones de filtrar operaciones
function masReciente(operFiltros, como) {
	if (como === "A") {
		operFiltros.sort((a, b) => {
			return new Date(a.fecha) - new Date(b.fecha);
		});
	} else {
		operFiltros.sort((a, b) => {
			return new Date(b.fechaOperacion) - new Date(a.fechaOperacion);
		});
	}
}
//---------------------------------------
function mayorMonto(operFiltros, como) {
	return operFiltros.sort((a, b) => {
		return como === "A" ? a.monto - b.monto : b.monto - a.monto;
	});
}
//---------------------------------------
function aZ(operFiltros, como) {
	if (como === "A") {
		operFiltros.sort((a, b) => {
			return a.descripcion.localeCompare(b.descripcion);
		});
	} else {
		operFiltros.sort((a, b) => {
			return b.descripcion.localeCompare(a.descripcion);
		});
	}
}
//---------------------------------------
function ordenarOperaciones(operFiltros, orden) {
	switch (orden) {
		case "mas_reciente":
			operFiltros = masReciente(operFiltros, "D");
			break;
		case "menos_reciente":
			operFiltros = masReciente(operFiltros, "A");
			break;
		case "mayor_monto":
			operFiltros = mayorMonto(operFiltros, "D");
			break;
		case "menor_monto":
			operFiltros = mayorMonto(operFiltros, "A");
			break;
		case "A_Z":
			operFiltros = aZ(operFiltros, "A");
			break;
		case "Z_A":
			operFiltros = aZ(operFiltros, "D");
			break;
		default:
	}
}
//---------------------------------------

function mostrarDatosEncabezadoBalance(sumaGana, sumaGasto) {
	let totBal;
	document.getElementById("balance-ganancias").innerHTML = `$${formatPesos(
		sumaGana
	)}`;
	document.getElementById("balance-gastos").innerHTML = `-$${formatPesos(
		sumaGasto
	)}`;

	if (sumaGana - sumaGasto >= 0) {
		totBal = `<div class="verde"> $${formatPesos(sumaGana - sumaGasto)} </div>`;
	} else {
		totBal = `<div class="rojo">	-$${formatPesos(
			Math.abs(sumaGana - sumaGasto)
		)} </div>`;
	}
	document.getElementById("balance-total").innerHTML = `${totBal}`;
}
//---------------------------------------

// ===================================================
// Busca OPERACIONES de la base de datos, manda a filtrar y luego las muestra
const spinner_bal = document.getElementById("spinner-bal");

function cargarOperaciones() {
	spinner_bal.removeAttribute("hidden");

	let promesa = fetch("http://localhost:8080/api_watch/listaroper", {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json; charset=utf-8",
		},
	});

	promesa
		.then((respuesta) => {
			return respuesta.json();
		})
		.then((datosOper) => {
			operListado = [...datosOper];
				spinner_bal.setAttribute("hidden", "");
				filtrarOperaciones();
		})
		.catch((error) => {
			console.log("ERROR - Listar OPERACIONES en Balance: ", error);
		});
}

// ===================================================
// Función ppal que llaman TODOS los FILTROS cada vez que hay un cambio

const filtro_tipo = document.getElementById("filtro-tipo");
const filtro_cate = document.getElementById("filtro-categoria");
const filtro_fecha_desde = document.getElementById("filtro-fecha-desde");
const filtro_fecha_hasta = document.getElementById("filtro-fecha-hasta");
const filtro_orden = document.getElementById("filtro-orden");

filtro_tipo.addEventListener("change", filtrarOperaciones);
filtro_cate.addEventListener("change", filtrarOperaciones);
filtro_fecha_desde.addEventListener("change", filtrarOperaciones);
filtro_fecha_hasta.addEventListener("change", filtrarOperaciones);
filtro_orden.addEventListener("change", filtrarOperaciones);

function filtrarOperaciones() {
	operFiltros = [...operListado]; //recarga el array para volver a filtrar
	let sumaGana = 0;
	let sumaGasto = 0;

	//Si hay Operaciones, filtra y manda a mostrar.
	if (operFiltros.length > 0) {
		ocultar_filtros.classList.remove("ocultar");
		ocultar_filtros.innerHTML = `<i class="fa-regular fa-eye"></i><p class="ml-1"> Mostrar Filtros </p>`;

		/* Obtiene los value de cada filtro */
		const tipo = filtro_tipo.value;
		const cate = filtro_cate.value;
		const fechaDesde = new Date(`${filtro_fecha_desde.value}T00:00:00`);
		const fechaHasta = new Date(`${filtro_fecha_hasta.value}T00:00:00`);
		const orden = filtro_orden.value;

		/* Filtrar por Tipo */
		if (tipo !== "TODO") {
			operFiltros = operFiltros.filter((oper) => oper.tipo === tipo);
		}

		/* Filtrar por Categorías */
		if (cate !== "TODAS") {
			operFiltros = operFiltros.filter(
				(oper) => oper.categoria.id === parseInt(cate)
			);
		}

		/* Filtrar por Fecha desde - Hasta*/
		operFiltros = operFiltros.filter(function (op) {
			return (
				fechaDesde <= new Date(op.fechaOperacion) &&
				fechaHasta >= new Date(op.fechaOperacion)
			);
		});

		/* Filtrar - Ordenamiento*/
		ordenarOperaciones(operFiltros, orden);

		/* Recalcular resultados para encabezado de Balance -------------*/
		operFiltros.forEach((op) => {
			op.tipo === "GANANCIA"
				? (sumaGana = sumaGana + op.monto)
				: (sumaGasto = sumaGasto + op.monto);
		});
		mostrarDatosEncabezadoBalance(sumaGana, sumaGasto);

		// Mostrar operaciones después de los filtros
		mostrarOperaciones(operFiltros);
	} else {
		ocultar_filtros.classList.add("ocultar");
	}
}

//-------------------------------------
const cont_sin_oper = document.getElementById("cont-sin-oper");
const cont_con_oper = document.getElementById("cont-con-oper");
const con_oper_listado = document.getElementById("con-oper-listado");

function mostrarOperaciones(listOper) {
	if (listOper.length > 0) {
		cont_sin_oper.classList.add("ocultar");
		cont_con_oper.classList.remove("ocultar");

		con_oper_listado.innerHTML = "";
		for (const oper of listOper) {
			con_oper_listado.innerHTML += `
			<div class="balance__operacion-listado-fila">
				<div class="balance__operacion-2filas-a">	
					<div class="balance__fila-desc">${oper.descripcion}</div>
					<div class="balance__fila-cate">${oper.categoria.nombre}</div>
				</div>	
				<div class="balance__operacion-2filas-b">
					<div class="balance__fila-fech">${formatFecha(oper.fechaOperacion)}</div>
					${posNeg(oper.tipo, oper.monto)}
					<div class="balance__fila-btn">
						<span onClick="editarOper(${
							oper.id
						})" class="material-symbols-outlined balance__fila-btn--edi"> edit </span>
						<span onClick="borrarOper(${
							oper.id
						})" class="material-symbols-outlined balance__fila-btn--del"> delete </span>
					</div>
				</div>
			</div>
			`;
		}
	} else {
		cont_sin_oper.classList.remove("ocultar");
		cont_con_oper.classList.add("ocultar");
	}
}

//-----------------------------
function formatFecha(f) {
	let fc = new Date(f);
	let ff;
	fc.getDate() < 10
		? (ff = "0" + fc.getDate() + "-")
		: (ff = fc.getDate() + "-");
	fc.getMonth() + 1 < 10
		? (ff += "0" + (fc.getMonth() + 1) + "-")
		: (ff += fc.getMonth() + 1 + "-");
	ff += fc.getFullYear();
	return ff;
}
//-----------------------------
function posNeg(tipo, monto) {
	let pN;
	if (tipo === "GANANCIA") {
		pN = `<div class="balance__fila-mont verde">$${formatPesos(monto)}</div>`;
	} else {
		pN = `<div class="balance__fila-mont rojo" >-$${formatPesos(
			Math.abs(monto)
		)}</div>`;
	}
	return pN;
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++//
//      OPERACIONES nueva, editar, borrar
//++++++++++++++++++++++++++++++++++++++++++++++++++++//

// ===================================================
// Busca categorías de la base de datos, luego las muestra
function cargarCategorias() {
	let promesa = fetch("http://localhost:8080/api_watch/listar", {
		method: "GET",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json; charset=utf-8",
		},
	});

	promesa
		.then((respuesta) => {
			return respuesta.json();
		})
		.then((data) => {
			mostrarCategoriasOper(data);
		})
		.catch((error) => {
			console.log("ERROR - Carga de CATEGORÍAS en Operaciones: ", error);
		});
}

//------------------------------------
const categoria_oper_select = document.getElementById("categoria-oper-select");
const filtro_categoria = document.getElementById("filtro-categoria");
function mostrarCategoriasOper(listCat) {
	//mostrar en Filtros
	filtro_categoria.innerHTML = `<option value="TODAS">TODAS</option>`;
	if (listCat.length === 0) {
		filtro_categoria.innerHTML += `<option value=0>Sin Categorías</option>`;
	} else {
		for (const cat of listCat) {
			filtro_categoria.innerHTML += `
			<option value=${cat.id}>${cat.nombre}</option>`;
		}
	}

	//Mostrar en Nueva Operación
	categoria_oper_select.innerHTML = "";
	if (listCat.length === 0) {
		categoria_oper_select.innerHTML += `<option value=0>Sin Categorías</option>`;
	} else {
		for (const cat of listCat) {
			categoria_oper_select.innerHTML += `
			<option value=${cat.id}>${cat.nombre}</option>`;
		}
	}
}

// ===================================================
// Muestra Nueva Operación
const btn_nueva_oper = document.getElementById("btn-nueva-oper");
const cont_nueva_oper = document.getElementById("cont-nueva-oper");

btn_nueva_oper.addEventListener("click", () => {
	contenedor_menuBalance.classList.add("ocultar"); //viene de main.js
	cont_nueva_oper.classList.remove("ocultar");
});

const btn_agregar_oper = document.getElementById("btn-agregar-oper");
const btn_cancelar_oper = document.getElementById("btn-cancelar-oper");

btn_agregar_oper.addEventListener("click", () => {
	contenedor_menuBalance.classList.remove("ocultar"); //viene de main.js
	cont_nueva_oper.classList.add("ocultar");
});

btn_cancelar_oper.addEventListener("click", () => {
	contenedor_menuBalance.classList.remove("ocultar"); //viene de main.js
	cont_nueva_oper.classList.add("ocultar");
});

// ======================================================== //
// Funciones que deben ejecutarse al cargar menú Balance
//(desde main.js)
function funcionesBalance() {
	inicializarFechas();
	cargarCategorias();
	cargarOperaciones();
}

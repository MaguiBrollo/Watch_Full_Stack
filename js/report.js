//++++++++++++++++++++++++++++++++++++++++++++++++++++//
//            Variables Globales
let categReporte = [];
let operaReporte = [];

/* Meses para Mes CON MAYOR ganancia */
const meses = [
	"ENE",
	"FEB",
	"MAR",
	"ABR",
	"MAY",
	"JUN",
	"JUL",
	"AGO",
	"SEP",
	"OCT",
	"NOV",
	"DIC",
];

/* =============================================================== */
/* "Categoría" con Mayor GANANCIA y con Mayor GASTO */
function CatMayorGananciaGasto(tipo, mayor) {
	categReporte.forEach((cat) => {
		const filtrarOperPorCat = operaReporte.filter(
			(oper) => oper.tipo === tipo && cat.id === oper.categoria.id
		);

		let totalCat = 0;
		if (filtrarOperPorCat.length !== 0) {
			totalCat = filtrarOperPorCat.reduce(function (total, oper) {
				return total + oper.monto;
			}, 0);
		}
		if (totalCat > mayor.importeCategoria) {
			mayor.importeCategoria = totalCat;
			mayor.nombreCategoria = cat.nombre;
		}
	});
}

/* =============================================================== */
/* Categoría con Mayor BALANCE */
function CatMayorBalance(mayor) {
	categReporte.forEach((cat) => {
		const filtrarOperPorCat = operaReporte.filter(
			(oper) => cat.id === oper.categoria.id
		);

		let totalCat = 0;
		if (filtrarOperPorCat.length !== 0) {
			totalCat = filtrarOperPorCat.reduce(function (total, oper) {
				return oper.tipo === "GANANCIA"
					? total + oper.monto
					: total - oper.monto;
			}, 0);
		}
		if (totalCat > mayor.importeCategoria) {
			mayor.importeCategoria = totalCat;
			mayor.nombreCategoria = cat.nombre;
		}
	});
}

/* =============================================================== */
/* "MES" con Mayor GANANCIA y con Mayor GASTO */
function MesMayorGananciaGasto(tipo, mayor) {
	let arrayAnioMes = [];

	operaReporte.forEach((oper) => {
		const fechaOper = new Date(`${oper.fechaOperacion}T00:00:00`);
		const anio = fechaOper.getFullYear();
		const mes = fechaOper.getMonth();
		if (
			oper.tipo === tipo &&
			!arrayAnioMes.some((e) => anio === e.anio && mes === e.mes)
		) {
			arrayAnioMes.push({
				anio: anio,
				mes: mes,
			});
		}
	});

	arrayAnioMes.forEach((anioMes) => {
		const filtrarOperPorMes = operaReporte.filter(
			(oper) =>
				oper.tipo === tipo &&
				new Date(`${oper.fechaOperacion}T00:00:00`).getFullYear() ===
					anioMes.anio &&
				new Date(`${oper.fechaOperacion}T00:00:00`).getMonth() === anioMes.mes
		);

		let totalCat = 0;
		if (filtrarOperPorMes.length !== 0) {
			totalCat = filtrarOperPorMes.reduce(function (total, oper) {
				return total + oper.monto;
			}, 0);
		}
		if (totalCat >= mayor.importe) {
			mayor.importe = totalCat;
			mayor.mes = `${meses[anioMes.mes]}-${anioMes.anio}`;
		}
	});
}

/* =============================================================== */
/*  TOTALES por CATEGORIA (Ganancia-Gasto-Balance) */
function totalesPorCat(totales) {
	categReporte.forEach((cat) => {
		const filtrarOperPorCat = operaReporte.filter(
			(oper) => cat.id === oper.categoria.id
		);

		let gan = 0;
		let gas = 0;
		filtrarOperPorCat.forEach((fil) => {
			fil.tipo === "GANANCIA" ? (gan += fil.monto) : (gas += fil.monto);
		});

		if (gan > 0 || gas > 0) {
			totales.push({
				nombreCat: cat.nombre,
				ganancia: gan,
				gasto: gas,
				balance: gan - gas,
			});
		}
	});

	totales.sort((a, b) => {
		return a.nombreCat.localeCompare(b.nombreCat);
	});
}

/* ===================================================== */
/*  TOTALES por MESES (Ganancia-Gasto-Balance) */
function totalesPorMes(totales) {
	let arrayAnioMes = [];
	operaReporte.forEach((oper) => {
		const fechaOper = new Date(`${oper.fechaOperacion}T00:00:00`);
		const anio = fechaOper.getFullYear();
		const mes = fechaOper.getMonth();

		if (!arrayAnioMes.some((e) => anio === e.anio && mes === e.mes)) {
			arrayAnioMes.push({
				anio: fechaOper.getFullYear(),
				mes: fechaOper.getMonth(),
			});
		}
	});

	arrayAnioMes.forEach((anioMes) => {
		const filtrarOperPorMes = operaReporte.filter(
			(oper) =>
				new Date(`${oper.fechaOperacion}T00:00:00`).getFullYear() ===
					anioMes.anio &&
				new Date(`${oper.fechaOperacion}T00:00:00`).getMonth() === anioMes.mes
		);

		let gan = 0;
		let gas = 0;
		filtrarOperPorMes.forEach((fil) => {
			fil.tipo === "GANANCIA" ? (gan += fil.monto) : (gas += fil.monto);
		});

		if (gan > 0 || gas > 0) {
			totales.push({
				mes: `${anioMes.anio} - ${meses[anioMes.mes]}`,
				mesNum: anioMes.mes,
				anio: anioMes.anio,
				ganancia: gan,
				gasto: gas,
				balance: gan - gas,
			});
		}
	});
	//ORDENAR
	totales.sort((a, b) => {
		if (a.anio > b.anio) {
			return -1;
		} else {
			if (a.anio < b.anio) {
				return 1;
			} else {
				if (a.mesNum > b.mesNum) {
					return -1;
				} else {
					if (a.mesNum < b.mesNum) {
						return 1;
					} else {
						return 0;
					}
				}
			}
		}
	});
}

/* ======================== MOSTRAR CON/SIN REPORTES ========================  */
/* Mostrar Imagen, y texto SIN REPORTES */
const cont_menu_reporte = document.getElementById("cont-menu-reporte");
const cont_sin_reporte = document.getElementById("cont-sin-reporte");
const cont_con_reporte = document.getElementById("cont-con-reporte");

const cat_may_gana_nom = document.getElementById("cat-may-gana-nom");
const cat_may_gana_imp = document.getElementById("cat-may-gana-imp");
const cat_may_gast_nom = document.getElementById("cat-may-gast-nom");
const cat_may_gast_imp = document.getElementById("cat-may-gast-imp");
const cat_may_bala_nom = document.getElementById("cat-may-bala-nom");
const cat_may_bala_imp = document.getElementById("cat-may-bala-imp");

const mes_may_gana_nom = document.getElementById("mes-may-gana-nom");
const mes_may_gana_imp = document.getElementById("mes-may-gana-imp");
const mes_may_gast_nom = document.getElementById("mes-may-gast-nom");
const mes_may_gast_imp = document.getElementById("mes-may-gast-imp");

const totales_por_categoria = document.getElementById("totales-por-categoria");
const totales_por_mes = document.getElementById("totales-por-mes");

/* ------------------------------------------------ */
function mostrarSinReportes() {
	cont_menu_reporte.classList.remove("ocultar");
	cont_sin_reporte.classList.remove("ocultar");
	cont_con_reporte.classList.add("ocultar");
}

/* ------------------------------------------------ */
/* Mostrar CON REPORTES */
function mostrarConReportes() {
	cont_menu_reporte.classList.remove("ocultar");
	cont_sin_reporte.classList.add("ocultar");
	cont_con_reporte.classList.remove("ocultar");

	/* -------------------------- */
	/*  CATEGORIA CON MAYOR GANANCIA */
	let mayor = {
		nombreCategoria: "",
		importeCategoria: 0,
	};
	CatMayorGananciaGasto("GANANCIA", mayor);
	cat_may_gana_nom.innerHTML = `${mayor.nombreCategoria}`;
	cat_may_gana_imp.innerHTML = `$${formatPesos(mayor.importeCategoria)}`;

	/* -------------------------- */
	/*  CATEGORIA CON MAYOR GASTO */
	mayor = {
		nombreCategoria: "",
		importeCategoria: 0,
	};
	CatMayorGananciaGasto("GASTO", mayor);
	cat_may_gast_nom.innerHTML = `${mayor.nombreCategoria}`;
	cat_may_gast_imp.innerHTML = `-$${formatPesos(mayor.importeCategoria)}`;

	/* -------------------------- */
	/*  CATEGORIA CON MAYOR BALANCE */
	mayor = {
		nombreCategoria: "",
		importeCategoria: Number.NEGATIVE_INFINITY, //número negativo, más grande, con el que trabaja JavaScript
	};
	CatMayorBalance(mayor);
	cat_may_bala_nom.innerHTML = `${mayor.nombreCategoria}`;
	cat_may_bala_imp.innerHTML = `$${formatPesos(mayor.importeCategoria)}`;

	/* -------------------------- */
	/*  Mes CON MAYOR GANANCIA */
	let mayorAnioMes = {
		mes: "",
		importe: 0,
	};
	MesMayorGananciaGasto("GANANCIA", mayorAnioMes);
	mes_may_gana_nom.innerHTML = `${mayorAnioMes.mes}`;
	mes_may_gana_imp.innerHTML = `$${formatPesos(mayorAnioMes.importe)}`;

	/* -------------------------- */
	/*  Mes CON MAYOR GASTO */
	mayorAnioMes = {
		mes: "",
		importe: 0,
	};
	MesMayorGananciaGasto("GASTO", mayorAnioMes);
	mes_may_gast_nom.innerHTML = `${mayorAnioMes.mes}`;
	mes_may_gast_imp.innerHTML = `-$${formatPesos(mayorAnioMes.importe)}`;

	/* -------------------------- */
	/* Totales por Categoria  */
	let totalesCat = [];
	totalesPorCat(totalesCat);
	totales_por_categoria.innerHTML = "";
	totalesCat.forEach((totCat) => {
		let x;
		if (totCat.balance > 0) {
			x = `<div class="reporte__list-izq"> $${formatPesos(
				totCat.balance
			)} </div>`;
		} else {
			x = `<div class="reporte__list-izq rojo">
			-$${formatPesos(Math.abs(totCat.balance))} </div>`;
		}

		totales_por_categoria.innerHTML += `
		<div class="reporte__list-cont" > 
			  <div class="reporte__list-der">${totCat.nombreCat}</div>
				<div class="reporte__list-izq-cont">
					<div class="reporte__list-izq">$${formatPesos(totCat.ganancia)}</div>
					<div class="reporte__list-izq">-$${formatPesos(totCat.gasto)}</div> 
					${x}
				</div> 
		</div>`;
	});

	/* -------------------------- */
	/* Totales por MESES  */
	let totalesMes = [];
	totalesPorMes(totalesMes);

	totales_por_mes.innerHTML = "";
	totalesMes.forEach((totMes) => {
		let tot_mes_balance;
		if (totMes.balance > 0) {
			tot_mes_balance = `<div class="reporte__list-izq"> $${formatPesos(
				totMes.balance
			)} </div>`;
		} else {
			tot_mes_balance = `<div class="reporte__list-izq rojo">
			-$${formatPesos(Math.abs(totMes.balance))} </div>`;
		}

		totales_por_mes.innerHTML += `<div class="reporte__list-cont" > 
			  <div class="reporte__list-der">${totMes.mes}</div>
				<div class="reporte__list-izq-cont">
					<div class="reporte__list-izq">$${formatPesos(totMes.ganancia)}</div>
					<div class="reporte__list-izq">-$${formatPesos(totMes.gasto)}</div> 
					${tot_mes_balance}
				</div> 
		</div>`;
	});
}

// ===================================================
// Busca categorías de la DBF
/* ============== LISTAR CATEGORIA ============= */

let buscarCategorias = async () => {
	try {
		let respuestaFetch = await fetch("http://localhost:8080/api_watch/listar", {
			method: "GET",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json; charset=utf-8",
			},
		});
		let categorias = await respuestaFetch.json();
		return categorias;
	} catch (error) {
		console.log("ERROR - Buscar Categorías en Reportes: ", error); //para ver error
	}
};

// ===================================================
// Busca OPERACIONES de la DBF
let buscarOperaciones = async () => {
	try {
		let respuestaFetch = await fetch(
			"http://localhost:8080/api_watch/listaroper",
			{
				method: "GET",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json; charset=utf-8",
				},
			}
		);
		let operaciones = await respuestaFetch.json();
		return operaciones;
	} catch (error) {
		console.log("ERROR - Buscar Operaciones en Reportes: ", error); //para ver error
	}
};

// ======================================================== //
/* viene de SCRIPT.JS */
async function mostrarReportes() {
	const spinner = document.getElementById("spinner");

	spinner.removeAttribute("hidden");

	categReporte = await buscarCategorias();
	operaReporte = await buscarOperaciones();

	spinner.setAttribute("hidden", "");

	if (operaReporte.length > 0 && categReporte.length > 0) {
		mostrarConReportes();
	} else {
		mostrarSinReportes();
	}
}

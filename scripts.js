// ---- Funciones para Generación de Campos Dinámicos ----

// Generar campos para "Clientes Cancelados"
function generarCamposClientesCancelados() {
    const cantidad = parseInt(document.getElementById("clientesCanceladosInput").value) || 0;
    const contenedor = document.getElementById("clientesCancelados");
    contenedor.innerHTML = ''; // Limpiar campos anteriores

    for (let i = 0; i < cantidad; i++) {
        const div = crearCampoClienteCancelado(i);
        contenedor.appendChild(div);
    }
}

function crearCampoClienteCancelado(index) {
    const div = document.createElement('div');
    div.className = 'input-group mb-2';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.placeholder = `Cliente Cancelado ${index + 1}`;

    const select = document.createElement('select');
    select.className = 'form-control ml-2';
    ["Renovable", "Suave", "Clavo"].forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.text = optionText;
        select.appendChild(option);
    });

    div.appendChild(input);
    div.appendChild(select);
    return div;
}

// Generar campos para otras secciones (Clientes Nuevos, Renovaciones, Gastos)
function generarCampos(seccionId, labelText, montoText) {
    const cantidad = parseInt(document.getElementById(`num${capitalize(seccionId)}`).value) || 0;
    const contenedor = document.getElementById(seccionId);
    contenedor.innerHTML = ''; // Limpiar campos anteriores

    for (let i = 0; i < cantidad; i++) {
        const div = crearCampoGenerico(labelText, montoText, i);
        contenedor.appendChild(div);
    }
}

function crearCampoGenerico(labelText, montoText, index) {
    const div = document.createElement('div');
    div.className = 'input-group mb-2';

    const inputLabel = document.createElement('input');
    inputLabel.type = 'text';
    inputLabel.className = 'form-control';
    inputLabel.placeholder = `${labelText} ${index + 1}`;

    const inputMonto = document.createElement('input');
    inputMonto.type = 'number';
    inputMonto.className = 'form-control ml-2';
    inputMonto.placeholder = `${montoText} ${index + 1}`;
    inputMonto.oninput = actualizarTotales; // Actualiza los totales al cambiar

    div.appendChild(inputLabel);
    div.appendChild(inputMonto);
    return div;
}

// ---- Funciones de Cálculo y Actualización ----

// Actualizar los totales (Total Prestado, Gastos, etc.)
function actualizarTotales() {
    const totalPrestado = sumarCampos('renovaciones') + sumarCampos('clientesNuevos');
    document.getElementById("totalPrestado").value = totalPrestado.toFixed(0);

    const totalGastos = sumarCampos('gastos');
    document.getElementById("totalGastos").value = totalGastos.toFixed(0);

    calcularPorcentajeGestion();
    calcularCajaRestante();
}

// Sumar los valores de los campos de una sección
function sumarCampos(seccionId) {
    const inputs = document.querySelectorAll(`#${seccionId} input[type='number']`);
    return Array.from(inputs).reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
}

// Calcular porcentaje de gestión
function calcularPorcentajeGestion() {
    const totalClientes = parseInt(document.getElementById("totalClientes").value) || 0;
    const clientesGestionados = parseInt(document.getElementById("clientesGestionados").value) || 0;

    const porcentajeGestion = totalClientes ? (clientesGestionados / totalClientes) * 100 : 0;
    document.getElementById("porcentajeGestion").value = porcentajeGestion.toFixed(2);
}

// Calcular caja restante
function calcularCajaRestante() {
    const totalCaja = parseFloat(document.getElementById('totalCaja').value) || 0;
    const totalGastos = parseFloat(document.getElementById('totalGastos').value) || 0;
    const cajaRestante = totalCaja - totalGastos;

    document.getElementById('cajaRestante').value = cajaRestante.toFixed(0);
}

// Capitalizar la primera letra de una cadena
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function generarPDF() {
    // Obtener los valores de los campos de entrada
    const totalCaja = document.getElementById('totalCaja').value;
    const cajaRestante = document.getElementById('cajaRestante').value;
    const clientesCancelados = document.getElementById('clientesCanceladosInput').value;
    const clientesNuevos = document.getElementById('numClientesNuevos').value;
    const renovaciones = document.getElementById('numRenovaciones').value;
    const totalPrestado = document.getElementById('totalPrestado').value;
    const numGastos = document.getElementById('numGastos').value;
    const totalGastos = document.getElementById('totalGastos').value;
    const totalClientes = document.getElementById('totalClientes').value;
    const clientesGestionados = document.getElementById('clientesGestionados').value;
    const porcentajeGestion = document.getElementById('porcentajeGestion').value;
    const totalRecaudado = document.getElementById('totalRecaudado').value;

    // Verificar si todos los campos tienen valores válidos
    if (!totalCaja || !clientesCancelados || !clientesNuevos || !renovaciones || !totalPrestado || !totalGastos || !totalClientes || !clientesGestionados || !porcentajeGestion || !totalRecaudado) {
        alert('Por favor, complete todos los campos antes de generar el reporte.');
        return;
    }

    // Crear el documento PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Iniciar la posición Y para la primera tabla
    let startY = 10;

    // Detalles generales
    const detalles = [
        ['Total Caja Inicial', totalCaja],
        ['Caja Restante', cajaRestante],
        ['Clientes Cancelados', clientesCancelados],
        ['Clientes Nuevos', clientesNuevos],
        ['Renovaciones', renovaciones],
        ['Total Prestado', totalPrestado],
        ['Número de Gastos', numGastos],
        ['Total Gastos', totalGastos],
        ['Total de Clientes', totalClientes],
        ['Clientes Gestionados', clientesGestionados],
        ['Porcentaje de Gestión', porcentajeGestion],
        ['Total Recaudado', totalRecaudado]
    ];

    // Agregar la tabla general
    doc.autoTable({
        head: [['Concepto', 'Valor']],
        body: detalles,
        startY: startY,
        theme: 'grid',
        didDrawPage: function (data) {
            startY = data.cursor.y + 5;  // Ajustar la posición Y después de la tabla
        }
    });

    // ** Título para Clientes Cancelados **
    doc.setFontSize(12);
    doc.text('Clientes Cancelados:', 10, startY + 10);
    startY += 15; // Ajustar la posición después del título

    // Detalles de clientes cancelados
    const detallesCancelados = [];
    const canceladosInputs = document.querySelectorAll('#clientesCancelados input');
    canceladosInputs.forEach((input, index) => {
        const select = input.nextElementSibling; // El select que está al lado del input
        const selectedOption = select.options[select.selectedIndex].text;
        detallesCancelados.push([`Cliente Cancelado ${index + 1}`, input.value, selectedOption]);
    });

    if (detallesCancelados.length > 0) {
        doc.autoTable({
            head: [['Cliente', 'Valor', 'Estado']],
            body: detallesCancelados,
            startY: startY,
            theme: 'grid',
            didDrawPage: function (data) {
                startY = data.cursor.y + 5;  // Ajustar la posición Y después de la tabla
            }
        });
    }

    // ** Título para Clientes Nuevos **
    doc.setFontSize(12);
    doc.text('Clientes Nuevos:', 10, startY + 10);
    startY += 15; // Ajustar la posición después del título

    // Detalles de clientes nuevos
    const detallesNuevos = [];
    const nuevosInputs = document.querySelectorAll('#clientesNuevos input');
    nuevosInputs.forEach((input, index) => {
        detallesNuevos.push([`Cliente Nuevo ${index + 1}`, input.value]);
    });

    if (detallesNuevos.length > 0) {
        doc.autoTable({
            head: [['Cliente', 'Valor']],
            body: detallesNuevos,
            startY: startY,
            theme: 'grid',
            didDrawPage: function (data) {
                startY = data.cursor.y + 5;  // Ajustar la posición Y después de la tabla
            }
        });
    }

    // ** Título para Renovaciones **
    doc.setFontSize(12);
    doc.text('Renovaciones:', 10, startY + 10);
    startY += 15; // Ajustar la posición después del título

    // Detalles de renovaciones
    const detallesRenovaciones = [];
    const renovacionesInputs = document.querySelectorAll('#renovaciones input');
    renovacionesInputs.forEach((input, index) => {
        detallesRenovaciones.push([`Renovación ${index + 1}`, input.value]);
    });

    if (detallesRenovaciones.length > 0) {
        doc.autoTable({
            head: [['Renovación', 'Valor']],
            body: detallesRenovaciones,
            startY: startY,
            theme: 'grid',
            didDrawPage: function (data) {
                startY = data.cursor.y + 5;  // Ajustar la posición Y después de la tabla
            }
        });
    }

    // ** Título para Gastos **
    doc.setFontSize(12);
    doc.text('Gastos:', 10, startY + 10);
    startY += 15; // Ajustar la posición después del título

    // Detalles de gastos
    const detallesGastos = [];
    const gastosInputs = document.querySelectorAll('#gastos input');
    gastosInputs.forEach((input, index) => {
        detallesGastos.push([`Gasto ${index + 1}`, input.value]);
    });

    if (detallesGastos.length > 0) {
        doc.autoTable({
            head: [['Gasto', 'Valor']],
            body: detallesGastos,
            startY: startY,
            theme: 'grid',
            didDrawPage: function (data) {
                startY = data.cursor.y + 5;  // Ajustar la posición Y después de la tabla
            }
        });
    }

    // Descargar el PDF generado
    doc.save('reporte_diario_ruta.pdf');
}

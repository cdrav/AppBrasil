// Función para generar campos de "Clientes Cancelados"
function generarCamposClientesCancelados() {
    const cantidad = parseInt(document.getElementById("clientesCanceladosInput")?.value) || 0;
    const contenedor = document.getElementById("clientesCancelados");
    contenedor.innerHTML = ''; // Limpiar campos anteriores

    for (let i = 0; i < cantidad; i++) {
        const div = document.createElement('div');
        div.className = 'input-group mb-2';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.placeholder = `Cliente Cancelado ${i + 1}`;

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
        contenedor.appendChild(div);
    }
}

// Función general para generar campos en otras secciones
function generarCampos(seccionId, labelText, montoText) {
    const cantidad = parseInt(document.getElementById(`num${capitalize(seccionId)}`)?.value) || 0;
    const contenedor = document.getElementById(seccionId);
    contenedor.innerHTML = ''; // Limpiar campos anteriores

    for (let i = 0; i < cantidad; i++) {
        const div = document.createElement('div');
        div.className = 'input-group mb-2';

        const inputLabel = document.createElement('input');
        inputLabel.type = 'text';
        inputLabel.className = 'form-control';
        inputLabel.placeholder = `${labelText} ${i + 1}`;

        const inputMonto = document.createElement('input');
        inputMonto.type = 'number';
        inputMonto.className = 'form-control ml-2';
        inputMonto.placeholder = `${montoText} ${i + 1}`;
        inputMonto.oninput = actualizarTotales; // Actualiza los totales al cambiar

        div.appendChild(inputLabel);
        div.appendChild(inputMonto);
        contenedor.appendChild(div);
    }
}

// Función para actualizar los totales
function actualizarTotales() {
    const totalPrestado = sumarCampos('renovaciones') + sumarCampos('clientesNuevos');
    document.getElementById("totalPrestado").value = totalPrestado.toFixed(2);

    const totalGastos = sumarCampos('gastos');
    document.getElementById("totalGastos").value = totalGastos.toFixed(2);

    calcularPorcentajeGestion();
}

// Función para sumar los valores de los campos de una sección
function sumarCampos(seccionId) {
    const inputs = document.querySelectorAll(`#${seccionId} input[type='number']`);
    return Array.from(inputs).reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
}

// Función para calcular el porcentaje de gestión
function calcularPorcentajeGestion() {
    const totalClientes = parseInt(document.getElementById("totalClientes")?.value) || 0;
    const clientesGestionados = parseInt(document.getElementById("clientesGestionados")?.value) || 0;

    const porcentajeGestion = totalClientes ? (clientesGestionados / totalClientes) * 100 : 0;
    document.getElementById("porcentajeGestion").value = porcentajeGestion.toFixed(2);
}

// Función para capitalizar la primera letra de una cadena
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para generar el PDF
async function generarPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        let currentY = 30;

        // Título
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("Reporte Diario de Ruta", pageWidth / 2, currentY, { align: 'center' });
        currentY += 20;

        // Línea de separación
        doc.line(20, currentY, pageWidth - 20, currentY);
        currentY += 20;

        // Tabla de datos generales
        const datosGenerales = [
            ["Clientes Cancelados", document.getElementById('clientesCanceladosInput')?.value || '0'],
            ["Clientes Nuevos", document.getElementById('numClientesNuevos')?.value || '0'],
            ["Número de Renovaciones", document.getElementById('numRenovaciones')?.value || '0'],
            ["Total Prestado en la Ruta", `$${document.getElementById('totalPrestado')?.value || '0.00'}`],
            ["Total Gastos", `$${document.getElementById('totalGastos')?.value || '0.00'}`],
            ["Total Clientes", document.getElementById('totalClientes')?.value || '0'],
            ["Clientes Gestionados", document.getElementById('clientesGestionados')?.value || '0'],
            ["Porcentaje de Gestión", `${document.getElementById('porcentajeGestion')?.value || '0.00'}%`],
            ["Total Recaudado", `$${document.getElementById('totalRecaudado')?.value || '0.00'}`],
            ["Totalidad de la Caja en la Ruta", `$${document.getElementById('totalCajaRuta')?.value || '0.00'}`]
        ];

        doc.autoTable({
            startY: currentY,
            head: [['Detalle', 'Valor']],
            body: datosGenerales,
            theme: 'grid',
            margin: { left: 20, right: 20 }
        });

        currentY = doc.previousAutoTable.finalY + 20;

        // Detalles adicionales
        agregarDetallesPDF(doc, 'clientesCancelados', 'Cancelaciones', ['#', 'Cliente', 'Observación']);
        agregarDetallesPDF(doc, 'clientesNuevos', 'Clientes Nuevos', ['#', 'Cliente', 'Monto']);
        agregarDetallesPDF(doc, 'renovaciones', 'Renovaciones', ['#', 'Descripción', 'Monto']);
        agregarDetallesPDF(doc, 'gastos', 'Gastos', ['#', 'Descripción', 'Monto']);

        // Descargar PDF
        doc.save('reporte_diario_ruta.pdf');
    } catch (error) {
        console.error("Error al generar el PDF:", error);
    }
}

// Función para agregar detalles al PDF
function agregarDetallesPDF(doc, seccionId, titulo, encabezados) {
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = doc.previousAutoTable.finalY + 20;

    // Título de la sección
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Detalles de ${titulo}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    // Recopilar datos de la sección
    const datos = Array.from(document.querySelectorAll(`#${seccionId} .input-group`)).map((grupo, i) => {
        const texto1 = grupo.querySelector('input[type="text"]')?.value || 'N/A'; // Cliente o descripción
        const texto2 = grupo.querySelector('input[type="number"]')?.value || '';  // Monto
        const texto3 = grupo.querySelector('select')?.value || '';                // Observación

        // Si es un formulario con "Observación", incluirla en lugar del monto
        if (texto3) {
            return [i + 1, texto1, texto3];
        }

        // Si no hay select, incluir el monto
        return [i + 1, texto1, texto2 || '0.00'];
    });

    // Generar tabla
    doc.autoTable({
        startY: currentY,
        head: [encabezados],
        body: datos,
        theme: 'striped',
        margin: { left: 20, right: 20 }
    });
}

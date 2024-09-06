const bingoTable = document.getElementById('bingo-table');
const numeroGrande = document.getElementById('numero-grande');
const numerosPrevios = document.getElementById('numeros-previos');
const velocidadInput = document.getElementById('velocidad');
const statusIndicator = document.getElementById('status-indicator');
let marcadoAutomatico = null;
let historialNumeros = [];
let automaticoActivo = false;
let numeroTecla = '';

// Función para manejar el clic en una celda
bingoTable.addEventListener('click', function(event) {
    if (event.target.tagName === 'TD') {
        marcarCelda(event.target);
    }
});

// Función para marcar una celda
function marcarCelda(celda) {
    if (!celda.classList.contains('highlight')) {
        celda.classList.add('highlight');
        celda.style.color = 'black'; // Cambiar el color del número a negro
        actualizarNumeros(celda.textContent);
    }
}

// Actualiza los números mostrados (últimos 2 números y el número grande)
function actualizarNumeros(numero) {
    if (numero) {
        historialNumeros.push(numero);
        if (historialNumeros.length > 75) historialNumeros.shift(); // Mantener hasta 75 números

        // Mostrar los últimos dos números en la parte superior
        numerosPrevios.textContent = historialNumeros.slice(-3, -1).join(', ');
        
        // Aplicar la animación solo cuando se marca un nuevo número
        numeroGrande.textContent = numero;
        numeroGrande.style.animation = 'animarNumero 3s ease';
        // Quitar la animación después de que termine
        setTimeout(() => {
            numeroGrande.style.animation = 'none';
        }, 3000); // 3 segundos
    } else {
        numeroGrande.textContent = '';
    }
}

// Función para marcar un número aleatorio
function marcarAleatorio() {
    const todasCeldas = Array.from(document.querySelectorAll('td'));
    const celdasDisponibles = todasCeldas.filter(celda => !celda.classList.contains('highlight'));
    if (celdasDisponibles.length > 0) {
        const celdaAleatoria = celdasDisponibles[Math.floor(Math.random() * celdasDisponibles.length)];
        marcarCelda(celdaAleatoria);
    }
    // Volver el foco a la tabla
    bingoTable.focus();
}

// Función para iniciar el marcado automático
function iniciarMarcadoAutom() {
    detenerMarcado(); // Detener cualquier marcado automático en curso
    const velocidad = mapVelocidad(velocidadInput.value);
    marcadoAutomatico = setInterval(marcarAleatorio, velocidad);
    automaticoActivo = true;
    actualizarEstadoAutomatico();
    // Volver el foco a la tabla
    bingoTable.focus();
}

// Función para detener el marcado automático
function detenerMarcado() {
    if (marcadoAutomatico) {
        clearInterval(marcadoAutomatico);
        marcadoAutomatico = null;
        automaticoActivo = false;
        actualizarEstadoAutomatico();
    }
    // Volver el foco a la tabla
    bingoTable.focus();
}

// Función para resetear las celdas
function resetearCeldas() {
    document.querySelectorAll('td').forEach(celda => {
        celda.classList.remove('highlight');
        celda.style.color = 'white'; // Restablecer el color del número
    });
    numeroGrande.textContent = '';
    numerosPrevios.textContent = '';
    historialNumeros = []; // Borrar las jugadas previas
    detenerMarcado();
    // Volver el foco a la tabla
    bingoTable.focus();
}

// Función para eliminar la última jugada
function eliminarUltimaJugada() {
    if (historialNumeros.length > 0) {
        // Eliminar la última jugada del historial
        const numeroAEliminar = historialNumeros.pop();

        // Eliminar la celda correspondiente
        document.querySelectorAll('td').forEach(celda => {
            if (celda.textContent === numeroAEliminar) {
                celda.classList.remove('highlight');
                celda.style.color = 'white'; // Restablecer el color del número
            }
        });

        // Actualizar el número grande y los números previos
        if (historialNumeros.length > 0) {
            numeroGrande.textContent = historialNumeros[historialNumeros.length - 1];
        } else {
            numeroGrande.textContent = '';
        }
        numerosPrevios.textContent = historialNumeros.slice(-2).join(', ');
    }
    // Volver el foco a la tabla
    bingoTable.focus();
}

// Función para mapear el valor del control de velocidad
function mapVelocidad(valor) {
    const minVel = 20000; // Velocidad mínima en milisegundos
    const maxVel = 1; // Velocidad máxima en milisegundos
    return minVel - (valor * (minVel - maxVel) / 100);
}

// Función para actualizar el estado automático
function actualizarEstadoAutomatico() {
    if (automaticoActivo) {
        statusIndicator.classList.add('active');
    } else {
        statusIndicator.classList.remove('active');
    }
}

// Función para alternar el estado automático
function toggleMarcadoAutomatico() {
    if (automaticoActivo) {
        detenerMarcado();
    } else {
        iniciarMarcadoAutom();
    }
}

// Actualizar la velocidad del marcado automático en tiempo real
velocidadInput.addEventListener('input', function() {
    if (marcadoAutomatico) {
        detenerMarcado();
        iniciarMarcadoAutom();
    }
});

// Manejo de eventos del teclado
document.addEventListener('keydown', function(event) {
    if (event.key >= '0' && event.key <= '9') {
        // Agregar el número de la tecla presionada
        numeroTecla += event.key;
    } else if (event.key === 'Enter') {
        // Marcar el número cuando se presiona Enter
        marcarPorNumeroTecla();
        numeroTecla = ''; // Resetear el número
    }
});

// Función para marcar la celda según el número de la tecla
function marcarPorNumeroTecla() {
    const celdas = Array.from(document.querySelectorAll('td'));
    // Asegúrate de que el número sea válido
    const numero = parseInt(numeroTecla, 10);
    if (numero >= 1 && numero <= 75) {
        const celda = celdas.find(c => c.textContent === numero.toString());
        if (celda && !celda.classList.contains('highlight')) {
            marcarCelda(celda);
        }
    }
    // Volver el foco a la tabla
    bingoTable.focus();
}

// Funciones para el arrastre de los controles
const controls = document.getElementById('controls');

let isDragging = false;
let offsetX, offsetY;

controls.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - controls.getBoundingClientRect().left;
    offsetY = e.clientY - controls.getBoundingClientRect().top;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
});

function drag(e) {
    if (isDragging) {
        controls.style.left = `${e.clientX - offsetX}px`;
        controls.style.top = `${e.clientY - offsetY}px`;
    }
}

function stopDragging() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
}

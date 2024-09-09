const bingoTable = document.getElementById('bingo-table');
const numeroGrande = document.getElementById('numero-grande');
const numerosPrevios = document.getElementById('numeros-previos');
const velocidadInput = document.getElementById('velocidad');
const statusIndicator = document.getElementById('status-indicator');
let marcadoAutomatico = null;
let historialNumeros = [];
let automaticoActivo = false;
let numeroTecla = '';

let imgContainer = document.getElementById("contenedor-imagen");
let imgFlotante = document.getElementById("imagen-flotante");
let inputFile = document.getElementById("cargar-imagen");
let isResizing = false;

// Abrir el input de cargar imagen con clic derecho
function abrirCargarImagen(event) {
    event.preventDefault(); // Previene el men� contextual del clic derecho
    inputFile.click();
}



// Mover la imagen
imgContainer.addEventListener('mousedown', function(e) {
    let shiftX = e.clientX - imgContainer.getBoundingClientRect().left;
    let shiftY = e.clientY - imgContainer.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        imgContainer.style.left = pageX - shiftX + 'px';
        imgContainer.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    imgContainer.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        imgContainer.onmouseup = null;
    };
});

imgContainer.ondragstart = function() {
    return false;
};

// Cambiar el tama�o de la imagen
imgContainer.addEventListener('mousemove', function(e) {
    if (isResizing) {
        imgContainer.style.width = e.clientX - imgContainer.getBoundingClientRect().left + 'px';
        imgContainer.style.height = e.clientY - imgContainer.getBoundingClientRect().top + 'px';
    }
});

imgContainer.addEventListener('mousedown', function(e) {
    if (e.target === imgContainer) {
        isResizing = true;
    }
});

imgContainer.addEventListener('mouseup', function() {
    isResizing = false;
});

inputFile.addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            imgFlotante.src = e.target.result;
            imgFlotante.style.display = 'block'; // Mostrar imagen cargada
            imgContainer.style.border = 'none';  // Ocultar borde cuando la imagen est� presente
        };
        reader.readAsDataURL(file);
    }
});

// Funci�n para manejar el clic en una celda
bingoTable.addEventListener('click', function(event) {
    if (event.target.tagName === 'TD') {
        marcarCelda(event.target);
    }
});

// Funci�n para marcar una celda
function marcarCelda(celda) {
    if (!celda.classList.contains('highlight')) {
        celda.classList.add('highlight');
        celda.style.color = 'black'; // Cambiar el color del n�mero a negro
        actualizarNumeros(celda.textContent);
    }
}

// Actualiza los n�meros mostrados (�ltimos 2 n�meros y el n�mero grande)
function actualizarNumeros(numero) {
    if (numero) {
        historialNumeros.push(numero);
        if (historialNumeros.length > 75) historialNumeros.shift(); // Mantener hasta 75 n�meros

        // Mostrar los �ltimos dos n�meros en la parte superior
        numerosPrevios.textContent = historialNumeros.slice(-3, -1).join(', ');

        // Obtener la letra correspondiente
        const letra = obtenerLetra(parseInt(numero));

        // Aplicar la animaci�n solo cuando se marca un nuevo n�mero
        numeroGrande.textContent = letra + " " + numero; // Concatenar letra y n�mero
        numeroGrande.style.animation = 'animarNumero 3s ease';
        
        // Quitar la animaci�n despu�s de que termine
        setTimeout(() => {
            numeroGrande.style.animation = 'none';
        }, 3000); // 3 segundos
    } else {
        numeroGrande.textContent = '';
    }
}


// Funci�n para obtener la letra correspondiente seg�n el n�mero
function obtenerLetra(numero) {
    if (numero >= 1 && numero <= 15) {
        return 'B';
    } else if (numero >= 16 && numero <= 30) {
        return 'I';
    } else if (numero >= 31 && numero <= 45) {
        return 'N';
    } else if (numero >= 46 && numero <= 60) {
        return 'G';
    } else if (numero >= 61 && numero <= 75) {
        return 'O';
    }
    return ''; // Retorna una cadena vac�a si el n�mero no est� en el rango v�lido
}
// Funci�n para marcar un n�mero aleatorio
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

// Funci�n para iniciar el marcado autom�tico
function iniciarMarcadoAutom() {
    detenerMarcado(); // Detener cualquier marcado autom�tico en curso
    const velocidad = mapVelocidad(velocidadInput.value);
    marcadoAutomatico = setInterval(marcarAleatorio, velocidad);
    automaticoActivo = true;
    actualizarEstadoAutomatico();
    // Volver el foco a la tabla
    bingoTable.focus();
}

// Funci�n para detener el marcado autom�tico
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

// Funci�n para resetear las celdas
function resetearCeldas() {
    document.querySelectorAll('td').forEach(celda => {
        celda.classList.remove('highlight');
        celda.style.color = 'white'; // Restablecer el color del n�mero
    });
    numeroGrande.textContent = '';
    numerosPrevios.textContent = '';
    historialNumeros = []; // Borrar las jugadas previas
    detenerMarcado();
    // Volver el foco a la tabla
    bingoTable.focus();
}

// Funci�n para eliminar la �ltima jugada
function eliminarUltimaJugada() {
    if (historialNumeros.length > 0) {
        // Eliminar la �ltima jugada del historial
        const numeroAEliminar = historialNumeros.pop();

        // Eliminar la celda correspondiente
        document.querySelectorAll('td').forEach(celda => {
            if (celda.textContent === numeroAEliminar) {
                celda.classList.remove('highlight');
                celda.style.color = 'white'; // Restablecer el color del n�mero
            }
        });

        // Actualizar el n�mero grande y los n�meros previos
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

// Funci�n para mapear el valor del control de velocidad
function mapVelocidad(valor) {
    const minVel = 20000; // Velocidad m�nima en milisegundos
    const maxVel = 1; // Velocidad m�xima en milisegundos
    return minVel - (valor * (minVel - maxVel) / 100);
}

// Funci�n para actualizar el estado autom�tico
function actualizarEstadoAutomatico() {
    if (automaticoActivo) {
        statusIndicator.classList.add('active');
    } else {
        statusIndicator.classList.remove('active');
    }
}

// Funci�n para alternar el estado autom�tico
function toggleMarcadoAutomatico() {
    if (automaticoActivo) {
        detenerMarcado();
    } else {
        iniciarMarcadoAutom();
    }
}

// Actualizar la velocidad del marcado autom�tico en tiempo real
velocidadInput.addEventListener('input', function() {
    if (marcadoAutomatico) {
        detenerMarcado();
        iniciarMarcadoAutom();
    }
});

// Manejo de eventos del teclado
document.addEventListener('keydown', function(event) {
    if (event.key >= '0' && event.key <= '9') {
        // Agregar el n�mero de la tecla presionada
        numeroTecla += event.key;
    } else if (event.key === 'Enter') {
        // Marcar el n�mero cuando se presiona Enter
        marcarPorNumeroTecla();
        numeroTecla = ''; // Resetear el n�mero
    }
});

// Funci�n para marcar la celda seg�n el n�mero de la tecla
function marcarPorNumeroTecla() {
    const celdas = Array.from(document.querySelectorAll('td'));
    // Aseg�rate de que el n�mero sea v�lido
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

// ============================================================
// REFERENCIAS AL DOM - Elementos HTML que vamos a manipular
// ============================================================
// Guardamos referencias a los elementos principales para
// no tener que buscarlos en el DOM cada vez que los necesitamos
const paletteSizeSelect = document.getElementById('paletteSize');
const formatTypeSelect  = document.getElementById('formatType');
const generateBtn       = document.getElementById('generateBtn');
const paletteDisplay    = document.getElementById('paletteDisplay');
const toast             = document.getElementById('toast');
const feedbackSection   = document.getElementById('feedback');
const feedbackText      = document.getElementById('feedbackText');

// ============================================================
// FUNCIONES DE UTILIDAD - Conversión de colores
// ============================================================

/**
 * Genera un color HEX aleatorio
 * 
 * Un color HEX tiene el formato: #RRGGBB
 * Donde RR, GG, BB son valores hexadecimales (0-9, A-F)
 * Ejemplo: #FF5733 es un naranja
 * 
 * @returns {string} Color en formato HEX, ej: "#A3F2C1"
 */
function randomHex() {
    // 0xFFFFFF es el número máximo en hexadecimal (16777215 en decimal)
    // Math.random() da un número entre 0 y 1
    // Math.floor() lo redondea hacia abajo
    // .toString(16) convierte el número a hexadecimal
    // .padStart(6, '0') agrega ceros a la izquierda si hace falta
    // Ejemplo: si sale "1a2", lo convierte en "0001a2"
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
}

/**
 * Convierte un color HEX a formato HSL
 * 
 * HSL = Hue (tono), Saturation (saturación), Lightness (luminosidad)
 * Es otra forma de representar colores que a veces es más intuitiva
 * Ejemplo: hsl(120, 50%, 60%) → un verde medio
 * 
 * @param {string} hex - Color en formato HEX, ej: "#FF5733"
 * @returns {string} Color en formato HSL, ej: "hsl(9, 100%, 50%)"
 */
function getHslFromHex(hex) {
    // Extraemos los canales RGB del HEX
    // slice(1,3) toma caracteres desde índice 1 hasta antes del 3
    // parseInt(..., 16) interpreta como hexadecimal
    // / 255 normaliza a escala 0-1 (necesaria para cálculos HSL)
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    // Encontramos el valor máximo y mínimo de los tres canales
    // Estos valores son cruciales para calcular HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    // La luminosidad es el promedio entre max y min
    let l = (max + min) / 2;

    // Inicializamos hue (tono) y saturation (saturación)
    let h, s;

    // Si max === min, el color es un gris (sin color real)
    if (max === min) {
        h = s = 0;
    } else {
        // La diferencia entre max y min nos dice "cuánto color" tiene
        const d = max - min;
        
        // La saturación se calcula diferente según sea color claro u oscuro
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        // El tono depende de cuál canal (R, G, B) es el mayor
        // Cada canal tiene una posición fija en el círculo de color
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;  // Rojo
            case g: h = (b - r) / d + 2; break;                 // Verde
            case b: h = (r - g) / d + 4; break;                 // Azul
        }
        h /= 6;  // Normaliza a escala 0-1
    }
    
    // Convertimos a formato CSS y redondeamos
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}


// ============================================================
// FUNCIÓN PRINCIPAL - Generar la paleta de colores
// ============================================================
/**
 * Crea y muestra una paleta de colores aleatorios
 * 
 * Esta funcion hace cuatro cosas:
 * 1. Lee qué cantidad de colores eligió el usuario
 * 2. Lee qué formato prefiere (HEX o HSL)
 * 3. Limpia la paleta anterior
 * 4. Genera tarjetas de color nuevas
 */

function generatePalette() {
    // Leemos la cantidad de colores que el usuario eligió en el select
    const size = parseInt(paletteSizeSelect.value);
    
    // Leemos el formato elegido (hex o hsl)
    const format = formatTypeSelect.value;
    
    // Limpiamos el contenedor para empezar de cero
    paletteDisplay.innerHTML = '';

    // Generamos una tarjeta por cada color
    for (let i = 0; i < size; i++) {
        // Generamos un color HEX aleatorio
        const hexColor = randomHex();
        
        // Decidimos qué mostrar según el formato elegido
        // Si es 'hex' mostramos #RRGGBB, si no mostramos hsl(...)
        const displayText = (format === 'hex') ? hexColor.toUpperCase() : getHslFromHex(hexColor);

        const color = { texto: displayText };              // objeto para el toast de copia

        // Creamos el contenedor principal de la tarjeta (div.swatch-column)
        const column = document.createElement('div');
        column.className = 'swatch-column';

        // Creamos la parte de información: código + mini preview + icono copiar
        const middle = document.createElement('div');
        middle.className = 'swatch-middle';
        // innerHTML nos permite insertar HTML con plantilla de string
        middle.innerHTML = `
            <span class="color-code-text">${displayText}</span>
            <div class="color-preview-mini" style="background-color: ${hexColor}"></div>
        `;

        // Creamos el arco de color (la parte visual grande)
        const arch = document.createElement('div');
        arch.className = 'swatch-arch';
        // style.backgroundColor aplica CSS directamente desde JavaScript
        arch.style.backgroundColor = hexColor;

        // Agregamos el evento de clic para copiar el color
        arch.addEventListener('click', () => {
            // navigator.clipboard.writeText() copia al portapapeles
            // .then() espera a que se complete y luego ejecuta el siguiente código
            navigator.clipboard.writeText(displayText).then(() => {
                // Mostramos un toast con confirmación
                 mostrarToast("📋 Copiado: " + color.texto, "copia");   // ← toast copia
            });
        });

        // Ensamblamos la tarjeta: arco + información
        // appendChild agrega elementos dentro de otro
        column.appendChild(arch);
        column.appendChild(middle);
        
        // Finalmente, agregamos la tarjeta completa a la paleta
        paletteDisplay.appendChild(column);
    }
   
     mostrarToast("¡Paleta generada con éxito!", "exito");           // ← toast éxito
}

// ============================================================
// FUNCIÓN DE UI - Mostrar notificaciones
// ============================================================
/**
 * Muestra un "toast" (notificación temporal)
 * 
 * Un toast es ese pequeño mensaje que aparece unos segundos
 * y desaparece solo. Es mucho más amigable que un alert().
 * 
 * @param {string} msg - Mensaje a mostrar
 * @param {string} tipo - Tipo de toast (info, copia, exito)
 */
function mostrarToast(msg, tipo="info") {
    // Ponemos el texto que queremos mostrar
    toast.textContent = msg;
    
    // Agregamos la clase 'show' que lo hace visible (opacity: 1 en CSS)
    toast.classList.add('show', 'toast-exito', 'toast-copia', 'toast-info');
    
    toast.classList.add('toast-' + tipo);
    
    void toast.offsetWidth

    setTimeout(() => {
        toast.classList.remove('show', `toast-${tipo}`);
    }, 2500);
}

// ============================================================
// EVENTOS - Conectar acciones del usuario con funciones
// ============================================================

// Cuando el usuario hace clic en "Generar paleta", ejecutamos la función
generateBtn.addEventListener('click', generatePalette);

// Toast cuando cambia el formato
formatTypeSelect.addEventListener('change', () => {
    const boton = formatTypeSelect.options[formatTypeSelect.selectedIndex];
    mostrarToast("Formato cambiado a " + boton.textContent, "info");
});

// Toast cuando cambia la cantidad
paletteSizeSelect.addEventListener('change', () => {
    const cantidadColores = paletteSizeSelect.value;
    mostrarToast("Mostrando " + cantidadColores + " colores", "info");
});

// Generamos una paleta inicial apenas carga la página
// Así no aparece vacía cuando el usuario entra
window.addEventListener('DOMContentLoaded', generatePalette);
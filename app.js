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

// Array global para guardar los colores HEX generados
// Así podemos reutilizarlos al cambiar de formato sin generar nuevos
let coloresActuales = [];


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
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    let l = (max + min) / 2;
    let h, s;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}


// ============================================================
// FUNCIÓN PRINCIPAL - Generar la paleta de colores
// ============================================================
/**
 * Genera colores HEX nuevos, los guarda en coloresActuales
 * y llama a renderPaleta() para mostrarlos
 */
function generatePalette() {
    const size = parseInt(paletteSizeSelect.value);

    // Generamos los colores HEX y los guardamos en el array global
    coloresActuales = [];
    for (let i = 0; i < size; i++) {
        coloresActuales.push(randomHex());
    }

    renderPaleta();
    mostrarToast("✅ ¡Paleta generada con éxito!", "exito");
}


// ============================================================
// FUNCIÓN DE RENDER - Mostrar los colores en el formato elegido
// ============================================================
/**
 * Toma los colores guardados en coloresActuales y los renderiza
 * en el formato actual (HEX o HSL) sin generar colores nuevos
 */
function renderPaleta() {
    const format = formatTypeSelect.value;

    // Limpiamos el contenedor para empezar de cero
    paletteDisplay.innerHTML = '';

    coloresActuales.forEach(hexColor => {
        // Decidimos qué mostrar según el formato elegido
        const displayText = (format === 'hex') ? hexColor.toUpperCase() : getHslFromHex(hexColor);

        const color = { texto: displayText };

        // Creamos el contenedor principal de la tarjeta
        const column = document.createElement('div');
        column.className = 'swatch-column';

        // Creamos la parte de información: código + mini preview
        const middle = document.createElement('div');
        middle.className = 'swatch-middle';
        middle.innerHTML = `
            <span class="color-code-text">${displayText}</span>
            <div class="color-preview-mini" style="background-color: ${hexColor}"></div>
        `;

        // Creamos el arco de color (la parte visual grande)
        const arch = document.createElement('div');
        arch.className = 'swatch-arch';
        arch.style.backgroundColor = hexColor;

        // Clic para copiar el color al portapapeles
        arch.addEventListener('click', () => {
            navigator.clipboard.writeText(displayText).then(() => {
                mostrarToast("📋 Copiado: " + color.texto, "copia");
            });
        });

        column.appendChild(arch);
        column.appendChild(middle);
        paletteDisplay.appendChild(column);
    });
}


// ============================================================
// FUNCIÓN DE UI - Mostrar notificaciones
// ============================================================
/**
 * Muestra un "toast" (notificación temporal)
 * 
 * @param {string} msg  - Mensaje a mostrar
 * @param {string} tipo - Tipo visual: "info" | "exito" | "copia"
 */
function mostrarToast(msg, tipo = "info") {
    toast.textContent = msg;

    // Limpiamos clases anteriores para evitar superposición de estilos
    toast.classList.remove('show', 'toast-info', 'toast-exito', 'toast-copia');

    // Forzamos reflow para reiniciar la animación si ya había un toast visible
    void toast.offsetWidth;

    toast.classList.add('show', 'toast-' + tipo);

    setTimeout(() => {
        toast.classList.remove('show', 'toast-' + tipo);
    }, 2500);
}


// ============================================================
// EVENTOS - Conectar acciones del usuario con funciones
// ============================================================

// Botón generar → crea colores nuevos
generateBtn.addEventListener('click', generatePalette);

// Cambio de formato → mismos colores, distinto formato
formatTypeSelect.addEventListener('change', () => {
    const boton = formatTypeSelect.options[formatTypeSelect.selectedIndex];
    mostrarToast("🎨 Formato cambiado a " + boton.textContent, "info");
    renderPaleta();
});

// Cambio de cantidad → genera colores nuevos
paletteSizeSelect.addEventListener('change', () => {
    const cantidadColores = paletteSizeSelect.value;
    mostrarToast("📐 Mostrando " + cantidadColores + " colores", "info");
    generatePalette();
});

// Generamos una paleta inicial apenas carga la página
window.addEventListener('DOMContentLoaded', generatePalette);
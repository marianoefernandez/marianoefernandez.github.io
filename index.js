// ===========================
//  REFERENCIAS AL DOM
// ===========================
const display = document.getElementById('result');
const exprEl  = document.getElementById('expr');

// ===========================
//  ESTADO DE LA CALCULADORA
// ===========================
let current  = '0';   // número que se está ingresando
let prev     = null;  // número previo (antes del operador)
let operator = null;  // operador activo: '+' | '-' | '*' | '/'
let justCalc = false; // flag: se acaba de calcular un resultado
let fullExpr = '';    // expresión mostrada arriba del display

// Símbolos visuales para cada operador
const opSymbol = { '+': '+', '-': '−', '*': '×', '/': '÷' };

// ===========================
//  FUNCIONES DE DISPLAY
// ===========================

/**
 * Actualiza el display principal con el valor dado.
 * Ajusta el tamaño de fuente según la longitud del número.
 * @param {string|number} val    - Valor a mostrar
 * @param {boolean}       isError - Si es true, aplica estilo de error
 */
function updateDisplay(val, isError = false) {
  display.textContent = val;
  display.classList.toggle('error', isError);

  const len = String(val).replace('-', '').length;
  if      (len > 12) display.style.fontSize = '20px';
  else if (len > 9)  display.style.fontSize = '26px';
  else if (len > 6)  display.style.fontSize = '30px';
  else               display.style.fontSize = '36px';
}

// ===========================
//  FUNCIONES DE LÓGICA
// ===========================

/**
 * Agrega un dígito o el punto decimal al número actual.
 * @param {string} val - Dígito ('0'–'9') o punto ('.')
 */
function handleNum(val) {
  if (justCalc) {
    // Después de un resultado, empieza un número nuevo
    current  = val;
    fullExpr = '';
    justCalc = false;
  } else if (current === '0' && val !== '.') {
    current = val;                     // reemplaza el cero inicial
  } else if (val === '.' && current.includes('.')) {
    return;                            // evita doble punto decimal
  } else {
    current += val;
  }

  updateDisplay(current);
}

/**
 * Registra un operador y guarda el número actual como operando previo.
 * Si ya había un operador pendiente, calcula primero (chained operations).
 * @param {string} op - Operador: '+' | '-' | '*' | '/'
 */
function handleOp(op) {
  if (prev !== null && !justCalc) {
    calculate(false); // operación encadenada sin mostrar "="
  }

  prev     = parseFloat(current);
  operator = op;
  fullExpr = prev + ' ' + opSymbol[op];

  exprEl.textContent = fullExpr;
  justCalc = true;
}

/**
 * Ejecuta la operación entre prev y current.
 * @param {boolean} final - Si es true, cierra la operación y resetea el estado.
 *                          Si es false, es un cálculo intermedio (encadenado).
 */
function calculate(final = true) {
  if (prev === null || operator === null) return;

  const a = prev;
  const b = parseFloat(current);
  let res;

  // Manejo de división por cero
  if (operator === '/' && b === 0) {
    updateDisplay('ERR / 0', true);
    exprEl.textContent = '';
    prev     = null;
    operator = null;
    justCalc = true;
    return;
  }

  // Cálculo según operador
  if (operator === '+') res = a + b;
  if (operator === '-') res = a - b;
  if (operator === '*') res = a * b;
  if (operator === '/') res = a / b;

  // Corrige imprecisión de punto flotante (ej: 0.1 + 0.2)
  res = parseFloat(res.toPrecision(12));

  if (final) {
    exprEl.textContent = `${fullExpr} ${b} =`;
  }

  current = String(res);
  updateDisplay(current);

  if (final) {
    prev     = null;
    operator = null;
    justCalc = true;
  }
}

/**
 * Limpia completamente el estado de la calculadora (AC).
 */
function handleClear() {
  current  = '0';
  prev     = null;
  operator = null;
  justCalc = false;
  fullExpr = '';

  updateDisplay('0');
  exprEl.textContent = '';
}

/**
 * Invierte el signo del número actual (+/−).
 */
function handleSign() {
  current = String(parseFloat(current) * -1);
  updateDisplay(current);
}

/**
 * Convierte el número actual a porcentaje (÷ 100).
 */
function handlePercent() {
  current = String(parseFloat(current) / 100);
  updateDisplay(current);
}

// ===========================
//  DISPATCHER DE ACCIONES
// ===========================

/**
 * Recibe una acción y el valor opcional, y llama a la función correspondiente.
 * @param {string} action - Acción del botón (data-action)
 * @param {string} val    - Valor asociado (data-val), si aplica
 */
function dispatch(action, val) {
  switch (action) {
    case 'num':     handleNum(val);    break;
    case 'decimal': handleNum('.');    break;
    case 'op':      handleOp(val);     break;
    case 'equals':  calculate();       break;
    case 'clear':   handleClear();     break;
    case 'sign':    handleSign();      break;
    case 'percent': handlePercent();   break;
  }
}

// ===========================
//  EVENTOS DE BOTONES
// ===========================
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    // Animación de pulso al hacer click
    btn.classList.remove('pulse');
    void btn.offsetWidth; // fuerza reflow para reiniciar la animación
    btn.classList.add('pulse');

    dispatch(btn.dataset.action, btn.dataset.val);
  });
});

// ===========================
//  SOPORTE DE TECLADO
// ===========================
document.addEventListener('keydown', e => {
  if ('0123456789'.includes(e.key))          dispatch('num', e.key);
  else if (e.key === '.')                    dispatch('decimal');
  else if (e.key === '+')                    dispatch('op', '+');
  else if (e.key === '-')                    dispatch('op', '-');
  else if (e.key === '*')                    dispatch('op', '*');
  else if (e.key === '/') { e.preventDefault(); dispatch('op', '/'); }
  else if (e.key === 'Enter' || e.key === '=') dispatch('equals');
  else if (e.key === 'Escape' || e.key === 'Delete') dispatch('clear');
  else if (e.key === '%')                    dispatch('percent');
});
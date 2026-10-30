/* =========================================================================
   GUARDIANES DEL PLANETA · Videojuego educativo 2D (Proyecto STEAM, grado 11)
   Autores: Cristian López y Juan Noriega

   Tecnología (sección 16 del documento):
     - HTML (index.html): estructura de las pantallas.
     - CSS (style.css): colores, botones y diseño.
     - JavaScript con p5.js (este archivo): movimiento, puntuación y reglas.
   p5.js está guardado en libreria/ para que el juego funcione sin internet.

   Contenido de este archivo:
      1. Reglas del juego (y extras que no están en el documento)
      2. Niveles, canecas, residuos, preguntas y personajes
      3. Variables del juego
      4. p5.js: setup() y draw()
      5. Lógica: niveles, movimiento, recoger y clasificar
      6. Fin del juego y medallas
      7. Marcador y pantallas (HTML)
      8. Dibujo del escenario (una sola vez por nivel)
      9. Dibujo de lo que se mueve (cada cuadro)
     10. Dibujo de residuos y del personaje
     11. Efectos y sonidos
     12. Controles: teclado, ratón, pantalla táctil y botones
     13. Funciones de ayuda
   ========================================================================= */


/* ===== 1. REGLAS DEL JUEGO (sección 7 del documento) ===== */

const PUNTOS_INICIALES = 0;     // Regla 1: el jugador comienza con cero puntos.
const PUNTOS_POR_ACIERTO = 10;  // Regla 2: cada residuo correcto vale 10 puntos.
const PUNTOS_POR_ERROR = 5;     // Regla 3: cada residuo mal clasificado resta 5 puntos.
const TIEMPO_TOTAL = 60;        // Regla 4: 60 segundos para completar el reto.
const META_PUNTOS = 100;        // Regla 5: gana al alcanzar 100 puntos antes de que termine el tiempo.

// Medidas del escenario y del personaje
const ANCHO = 1040;
const ALTO = 585;
const VELOCIDAD_JUGADOR = 340;                 // píxeles por segundo
const INICIO_JUGADOR = { x: 535, y: 330 };
const LIMITES = { izquierda: 30, derecha: 1012, arriba: 240, abajo: 552 };  // zona por donde camina el personaje
const DISTANCIA_PARA_RECOGER = 75;
const DISTANCIA_PARA_DEPOSITAR = 95;
const Y_DEPOSITO = 240;                    // altura a la que el personaje se para frente a las canecas
const LAGO = { x: 201, y: 467, radioX: 174, radioY: 70 };  // lago del nivel 3

// Extras: mejoras que agregamos además de lo que pide el documento.
const RACHA_PARA_BONO = 3;          // cada 3 aciertos seguidos sin errores...
const PUNTOS_BONO_RACHA = 5;        // ...dan 5 puntos extra
const SEGUNDOS_BONO_PREGUNTA = 5;   // acertar la pregunta rápida entre niveles regala 5 segundos


/* ===== 2. NIVELES, CANECAS Y RESIDUOS ===== */

// Tres niveles: fácil, intermedio y difícil (sección 15 del documento).
const NIVELES = [
  {
    nombre: 'Fácil', zona: 'El sendero', cantidad: 4,
    canecaIlumina: true, nombresVisibles: true, viento: false,
    tituloLimpio: '¡El sendero quedó impecable!',
    textoLimpio: '¡Lo estás haciendo genial! Ahora la zona de picnic necesita tu ayuda.'
  },
  {
    nombre: 'Intermedio', zona: 'La zona de picnic', cantidad: 5,
    canecaIlumina: false, nombresVisibles: true, viento: false,
    novedad: '5 residuos y las canecas ya no se iluminan: ¡tú decides dónde va cada uno!',
    tituloLimpio: '¡La zona de picnic quedó limpia!',
    textoLimpio: '¡Casi lo logras! Falta limpiar el rincón del lago.'
  },
  {
    nombre: 'Difícil', zona: 'El rincón del lago', cantidad: 6,
    canecaIlumina: false, nombresVisibles: false, viento: true,
    novedad: '6 residuos que suelen confundir, el viento los mueve y su nombre solo aparece cuando te acercas.'
  }
];
const TOTAL_RESIDUOS = NIVELES.reduce((suma, n) => suma + n.cantidad, 0);  // 15

// Canecas de la zona de reciclaje (escenario 2 del documento).
const CANECAS = [
  { tipo: 'papel',    nombre: 'PAPEL',     x: 696, color: '#3f8fd2', oscuro: '#235c90' },
  { tipo: 'plastico', nombre: 'PLÁSTICO',  x: 825, color: '#f2b632', oscuro: '#a8770f' },
  { tipo: 'organico', nombre: 'ORGÁNICOS', x: 954, color: '#4caf68', oscuro: '#2a7643' }
];
const TIPO_EN_TEXTO = { papel: 'de papel', plastico: 'de plástico', organico: 'orgánico' };

// Cada residuo tiene: nombre, tipo (su caneca), dibujo, nivel en el que aparece y un dato para aprender.
const RESIDUOS = [
  // Nivel 1 · Fácil
  { nombre: 'Hoja de papel',      tipo: 'papel',    dibujo: 'hoja',      nivel: 1, dato: 'El papel limpio se puede reciclar varias veces.' },
  { nombre: 'Periódico',          tipo: 'papel',    dibujo: 'periodico', nivel: 1, dato: 'Con papel reciclado se fabrican cuadernos y cajas nuevas.' },
  { nombre: 'Botella plástica',   tipo: 'plastico', dibujo: 'botella',   nivel: 1, dato: 'Vacía y aplasta la botella antes de reciclarla.' },
  { nombre: 'Vaso plástico',      tipo: 'plastico', dibujo: 'vaso',      nivel: 1, dato: 'Un vaso plástico puede tardar cientos de años en degradarse.' },
  { nombre: 'Cáscara de banano',  tipo: 'organico', dibujo: 'banano',    nivel: 1, dato: 'Las cáscaras se convierten en abono para las plantas.' },
  { nombre: 'Restos de manzana',  tipo: 'organico', dibujo: 'manzana',   nivel: 1, dato: 'Los restos de fruta sirven para hacer compost.' },
  // Nivel 2 · Intermedio
  { nombre: 'Caja de cartón',     tipo: 'papel',    dibujo: 'caja',      nivel: 2, dato: 'El cartón va con el papel. Aplástalo para que ocupe menos espacio.' },
  { nombre: 'Sobre de carta',     tipo: 'papel',    dibujo: 'sobre',     nivel: 2, dato: 'Los sobres de papel también se reciclan.' },
  { nombre: 'Bolsa plástica',     tipo: 'plastico', dibujo: 'bolsa',     nivel: 2, dato: 'Mejor aún: reutiliza las bolsas o usa bolsas de tela.' },
  { nombre: 'Cuchara plástica',   tipo: 'plastico', dibujo: 'cuchara',   nivel: 2, dato: 'Los cubiertos desechables son de plástico: evita usarlos.' },
  { nombre: 'Cáscara de naranja', tipo: 'organico', dibujo: 'naranja',   nivel: 2, dato: 'Más de la mitad de la basura de los hogares es orgánica.' },
  { nombre: 'Restos de pan',      tipo: 'organico', dibujo: 'pan',       nivel: 2, dato: 'Los restos de comida son orgánicos y se pueden compostar.' },
  // Nivel 3 · Difícil (residuos que suelen confundir)
  { nombre: 'Cartón de huevos',   tipo: 'papel',    dibujo: 'cartonHuevos', nivel: 3, dato: 'Está hecho de papel prensado, por eso va con el papel.' },
  { nombre: 'Tubo de cartón',     tipo: 'papel',    dibujo: 'tubo',      nivel: 3, dato: 'El tubo del papel higiénico es cartón: va con el papel.' },
  { nombre: 'Tapa de botella',    tipo: 'plastico', dibujo: 'tapa',      nivel: 3, dato: 'Aunque es pequeña, la tapa también es plástico.' },
  { nombre: 'Envase de yogur',    tipo: 'plastico', dibujo: 'yogur',     nivel: 3, dato: 'Enjuaga los envases: limpios y secos se reciclan mejor.' },
  { nombre: 'Cáscara de huevo',   tipo: 'organico', dibujo: 'huevo',     nivel: 3, dato: 'Aunque es dura, la cáscara de huevo es orgánica y sirve de abono.' },
  { nombre: 'Hojas secas',        tipo: 'organico', dibujo: 'hojas',     nivel: 3, dato: 'Las hojas secas del parque también son orgánicas.' }
];

// Extra: pregunta rápida entre niveles, con residuos que no aparecen en el parque.
const PREGUNTAS = [
  { nombre: 'una revista vieja',      tipo: 'papel',    dato: 'Las revistas y los cuadernos viejos van con el papel.' },
  { nombre: 'una caja de cereal',     tipo: 'papel',    dato: 'Las cajas de cartón delgado también son papel.' },
  { nombre: 'un tarro de champú',     tipo: 'plastico', dato: 'Los envases de aseo son plástico: enjuágalos antes de reciclarlos.' },
  { nombre: 'un tarro de detergente', tipo: 'plastico', dato: 'Los tarros de detergente son plástico aprovechable.' },
  { nombre: 'una cáscara de papa',    tipo: 'organico', dato: 'Las cáscaras de verduras van con los orgánicos.' },
  { nombre: 'la borra del café',      tipo: 'organico', dato: 'El café usado es un gran abono para las plantas.' }
];

// Extra: personajes que se pueden elegir. Cristian y Juan usan la foto de su cara;
// Eco es el personaje del documento (sección 9) y se dibuja completo con código.
const PERSONAJES = [
  {
    id: 'cristian', nombre: 'Cristian', nombreCompleto: 'Cristian López', descripcion: 'Estudiante guardián',
    retrato: 'assets/personajes/cristian-retrato.jpg', imagen: cargarImagen('assets/personajes/cristian-cara.png'),
    estilo: 'polo', mangaCorta: true,
    piel: '#a8724e', sombraPiel: '#7e5236', camisa: '#f5f7f4', sombraCamisa: '#c3ccc7', cuello: '#f5f7f4',
    pantalon: '#6f96c8', sombraPantalon: '#4f74a5', zapatos: '#1d2124', suela: '#3a4046'
  },
  {
    id: 'juan', nombre: 'Juan', nombreCompleto: 'Juan Noriega', descripcion: 'Estudiante guardián',
    retrato: 'assets/personajes/juan-retrato.jpg', imagen: cargarImagen('assets/personajes/juan-cara.png'),
    estilo: 'uniforme', mangaCorta: true,
    piel: '#c89068', sombraPiel: '#9c6a48', camisa: '#eef1f6', sombraCamisa: '#bcc4d0', cuello: '#1f2a44',
    pantalon: '#1f2a44', sombraPantalon: '#141c30', zapatos: '#22252a', suela: '#e8e8e8'
  },
  {
    id: 'eco', nombre: 'Eco', nombreCompleto: 'Eco', descripcion: 'Personaje del documento',
    retrato: 'assets/personajes/eco-retrato.jpg', imagen: null,
    estilo: 'chaqueta', mangaCorta: false,
    piel: '#e7ad88', sombraPiel: '#ad7858', camisa: '#e99e45', sombraCamisa: '#9d693e', cuello: '#3d9a75',
    pantalon: '#243e43', sombraPantalon: '#1c3236', zapatos: '#f3e3c3', suela: '#94775a'
  }
];


/* ===== 3. VARIABLES DEL JUEGO (sección 19 del documento) ===== */

let puntos = PUNTOS_INICIALES;  // guarda el puntaje
let tiempo = TIEMPO_TOTAL;      // segundos que quedan
let jugadorX = INICIO_JUGADOR.x;    // posición horizontal del personaje
let jugadorY = INICIO_JUGADOR.y;    // posición vertical del personaje

let nivel = 1;                  // nivel actual: 1, 2 o 3
let estado = 'inicio';          // 'inicio', 'jugando', 'pausa', 'entreNiveles', 'celebrando' o 'final'
let residuos = [];              // residuos que siguen en el suelo
let residuoCargado = null;      // residuo que el personaje lleva en la mochila
let aciertos = 0;               // residuos bien clasificados
let errores = 0;                // residuos mal clasificados
let paraRepasar = [];           // residuos en los que se equivocó (se muestran al final)
let metaAlcanzada = false;      // se vuelve true al llegar a 100 puntos
let parqueRecuperado = false;   // se vuelve true al limpiar los 3 niveles (escenario 3: parque limpio)

// Extras
let personajeElegido = leerGuardado('guardianes-personaje') || 'cristian';
let racha = 0;                  // aciertos seguidos sin equivocarse
let preguntas = [];             // preguntas rápidas de esta partida (en orden aleatorio)
let preguntaActual = null;
let origenSeleccion = 'inicio'; // pantalla a la que vuelve "Volver" desde la elección de personaje

let destino = null;             // lugar al que camina el personaje cuando se toca la pantalla
let jugadorCamina = false;
let jugadorMiraA = 1;               // 1 = derecha, -1 = izquierda
let pasoJugador = 0;                // avance de la animación de caminar
let residuoSenalado = null;     // residuo que está bajo el puntero del ratón
const flechasTactiles = new Set();  // flechas presionadas en los controles táctiles

let lienzo;                     // canvas creado por p5.js
let pantalla;                   // el dibujo principal de p5 (lo usan las funciones de ayuda)
let fondoNivel;                 // imagen del escenario del nivel actual
let reloj = 0;                  // segundos desde que se abrió la página (para animaciones)
let escalaTexto = 1;            // agranda los textos del lienzo en pantallas pequeñas
let esPantallaTactil = false;
let particulas = [];
let sonidoActivo = true;
let contextoAudio = null;
let origenInstrucciones = 'inicio';
let temporizadorAviso = null;
let temporizadorCelebracion = null;
let tiempoMostrado = '';
let esperaPaso = 0;
let esperaPajaro = 0;

// Flores del parque: aparecen poco a poco a medida que se limpia.
const FLORES = Array.from({ length: 40 }, (_, i) => ({
  x: azar(i * 6.13 + 4) * ANCHO,
  y: 258 + azar(i * 3.7) * 300,
  color: ['#ffdea3', '#f8c9cd', '#e4d5ff', '#fff3b3'][i % 4],
  escala: 0.5 + azar(i) * 0.55,
  aparece: i / 40               // porcentaje de limpieza necesario para que aparezca
}));


/* ===== 4. p5.js: setup() se ejecuta una vez y draw() 60 veces por segundo ===== */

function setup() {
  lienzo = createCanvas(ANCHO, ALTO);
  lienzo.parent('contenedorJuego');
  lienzo.elt.setAttribute('aria-label', 'Parque del juego. Muévete con las flechas o W A S D, o toca el suelo. E o espacio recoge y deposita.');
  pantalla = p5.instance;
  strokeJoin(ROUND);
  textFont('sans-serif');
  esPantallaTactil = window.matchMedia('(pointer: coarse)').matches;
  if (!PERSONAJES.some(p => p.id === personajeElegido)) personajeElegido = 'cristian';

  prepararNivel(1);
  crearTarjetasPersonajes();
  conectarControles();
  mostrarRecord();
  actualizarMarcador();
}

function draw() {
  const dt = min(deltaTime / 1000, 0.06);  // segundos desde el cuadro anterior
  reloj += dt;
  escalaTexto = constrain((ANCHO / lienzo.elt.clientWidth) * 0.7, 1, 1.9);

  if (estado === 'jugando') actualizarJuego(dt);
  actualizarParticulas(dt);
  dibujarEscena();
}


/* ===== 5. LÓGICA: NIVELES, MOVIMIENTO, RECOGER Y CLASIFICAR ===== */

function iniciarJuego() {
  clearTimeout(temporizadorCelebracion);
  puntos = PUNTOS_INICIALES;
  tiempo = TIEMPO_TOTAL;
  aciertos = 0;
  errores = 0;
  paraRepasar = [];
  metaAlcanzada = false;
  parqueRecuperado = false;
  particulas = [];
  racha = 0;
  preguntas = shuffle(PREGUNTAS);

  prepararNivel(1);
  estado = 'jugando';
  mostrarPantalla(null);
  actualizarMarcador();
  avisar(`🌱 ¡Vamos, ${personaje().nombre}! Nivel 1 · Fácil: el sendero. Recoge un residuo y llévalo a la zona de reciclaje.`);
  sonar(520, 0.1);
  setTimeout(() => sonar(720, 0.13), 130);
}

function prepararNivel(numero) {
  nivel = numero;
  residuos = elegirResiduos(numero);
  residuoCargado = null;
  destino = null;
  flechasTactiles.clear();
  jugadorX = INICIO_JUGADOR.x;
  jugadorY = INICIO_JUGADOR.y;
  if (fondoNivel) fondoNivel.remove();
  fondoNivel = crearFondo(numero);
}

// Elige al azar los residuos del nivel (al menos uno de cada tipo) y los ubica en el parque.
function elegirResiduos(numero) {
  const posibles = shuffle(RESIDUOS.filter(r => r.nivel === numero));
  const elegidos = CANECAS.map(caneca => posibles.find(r => r.tipo === caneca.tipo));
  for (const r of posibles) {
    if (elegidos.length < NIVELES[numero - 1].cantidad && !elegidos.includes(r)) elegidos.push(r);
  }
  const ocupados = [];
  return elegidos.map(r => {
    const lugar = buscarLugarLibre(ocupados, numero);
    ocupados.push(lugar);
    return { ...r, x: lugar.x, y: lugar.y, xInicial: lugar.x, semilla: random(100) };
  });
}

// Busca un lugar en el pasto que no tape las canecas, los árboles, el lago ni otro residuo.
function buscarLugarLibre(ocupados, numero) {
  for (let intento = 0; intento < 400; intento++) {
    const x = random(80, 980);
    const y = random(290, 512);
    const libre =
      !(x > 600 && y < 335) &&                              // frente a las canecas
      !(x < 130 && y < 345) && !(x > 950 && y < 385) &&     // troncos de los árboles grandes
      !(numero === 2 && x > 250 && x < 510 && y < 335) &&   // mesa de picnic
      !(numero === 3 && estaEnElLago(x, y, 45)) &&
      dist(x, y, INICIO_JUGADOR.x, INICIO_JUGADOR.y) > 110 &&
      ocupados.every(o => dist(x, y, o.x, o.y) > 125);
    if (libre) return { x, y };
  }
  return { x: 470 + ocupados.length * 90, y: 500 };  // plan B (casi nunca se usa)
}

function actualizarJuego(dt) {
  tiempo = max(0, tiempo - dt);
  actualizarReloj();
  if (tiempo === 0) {
    terminarJuego(false);
    return;
  }
  if (NIVELES[nivel - 1].viento) moverConElViento();
  moverJugador(dt);
  sonidosDeAmbiente(dt);
}

function moverJugador(dt) {
  let dx = 0;
  let dy = 0;
  if (direccionPresionada('izquierda')) dx -= 1;
  if (direccionPresionada('derecha')) dx += 1;
  if (direccionPresionada('arriba')) dy -= 1;
  if (direccionPresionada('abajo')) dy += 1;

  if (dx !== 0 || dy !== 0) {
    destino = null;  // el teclado tiene prioridad sobre el clic
  } else if (destino) {
    if (destino.residuo) destino.x = destino.residuo.x;  // el residuo puede moverse con el viento
    const distancia = dist(jugadorX, jugadorY, destino.x, destino.y);
    if (distancia <= VELOCIDAD_JUGADOR * dt + 1) {
      jugadorX = destino.x;
      jugadorY = destino.y;
      const llegada = destino;
      destino = null;
      jugadorCamina = false;
      if (llegada.residuo) recoger(llegada.residuo);
      if (llegada.caneca) depositar(llegada.caneca);
      return;
    }
    dx = destino.x - jugadorX;
    dy = destino.y - jugadorY;
  }

  const largo = Math.hypot(dx, dy);
  jugadorCamina = largo > 0;
  if (!jugadorCamina) return;
  jugadorX = constrain(jugadorX + (dx / largo) * VELOCIDAD_JUGADOR * dt, LIMITES.izquierda, LIMITES.derecha);
  jugadorY = constrain(jugadorY + (dy / largo) * VELOCIDAD_JUGADOR * dt, LIMITES.arriba, LIMITES.abajo);
  pasoJugador += dt * 13;
  if (abs(dx) > 0.05 * largo) jugadorMiraA = Math.sign(dx);
}

// Nivel difícil: el viento mueve los residuos de un lado a otro.
function moverConElViento() {
  for (const r of residuos) {
    r.x = constrain(r.xInicial + sin(reloj * 0.7 + r.semilla) * 28, LIMITES.izquierda + 20, LIMITES.derecha - 20);
  }
}

// Tecla E, espacio o botón táctil: recoge si no lleva nada; deposita si lleva un residuo.
function interactuar() {
  if (estado !== 'jugando') return;
  if (residuoCargado) {
    const caneca = canecaMasCercana();
    if (caneca) depositar(caneca);
    else avisar('🗑️ Acércate a una de las canecas de la zona de reciclaje.');
  } else {
    const residuo = residuoMasCercano();
    if (residuo) recoger(residuo);
    else avisar('🔎 Acércate a un residuo para recogerlo.');
  }
}

function residuoMasCercano() {
  let elegido = null;
  let menor = DISTANCIA_PARA_RECOGER;
  for (const r of residuos) {
    const d = dist(jugadorX, jugadorY, r.x, r.y);
    if (d < menor) { menor = d; elegido = r; }
  }
  return elegido;
}

function canecaMasCercana() {
  let elegida = null;
  let menor = DISTANCIA_PARA_DEPOSITAR;
  for (const c of CANECAS) {
    const d = dist(jugadorX, jugadorY, c.x, Y_DEPOSITO);
    if (d < menor) { menor = d; elegida = c; }
  }
  return elegida;
}

function recoger(residuo) {
  if (estado !== 'jugando' || residuoCargado || !residuos.includes(residuo)) return;
  if (dist(jugadorX, jugadorY, residuo.x, residuo.y) > DISTANCIA_PARA_RECOGER) return;
  residuoCargado = residuo;
  residuos = residuos.filter(r => r !== residuo);
  const pista = NIVELES[nivel - 1].canecaIlumina ? ' La caneca correcta se ilumina.' : '';
  avisar(`🎒 Recogiste: ${residuo.nombre}. Llévalo a la zona de reciclaje.${pista}`);
  lanzarParticulas(residuo.x, residuo.y - 20, 8, 'hoja');
  sonar(620, 0.08);
  actualizarMarcador();
}

function depositar(caneca) {
  if (estado !== 'jugando') return;
  if (!residuoCargado) {
    avisar('🎒 Primero recoge un residuo del suelo.');
    return;
  }
  const residuo = residuoCargado;

  if (residuo.tipo === caneca.tipo) {
    // Acierto: suma puntos y el residuo sale de la mochila.
    puntos += PUNTOS_POR_ACIERTO;
    aciertos++;
    racha++;
    residuoCargado = null;
    let mensaje = `✅ +${PUNTOS_POR_ACIERTO} puntos. ${residuo.dato}`;
    // Extra: racha de aciertos seguidos
    if (racha % RACHA_PARA_BONO === 0) {
      puntos += PUNTOS_BONO_RACHA;
      mensaje = `🔥 ¡Racha de ${racha}! +${PUNTOS_POR_ACIERTO} y +${PUNTOS_BONO_RACHA} de bonus. ${residuo.dato}`;
    }
    if (!metaAlcanzada && puntos >= META_PUNTOS) {
      metaAlcanzada = true;
      mensaje = `🎯 ¡Llegaste a ${META_PUNTOS} puntos y ganaste! Limpia todo el parque para ganar plata u oro.`;
    }
    avisar(mensaje);
    lanzarParticulas(caneca.x, 180, 28, 'estrella');
    sonar(660, 0.09);
    setTimeout(() => sonar(840, 0.11), 100);
    actualizarMarcador();
    if (residuos.length === 0) completarNivel();
  } else {
    // Error: resta puntos y el residuo sigue en la mochila para intentarlo otra vez.
    puntos -= PUNTOS_POR_ERROR;
    errores++;
    racha = 0;
    const correcta = CANECAS.find(c => c.tipo === residuo.tipo);
    if (!paraRepasar.some(p => p.nombre === residuo.nombre)) {
      paraRepasar.push({ nombre: residuo.nombre, caneca: correcta.nombre.toLowerCase() });
    }
    avisar(`❌ −${PUNTOS_POR_ERROR} puntos. ${residuo.nombre} no va en la caneca de ${caneca.nombre.toLowerCase()}: es un residuo ${TIPO_EN_TEXTO[residuo.tipo]}.`, true);
    lanzarParticulas(caneca.x, 180, 12, 'hoja');
    sonar(220, 0.2, 'triangle');
    actualizarMarcador();
  }
}

function completarNivel() {
  if (nivel === NIVELES.length) {
    terminarJuego(true);
    return;
  }
  estado = 'entreNiveles';
  destino = null;
  const actual = NIVELES[nivel - 1];
  const siguiente = NIVELES[nivel];
  el('tituloNivel').textContent = actual.tituloLimpio;
  el('textoNivel').textContent = actual.textoLimpio;
  el('puntosNivel').textContent = puntos;
  el('tiempoNivel').textContent = formatoTiempo(tiempo);
  el('proximoNivel').innerHTML = `<b>Nivel ${nivel + 1} · ${siguiente.nombre}:</b> ${siguiente.novedad}`;
  prepararPregunta();
  mostrarPantalla('pantallaNivel');
  actualizarMarcador();
  sonar(740, 0.1);
  setTimeout(() => sonar(910, 0.18), 130);
}

function siguienteNivel() {
  if (estado !== 'entreNiveles') return;
  prepararNivel(nivel + 1);
  estado = 'jugando';
  mostrarPantalla(null);
  actualizarMarcador();
  const n = NIVELES[nivel - 1];
  avisar(`🌳 Nivel ${nivel} · ${n.nombre}: ${n.zona.toLowerCase()}.`);
  sonar(630, 0.1);
  setTimeout(() => sonar(820, 0.12), 110);
}

// Extra: pregunta rápida entre niveles. Si acierta, gana segundos para el siguiente nivel.
function prepararPregunta() {
  preguntaActual = preguntas[nivel - 1];
  el('preguntaResiduo').textContent = preguntaActual.nombre;
  el('preguntaResultado').textContent = '';
  document.querySelectorAll('[data-respuesta]').forEach(boton => {
    boton.disabled = false;
    boton.classList.remove('correcta', 'incorrecta');
  });
}

function responderPregunta(tipo) {
  if (estado !== 'entreNiveles' || !preguntaActual) return;
  const pregunta = preguntaActual;
  preguntaActual = null;  // solo se puede responder una vez
  document.querySelectorAll('[data-respuesta]').forEach(boton => {
    boton.disabled = true;
    if (boton.dataset.respuesta === pregunta.tipo) boton.classList.add('correcta');
    else if (boton.dataset.respuesta === tipo) boton.classList.add('incorrecta');
  });
  if (tipo === pregunta.tipo) {
    tiempo += SEGUNDOS_BONO_PREGUNTA;
    el('tiempoNivel').textContent = formatoTiempo(tiempo);
    el('preguntaResultado').textContent = `✅ ¡Correcto! +${SEGUNDOS_BONO_PREGUNTA} segundos. ${pregunta.dato}`;
    sonar(660, 0.09);
    setTimeout(() => sonar(880, 0.12), 100);
  } else {
    const caneca = CANECAS.find(c => c.tipo === pregunta.tipo).nombre.toLowerCase();
    el('preguntaResultado').textContent = `❌ Va en la caneca de ${caneca}. ${pregunta.dato}`;
    sonar(220, 0.2, 'triangle');
  }
  actualizarMarcador();
  el('botonSiguiente').focus({ preventScroll: true });
}

// Extra: pantalla para elegir personaje antes de jugar.
function abrirSeleccion() {
  if (estado !== 'inicio' && estado !== 'final') return;
  origenSeleccion = estado;
  document.querySelectorAll('[data-personaje]').forEach(boton => {
    boton.classList.toggle('elegido', boton.dataset.personaje === personajeElegido);
  });
  mostrarPantalla('pantallaPersonaje');
  document.querySelector(`[data-personaje="${personajeElegido}"]`).focus({ preventScroll: true });
}

function elegirPersonaje(id) {
  personajeElegido = id;
  guardar('guardianes-personaje', id);
  iniciarJuego();
}

function crearTarjetasPersonajes() {
  el('listaPersonajes').innerHTML = PERSONAJES.map(p => `
    <button type="button" class="personaje" data-personaje="${p.id}">
      <img src="${p.retrato}" alt="${p.nombreCompleto}">
      <strong>${p.nombreCompleto}</strong>
      <small>${p.descripcion}</small>
    </button>`).join('');
  document.querySelectorAll('[data-personaje]').forEach(boton => {
    boton.addEventListener('click', () => elegirPersonaje(boton.dataset.personaje));
  });
}

function personaje() {
  return PERSONAJES.find(p => p.id === personajeElegido);
}

function alternarPausa() {
  if (estado === 'jugando') {
    estado = 'pausa';
    destino = null;
    mostrarPantalla('pantallaPausa');
  } else if (estado === 'pausa') {
    estado = 'jugando';
    mostrarPantalla(null);
  }
  actualizarMarcador();
}

function pausarSiJuega() {
  flechasTactiles.clear();
  if (estado === 'jugando') alternarPausa();
}


/* ===== 6. FIN DEL JUEGO Y MEDALLAS =====
   Victoria: alcanzar 100 puntos antes de que termine el tiempo (regla 5).
   Derrota: terminar el tiempo sin alcanzar la meta (GDD).
   Si además se limpian los 3 niveles, el parque vuelve a la vida (escenario 3). */

function terminarJuego(parqueLimpio) {
  if (estado === 'celebrando' || estado === 'final') return;
  destino = null;
  flechasTactiles.clear();
  if (parqueLimpio) {
    // Escenario 3: aparecen flores, animales y un arcoíris antes de los resultados.
    parqueRecuperado = true;
    estado = 'celebrando';
    avisar('🌳 ¡El parque volvió a la vida! Los animales regresaron.');
    sonar(860, 0.22);
    setTimeout(() => sonar(1040, 0.35), 220);
    temporizadorCelebracion = setTimeout(() => mostrarResultados(true), 3500);
  } else {
    mostrarResultados(false);
  }
  actualizarMarcador();
}

function mostrarResultados(parqueLimpio) {
  estado = 'final';
  const gano = metaAlcanzada;
  const nombre = personaje().nombre;
  let icono, etiqueta, titulo, texto;
  if (gano && parqueLimpio) {
    [icono, etiqueta, titulo] = ['🏆', 'MISIÓN CUMPLIDA', `¡Salvaste el parque, ${nombre}!`];
    texto = 'El parque está limpio y los animales regresaron. ¡Eres un verdadero Guardián del Planeta!';
  } else if (gano) {
    [icono, etiqueta, titulo] = ['🎯', '¡GANASTE!', `¡Meta alcanzada, ${nombre}!`];
    texto = `Conseguiste ${META_PUNTOS} puntos antes de que terminara el tiempo, pero quedaron residuos en el parque. ¡Límpialo todo para ganar plata u oro!`;
  } else if (parqueLimpio) {
    [icono, etiqueta, titulo] = ['🌱', '¡CASI LO LOGRAS!', '¡El parque está limpio!'];
    texto = `Pero te faltaron puntos: necesitas ${META_PUNTOS}. Clasifica con cuidado para no perder puntos.`;
  } else {
    [icono, etiqueta, titulo] = ['⏰', '¡AÚN PUEDES MEJORAR!', '¡Se acabó el tiempo!'];
    texto = `Necesitas ${META_PUNTOS} puntos antes de que el reloj llegue a cero. ¡Inténtalo otra vez!`;
  }

  el('resultadoIcono').textContent = icono;
  el('resultadoEtiqueta').textContent = etiqueta;
  el('resultadoTitulo').textContent = titulo;
  el('resultadoTexto').textContent = texto;
  el('finalPuntos').textContent = puntos;
  el('finalResiduos').textContent = `${aciertos}/${TOTAL_RESIDUOS}`;
  el('finalErrores').textContent = errores;
  el('medalla').textContent = elegirMedalla(gano, parqueLimpio);

  // Extra: récord guardado en este navegador
  const record = leerGuardado('guardianes-record');
  const nuevoRecord = puntos > 0 && (!record || puntos > record.puntos);
  if (nuevoRecord) guardar('guardianes-record', { puntos, personaje: nombre });
  let textoRecord = '';
  if (nuevoRecord) textoRecord = `🎉 ¡Nuevo récord: ${puntos} puntos!`;
  else if (record) textoRecord = `🏆 Récord: ${record.puntos} puntos (${record.personaje})`;
  el('lineaRecord').textContent = textoRecord;
  mostrarRecord();

  // Lista de residuos en los que se equivocó, con su caneca correcta.
  el('repaso').classList.toggle('oculta', paraRepasar.length === 0);
  el('listaRepaso').innerHTML = paraRepasar
    .map(p => `<li><b>${p.nombre}</b> va en la caneca de ${p.caneca}.</li>`)
    .join('');

  mostrarPantalla('pantallaResultados');
  actualizarMarcador();
  if (!parqueLimpio) {
    if (gano) { sonar(860, 0.22); setTimeout(() => sonar(1040, 0.35), 220); }
    else sonar(260, 0.25);
  }
}

// Medallas de reciclaje (sección 8 del documento).
function elegirMedalla(gano, parqueLimpio) {
  if (!gano) return '🌿 Cada intento es una oportunidad para aprender';
  if (parqueLimpio && errores === 0) return '🥇 Medalla de oro · Reciclaje perfecto';
  if (parqueLimpio) return '🥈 Medalla de plata · Parque limpio';
  return '🥉 Medalla de bronce · Meta alcanzada';
}


/* ===== 7. MARCADOR Y PANTALLAS (HTML) ===== */

const PANTALLAS = ['pantallaInicio', 'pantallaPersonaje', 'pantallaInstrucciones', 'pantallaNivel', 'pantallaPausa', 'pantallaResultados'];
const PANTALLA_DEL_ESTADO = { inicio: 'pantallaInicio', pausa: 'pantallaPausa', entreNiveles: 'pantallaNivel', final: 'pantallaResultados' };

// Muestra una pantalla sobre el juego, o ninguna si id es null.
function mostrarPantalla(id) {
  el('capa').classList.toggle('oculta', id === null);
  el('capa').classList.toggle('capa-clara', id === 'pantallaResultados' && parqueRecuperado);
  for (const p of PANTALLAS) el(p).classList.toggle('oculta', p !== id);
  if (id) (el(id).querySelector('.boton-principal') || el(id).querySelector('button')).focus({ preventScroll: true });
  else if (document.activeElement) document.activeElement.blur();
}

// Extra: muestra el récord en la pantalla de inicio.
function mostrarRecord() {
  const record = leerGuardado('guardianes-record');
  el('textoRecord').classList.toggle('oculta', !record);
  if (record) el('textoRecord').textContent = `🏆 Récord: ${record.puntos} puntos · ${record.personaje}`;
}

function actualizarMarcador() {
  const n = NIVELES[nivel - 1];
  el('puntos').innerHTML = `${puntos} <em>/ ${META_PUNTOS}</em>`;
  el('nivel').innerHTML = `${nivel} <em>/ ${NIVELES.length} · ${n.nombre}</em>`;
  el('mochila').textContent = residuoCargado ? residuoCargado.nombre : 'Vacía';
  el('racha').textContent = `🔥 ${racha}`;

  const listos = n.cantidad - residuos.length - (residuoCargado ? 1 : 0);
  el('progresoTexto').textContent = `${listos} de ${n.cantidad} residuos`;
  el('progresoBarra').style.width = `${(100 * listos) / n.cantidad}%`;

  const boton = el('botonPausa');
  boton.disabled = estado !== 'jugando' && estado !== 'pausa';
  boton.textContent = estado === 'pausa' ? '▶' : 'Ⅱ';
  boton.setAttribute('aria-label', estado === 'pausa' ? 'Reanudar' : 'Pausar');

  tiempoMostrado = '';
  actualizarReloj();
}

// El reloj se actualiza solo cuando cambia el segundo.
function actualizarReloj() {
  const texto = formatoTiempo(tiempo);
  if (texto === tiempoMostrado) return;
  tiempoMostrado = texto;
  el('tiempo').textContent = texto;
  el('tiempo').classList.toggle('poco-tiempo', tiempo <= 10);
}

// Mensaje corto en la parte de arriba del juego.
function avisar(texto, esError = false) {
  const aviso = el('aviso');
  aviso.textContent = texto;
  aviso.classList.toggle('error', esError);
  aviso.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove('visible'), esError ? 3400 : 2600);
}

function abrirInstrucciones() {
  if (estado === 'celebrando') return;
  if (estado === 'jugando') {
    estado = 'pausa';
    destino = null;
  }
  origenInstrucciones = estado;
  el('botonEntendido').textContent = estado === 'inicio' ? '¡Entendido, a jugar! ➜' : 'Volver ➜';
  el('botonVolverInicio').classList.toggle('oculta', estado !== 'inicio');
  mostrarPantalla('pantallaInstrucciones');
  actualizarMarcador();
}

function cerrarInstrucciones() {
  if (origenInstrucciones === 'inicio') abrirSeleccion();
  else mostrarPantalla(PANTALLA_DEL_ESTADO[origenInstrucciones]);
}


/* ===== 8. DIBUJO DEL ESCENARIO =====
   El parque se dibuja una sola vez por nivel en una imagen aparte (createGraphics).
   Así el juego no tiene que redibujar miles de detalles 60 veces por segundo.
   Las funciones con "c" usan el canvas normal de JavaScript (drawingContext),
   porque p5.js no trae degradados de color. */

function crearFondo(numero) {
  const g = createGraphics(ANCHO, ALTO);
  g.strokeJoin(ROUND);
  dibujarCielo(g);
  dibujarMontanas(g);
  dibujarPasto(g);
  dibujarCamino(g);
  dibujarArbol(g, 567, 258, 0.32, 2);
  dibujarArbol(g, 386, 218, 0.52, 7);
  if (numero === 1) dibujarBanca(g, 303, 259, 0.78);
  if (numero === 2) dibujarPicnic(g);
  if (numero === 3) dibujarLago(g);
  dibujarArbol(g, 72, 308, 1.02, 3);
  dibujarArbol(g, 1025, 353, 0.75, 12);
  dibujarZonaDeReciclaje(g);
  dibujarCartelDelNivel(g, numero);
  return g;
}

function dibujarCielo(g) {
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 0, 0, 335, ['#76aeb3', '#b0d6cf', '#c4e5be']);
    c.fillRect(0, 0, ANCHO, ALTO);
    const brillo = c.createRadialGradient(218, 54, 7, 218, 54, 255);
    brillo.addColorStop(0, '#fffbe1e9');
    brillo.addColorStop(0.2, '#ffeab37c');
    brillo.addColorStop(1, '#ffeabd00');
    c.fillStyle = brillo;
    c.fillRect(0, 0, 480, 325);
  });
  ovalo(217, 82, 26, 26, '#fff6c8', null, g);  // sol
  g.noStroke();
  g.fill(255, 250, 221, 24);
  for (let i = 0; i < 7; i++) g.triangle(217, 80, 50 + i * 103, 340, 90 + i * 125, 340);  // rayos
}

function dibujarMontanas(g) {
  g.noStroke();
  g.fill('#76a99a');
  g.beginShape();
  g.vertex(0, 203);
  g.bezierVertex(92, 149, 165, 174, 227, 150);
  g.bezierVertex(378, 111, 489, 187, 625, 140);
  g.bezierVertex(777, 98, 900, 166, ANCHO, 125);
  g.vertex(ANCHO, ALTO);
  g.vertex(0, ALTO);
  g.endShape(CLOSE);

  g.fill('#5d9988');
  g.beginShape();
  g.vertex(0, 223);
  for (let x = 0; x <= ANCHO; x += 23) g.vertex(x, 195 + sin(x * 0.014) * 15 - 17 * azar(x * 2.1));
  g.vertex(ANCHO, ALTO);
  g.vertex(0, ALTO);
  g.endShape(CLOSE);
}

function dibujarPasto(g) {
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 180, 0, ALTO, ['#6ebd76', '#4fa866', '#377f52']);
    c.fillRect(0, 212, ANCHO, ALTO - 212);
  });
  // Franja de pasto más clara
  g.noStroke();
  g.fill('#abd29439');
  g.beginShape();
  g.vertex(0, 279);
  g.bezierVertex(205, 237, 361, 289, 550, 259);
  g.bezierVertex(741, 230, 909, 257, ANCHO, 214);
  g.vertex(ANCHO, 340);
  g.bezierVertex(788, 316, 616, 366, 380, 338);
  g.bezierVertex(185, 313, 78, 361, 0, 357);
  g.endShape(CLOSE);
  // Textura: puntitos claros y oscuros
  g.fill('#fff9a516');
  for (let i = 0; i < 1300; i++) g.rect(azar(i * 9.3) * ANCHO, 195 + azar(i * 17.1) * 390, 1 + azar(i * 3) * 2, 1.5);
  g.fill('#0e563219');
  for (let i = 0; i < 2600; i++) g.rect(azar(i * 3.1) * ANCHO, 195 + azar(i * 5.7) * 390, 1 + azar(i) * 2, 1 + azar(i * 2) * 1.5);
  // Matas de pasto
  for (let i = 0; i < 190; i++) {
    const x = azar(i * 7.8 + 2) * ANCHO;
    const y = 233 + azar(i * 4.18) * 350;
    const z = 0.5 + azar(i * 5.1) * 1.2;
    g.stroke(i % 3 === 0 ? '#d5e49c66' : '#1d804359');
    g.strokeWeight(z);
    g.line(x, y, x - 2 * z, y - 5 * z);
    g.line(x, y, x + 3 * z, y - 6 * z);
  }
}

function dibujarCamino(g) {
  conContexto(g, c => {
    const trazarCamino = (bajar) => {
      c.beginPath();
      c.moveTo(-40, 375 + bajar);
      c.bezierCurveTo(143, 338 + bajar, 370, 451 + bajar, 578, 354 + bajar);
      c.bezierCurveTo(750, 276 + bajar, 936, 304 + bajar, 1080, 279 + bajar);
      c.lineTo(1080, 365 + bajar);
      c.bezierCurveTo(889, 368 + bajar, 734, 375 + bajar, 612, 433 + bajar);
      c.bezierCurveTo(346, 551 + bajar, 169, 443 + bajar, -40, 495 + bajar);
      c.closePath();
    };
    trazarCamino(8);  // sombra del borde
    c.fillStyle = '#253f2c53';
    c.fill();
    trazarCamino(0);
    c.fillStyle = degradadoLineal(c, 0, 290, 0, 490, ['#d9ccab', '#eadfbe', '#a99d79']);
    c.fill();
    c.clip();  // lo siguiente solo se dibuja dentro del camino
    for (let j = 0; j < 410; j++) {  // piedritas
      const rx = 1.1 + azar(j * 7.2) * 5;
      c.globalAlpha = 0.11 + azar(j * 5.67) * 0.22;
      c.fillStyle = j % 3 === 0 ? '#4a5437' : '#fffae6';
      c.beginPath();
      c.ellipse(azar(j * 4.35) * ANCHO, 264 + azar(j * 8.32) * 285, rx, 1 + rx * 0.35, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 0.16;
    c.lineWidth = 1.2;
    for (let j = 0; j < 10; j++) {  // huellas del camino
      c.beginPath();
      c.moveTo(-20, 385 + j * 12);
      c.bezierCurveTo(180, 340 + j * 10, 397, 470 + j * 6, 615, 374 + j * 8);
      c.bezierCurveTo(790, 302 + j * 5, 950, 315 + j * 6, 1080, 294 + j * 9);
      c.strokeStyle = j % 2 ? '#fff7db' : '#7a765c';
      c.stroke();
    }
  });
}

function dibujarArbol(g, x, y, escala, semilla) {
  conContexto(g, c => {
    c.translate(x, y);
    c.scale(escala, escala);
    c.fillStyle = '#0927183a';  // sombra
    c.beginPath();
    c.ellipse(19, 5, 94, 30, 0, 0, Math.PI * 2);
    c.fill();
    // Tronco: claro a la izquierda y oscuro a la derecha
    c.fillStyle = degradadoLineal(c, -14, 0, 21, 0, ['#63492d', '#ac7b46', '#795032', '#422d24']);
    c.beginPath();
    c.moveTo(-13, 0);
    c.bezierCurveTo(-14, -70, -10, -104, -30, -137);
    c.lineTo(-12, -149);
    c.bezierCurveTo(-4, -116, 8, -88, 13, -45);
    c.lineTo(13, 0);
    c.closePath();
    c.fill();
    c.lineCap = 'round';
    c.lineWidth = 9;
    c.strokeStyle = '#6d4a2c';
    c.beginPath();
    c.moveTo(-5, -83); c.lineTo(37, -118);
    c.moveTo(-7, -105); c.lineTo(-54, -135);
    c.stroke();
    // Copa: grupos de hojas con luz arriba a la izquierda
    const grupos = [[-44, -132, 48, 39], [-12, -165, 55, 49], [34, -149, 60, 47], [-49, -104, 49, 43], [9, -107, 65, 55], [57, -109, 43, 39]];
    grupos.forEach(([gx, gy, rx, ry], i) => {
      ovaloDegradado(c, gx, gy, rx, ry, i % 2 ? '#7bde94' : '#54c27a', i % 2 ? '#1a754f' : '#14603d');
    });
    for (let j = 0; j < 26; j++) {
      const angulo = j * 2.399 + semilla;
      const radio = Math.sqrt(azar(j + semilla)) * 61;
      ovaloDegradado(c, radio * Math.cos(angulo) + 5, -133 + radio * 0.75 * Math.sin(angulo),
        6 + azar(j * 3 + semilla) * 11, 3 + azar(j * 4 + semilla) * 7, '#b4efa36b', '#58ab678c');
    }
  });
}

function dibujarBanca(g, x, y, escala) {
  g.push();
  g.translate(x, y);
  g.scale(escala);
  ovalo(4, 2, 62, 16, '#0927184d', null, g);
  trazo([[-35, -9], [-34, 21]], '#394e44', 6, g);
  trazo([[38, -9], [36, 21]], '#394e44', 6, g);
  for (let i = 0; i < 3; i++) rectangulo(-49, -33 + i * 9, 99, 8, 3, '#cf9c5e', '#855a37', g);
  rectangulo(-53, 1, 109, 11, 4, '#aa774a', '#6d5537', g);
  trazo([[-43, 20], [-43, 9]], '#5d5442', 6, g);
  trazo([[45, 20], [45, 9]], '#5d5442', 6, g);
  g.pop();
}

function dibujarPicnic(g) {
  dibujarBanca(g, 288, 278, 0.75);
  ovalo(409, 296, 72, 25, '#0927184d', null, g);
  trazo([[371, 273], [370, 316]], '#765a41', 8, g);
  trazo([[447, 273], [447, 316]], '#765a41', 8, g);
  rectangulo(362, 266, 95, 14, 4, '#c18b54', '#815a39', g);   // mesa
  rectangulo(378, 260, 16, 10, 3, '#efca84', null, g);
  ovalo(430, 255, 13, 11, '#7fbf73', null, g);
  trazo([[407, 264], [407, 185]], '#837451', 4, g);           // palo de la sombrilla
  g.noStroke();
  g.fill('#f7c08a');
  g.beginShape();
  g.vertex(329, 207);
  g.quadraticVertex(374, 135, 407, 159);
  g.quadraticVertex(465, 147, 493, 208);
  g.endShape(CLOSE);
  trazo([[330, 207], [493, 208]], '#a16e5b', 2, g);
}

function dibujarLago(g) {
  const { x, y, radioX, radioY } = LAGO;
  conContexto(g, c => {
    c.fillStyle = '#09271840';
    c.beginPath(); c.ellipse(x, y + 36, radioX + 8, radioY + 7, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#8cb19e';
    c.beginPath(); c.ellipse(x, y, radioX, radioY, -0.1, 0, Math.PI * 2); c.fill();
    c.fillStyle = degradadoLineal(c, x - 160, y - 60, x + 130, y + 70, ['#1f758b', '#3aa6af', '#8bd6c9', '#166e81']);
    c.beginPath(); c.ellipse(x, y, radioX - 13, radioY - 8, -0.1, 0, Math.PI * 2); c.fill();
    for (let k = 0; k < 11; k++) {  // piedras de la orilla
      const angulo = (k * Math.PI * 2) / 11;
      ovaloDegradado(c, radioX * Math.cos(angulo) + x, (radioY - 2) * Math.sin(angulo) + y,
        10 + azar(k) * 16, 7 + azar(k * 0.7) * 7, '#c4bb98', '#746f50');
    }
  });
  for (let i = 0; i < 8; i++) {  // juncos
    const jx = 68 + i * 14;
    const jy = 500 + azar(i) * 17;
    trazo([[jx, jy], [jx - 3, jy - 18 - azar(i) * 12]], '#4a834f', 2, g);
    ovalo(jx - 4, jy - 23, 3, 8, '#8d9c59', null, g);
  }
}

// Escenario 2 del documento: la zona de reciclaje (las canecas se dibujan aparte).
function dibujarZonaDeReciclaje(g) {
  ovalo(839, 232, 214, 45, '#09271838', null, g);
  g.push();
  g.translate(622, 59);
  rectangulo(0, 10, 407, 176, 23, '#1a524b44', '#c3edc366', g);
  rectangulo(7, 13, 393, 160, 20, '#ffffff1a', null, g);
  g.noStroke();
  g.fill('#2b6a53');
  g.quad(-10, 55, 37, 9, 377, 9, 417, 55);                   // techo
  rectangulo(13, 54, 381, 12, 5, '#254c3e', null, g);
  for (let i = 0; i < 5; i++) {                               // columnas
    const px = 18 + i * 92;
    trazo([[px, 56], [px, 159]], '#457f66', 10, g);
    trazo([[px - 2, 65], [px - 2, 151]], '#8fbb9280', 3, g);
  }
  escribir('♻  ZONA DE RECICLAJE', 203, 36, 15, '#f3fff0', CENTER, g);
  g.pop();
}

function dibujarCartelDelNivel(g, numero) {
  const n = NIVELES[numero - 1];
  const texto = `NIVEL ${numero} · ${n.nombre.toUpperCase()}`;
  g.textStyle(BOLD);
  g.textSize(14);
  rectangulo(22, 16, g.textWidth(texto) + 66, 41, 14, '#082e28ba', '#d5fff843', g);
  escribir('✦', 41, 37, 18, '#adf5bd', CENTER, g);
  escribir(texto, 61, 37, 14, '#f1fff0', LEFT, g);
}


/* ===== 9. DIBUJO DE LO QUE SE MUEVE (cada cuadro) ===== */

function dibujarEscena() {
  image(fondoNivel, 0, 0);
  const limpieza = parqueRecuperado ? 1 : aciertos / TOTAL_RESIDUOS;  // de 0 (sucio) a 1 (limpio)
  dibujarSuciedad(limpieza);
  if (parqueRecuperado) dibujarArcoiris();
  dibujarFlores(limpieza);
  if (nivel === 3) dibujarOndasDelLago();
  dibujarVida(limpieza);
  dibujarCanecas();
  dibujarMarcaDestino();
  dibujarResiduosYJugador();
  dibujarAyudaCercana();
  dibujarParticulas();
  if (parqueRecuperado) dibujarConfeti();
}

// Escenario 1: al principio el parque se ve sucio y gris; se aclara con cada acierto.
function dibujarSuciedad(limpieza) {
  if (limpieza >= 1) return;
  noStroke();
  fill(140, 140, 120, 50 * (1 - limpieza));
  rect(0, 0, ANCHO, 212);
  fill(125, 105, 65, 60 * (1 - limpieza));
  rect(0, 212, ANCHO, ALTO - 212);
}

function dibujarFlores(limpieza) {
  for (const flor of FLORES) {
    if (flor.aparece > limpieza) continue;
    if (nivel === 3 && estaEnElLago(flor.x, flor.y, 10)) continue;
    push();
    translate(flor.x, flor.y);
    scale(flor.escala);
    trazo([[0, 6], [1, -7]], '#29744a', 1.4);
    for (let k = 0; k < 6; k++) {
      const angulo = (k * TWO_PI) / 6;
      ovalo(cos(angulo) * 5, -10 + sin(angulo) * 5, 4, 3, flor.color);
    }
    ovalo(0, -10, 3.2, 3.2, '#f4d273');
    pop();
  }
}

function dibujarOndasDelLago() {
  noFill();
  stroke('#d2fff072');
  strokeWeight(1.5);
  for (let i = 0; i < 13; i++) {
    ellipse(90 + i * 19 + sin(reloj * 0.6 + i) * 6, 444 + (i % 4) * 14, 48, 6);
  }
}

// Animales y aves: aparecen a medida que el parque se limpia.
function dibujarVida(limpieza) {
  dibujarPajaro(458 + ((reloj * 6) % 120), 86, 0.7);
  dibujarPajaro(530 + ((reloj * 5) % 100), 107, 0.45);
  if (limpieza > 0.5) dibujarPajaro(150 + ((reloj * 7) % 160), 125, 0.55);
  if (limpieza > 0.25) {
    dibujarMariposa(413 + sin(reloj * 0.45) * 24, 232, 0.57);
    dibujarMariposa(551 + sin(reloj * 0.6) * 21, 282, 0.42);
  }
  if (nivel === 3 && (limpieza > 0.6 || parqueRecuperado)) dibujarPato();
  if (parqueRecuperado) {
    dibujarMariposa(250 + sin(reloj * 0.5) * 30, 300, 0.5);
    dibujarMariposa(760 + sin(reloj * 0.7) * 26, 470, 0.55);
    dibujarConejo(300, 335, 1);
    dibujarConejo(640, 525, -0.85);
  }
}

function dibujarPajaro(x, y, escala) {
  const aleteo = sin(reloj * 6 + x) * 8;
  push();
  translate(x, y + sin(reloj * 0.9 + x) * 3);
  scale(escala);
  noFill();
  stroke('#3c6c68c0');
  strokeWeight(2.5);
  beginShape();
  vertex(-16, -aleteo);
  quadraticVertex(-8, 3, 0, 1);
  quadraticVertex(9, 3, 17, -aleteo);
  endShape();
  pop();
}

function dibujarMariposa(x, y, escala) {
  push();
  translate(x, y + sin(reloj * 3 + x) * 5);
  scale(escala);
  const alas = 0.75 + abs(sin(reloj * 9 + x)) * 0.25;  // aleteo
  ovalo(-7 * alas, -2, 8 * alas, 12, '#f4ca6a');
  ovalo(7 * alas, -2, 8 * alas, 12, '#f4ca6a');
  ovalo(-5 * alas, 8, 7 * alas, 8, '#e3a69b');
  ovalo(5 * alas, 8, 7 * alas, 8, '#e3a69b');
  trazo([[0, -9], [0, 13]], '#4f7850', 2);
  pop();
}

function dibujarPato() {
  push();
  translate(247 + sin(reloj * 0.8) * 17, 467 + cos(reloj * 0.7) * 4);
  ovalo(0, 0, 23, 13, '#f6dc94');
  ovalo(12, -14, 12, 13, '#fbe9b5');
  ovalo(17, -16, 2.5, 2.5, '#273e32');
  poligono([[23, -13], [35, -9], [22, -5]], '#f09c44');
  pop();
}

function dibujarConejo(x, y, mira) {
  const salto = abs(sin(reloj * 3 + x)) * 6;
  push();
  translate(x, y - salto);
  scale(mira, 1);
  ovalo(0, 0, 20, 14, '#e8d3b4');               // cuerpo
  ovalo(-17, -2, 6, 6, '#fff7ea');             // cola
  ovalo(14, -13, 11, 10, '#e8d3b4');           // cabeza
  ovalo(10, -31, 4, 12, '#e8d3b4');            // orejas
  ovalo(17, -31, 4, 12, '#e8d3b4');
  ovalo(10, -31, 2, 8, '#efb1ad');
  ovalo(17, -31, 2, 8, '#efb1ad');
  ovalo(18, -15, 1.8, 2.2, '#3a4a36');         // ojo
  ovalo(24, -11, 2, 1.6, '#ae6e69');           // nariz
  pop();
}

function dibujarArcoiris() {
  const colores = ['#ff8a8a', '#ffc078', '#ffe58a', '#9ee6a0', '#8ecbff', '#c5a8ff'];
  noFill();
  strokeWeight(8);
  colores.forEach((color, i) => {
    stroke(color + '55');
    arc(330, 265, 520 - i * 16, 340 - i * 16, PI, TWO_PI);
  });
}

function dibujarCanecas() {
  const hayPista = NIVELES[nivel - 1].canecaIlumina && residuoCargado && estado === 'jugando';
  for (const caneca of CANECAS) dibujarCaneca(caneca, hayPista && residuoCargado.tipo === caneca.tipo);
}

function dibujarCaneca(caneca, iluminada) {
  push();
  translate(caneca.x, 192 + (iluminada ? sin(reloj * 6) * 1.5 : 0));
  ovalo(4, 34, 44, 12, '#09271855');                                         // sombra
  if (iluminada) ovalo(0, -8, 62 + sin(reloj * 5) * 3, 66 + sin(reloj * 5) * 3, '#fffbc770');
  poligono([[34, -43], [46, -36], [46, 33], [34, 40]], caneca.oscuro);       // costado
  rectangulo(-35, -43, 70, 82, 9, caneca.color, '#163e3a55');                // cuerpo
  rectangulo(-31, -39, 12, 72, 6, '#ffffff30');                              // brillo
  rectangulo(-40, -50, 81, 13, 5, caneca.oscuro);                            // tapa
  rectangulo(-26, -23, 53, 45, 7, '#ffffffd0');                              // placa del símbolo
  dibujarSimboloCaneca(caneca);
  const e = min(escalaTexto, 1.3);
  rectangulo(-49 * e, 51, 98 * e, 24 * e, 9, '#fbfff3f2');
  escribir(caneca.nombre, 0, 51 + 12 * e, (caneca.nombre.length > 8 ? 11 : 12) * e, '#275443');
  pop();
}

function dibujarSimboloCaneca(caneca) {
  if (caneca.tipo === 'papel') {
    rectangulo(-11, -15, 22, 28, 2, '#eaf4ff', caneca.oscuro);
    for (const y of [-7, -1, 5]) trazo([[-6, y], [6, y]], caneca.oscuro, 2);
  } else if (caneca.tipo === 'plastico') {
    rectangulo(-5, -17, 10, 6, 2, caneca.oscuro);
    rectangulo(-9, -12, 18, 26, 6, '#ffe7a8', caneca.oscuro);
  } else {
    ovalo(-4, 1, 12, 8, '#468a55');
    ovalo(7, -6, 11, 7, '#6daf6a');
    trazo([[-6, 10], [8, -8]], caneca.oscuro, 3);
  }
}

// Círculo en el suelo donde el jugador tocó para que el personaje camine.
function dibujarMarcaDestino() {
  if (!destino || estado !== 'jugando') return;
  noFill();
  stroke('#fffdd1d9');
  strokeWeight(3);
  ellipse(destino.x, destino.y, 30 + sin(reloj * 6) * 6, 14);
  ovalo(destino.x, destino.y, 4, 4, '#fffedd');
}

// Se dibuja primero lo que está más arriba, para que el personaje pase por delante o por detrás.
function dibujarResiduosYJugador() {
  const cercano = estado === 'jugando' && !residuoCargado ? residuoMasCercano() : null;
  const objetos = residuos.map(r => ({ y: r.y, dibujar: () => dibujarResiduo(r, r === cercano || r === residuoSenalado) }));
  objetos.push({ y: jugadorY, dibujar: dibujarJugador });
  objetos.sort((a, b) => a.y - b.y);
  for (const objeto of objetos) objeto.dibujar();
}

function dibujarAyudaCercana() {
  if (estado !== 'jugando') return;
  let accion = null;
  if (!residuoCargado && residuoMasCercano()) accion = 'RECOGER';
  if (residuoCargado && canecaMasCercana()) accion = 'DEPOSITAR';
  if (accion) burbuja(esPantallaTactil ? `👆 ${accion}` : `E · ${accion}`, jugadorX, jugadorY - 185);
}

function dibujarConfeti() {
  noStroke();
  const colores = ['#f5d57c', '#efabb7', '#e0e8f6', '#72dca4'];
  for (let i = 0; i < 80; i++) {
    const x = ((azar(i * 2.6) * ANCHO + reloj * (22 + (i % 6)) * 4) % (ANCHO + 20)) - 10;
    const y = ((azar(i * 4.7) * ALTO + reloj * (29 + (i % 3)) * 2) % (ALTO + 20)) - 10;
    push();
    translate(x, y);
    rotate(reloj * 2 + i);
    fill(colores[i % 4]);
    rect(-3, -5, 6, 10);
    pop();
  }
}


/* ===== 10. DIBUJO DE RESIDUOS Y DEL PERSONAJE ===== */

function dibujarResiduo(r, resaltado) {
  const flotar = sin(reloj * 2 + r.semilla) * 2;
  ovalo(r.x, r.y + 12, 28, 9, '#0927183d');                       // sombra
  if (resaltado) ovalo(r.x, r.y - 4, 38, 34, '#fff8b455');        // brillo cuando está cerca
  push();
  translate(r.x, r.y - 2 + flotar);
  rotate(0.1 * sin(r.semilla));
  dibujarArteResiduo(r.dibujo);
  pop();
  if (NIVELES[nivel - 1].nombresVisibles || resaltado) etiqueta(r.nombre, r.x, r.y + 38);
}

// Dibuja cada residuo alrededor del punto (0, 0).
function dibujarArteResiduo(dibujo) {
  switch (dibujo) {
    // ----- Papel -----
    case 'hoja':
      poligono([[-15, -15], [7, -19], [19, -6], [14, 17], [-16, 13]], '#fffdf2', '#7c9e9d');
      trazo([[-9, -5], [6, -7]], '#a5c6ce', 2);
      trazo([[-9, 2], [10, 1]], '#a5c6ce', 2);
      trazo([[-8, 9], [6, 9]], '#a5c6ce', 2);
      break;
    case 'periodico':
      rectangulo(-21, -15, 42, 30, 2, '#ece8dc', '#7f7c70');
      rectangulo(-17, -11, 34, 6, 1, '#59606b');
      rectangulo(-17, -2, 13, 12, 1, '#b9c2c9');
      for (const y of [-1, 4, 9]) trazo([[0, y], [17, y]], '#9a978c', 2);
      break;
    case 'caja':
      rectangulo(-20, -13, 40, 27, 3, '#c99460', '#a87442');
      trazo([[0, -13], [0, 14]], '#a87442', 2);
      trazo([[-20, -4], [0, 0], [20, -4]], '#e3b682', 2);
      break;
    case 'sobre':
      rectangulo(-21, -13, 42, 27, 3, '#fdf7e6', '#b49f7a');
      trazo([[-20, -12], [0, 3], [20, -12]], '#b49f7a', 2);
      rectangulo(9, -9, 8, 9, 1, '#e57d6d');  // estampilla
      break;
    case 'cartonHuevos':
      rectangulo(-23, -4, 46, 17, 4, '#c9b597', '#8f7d60');
      for (const x of [-15, -5, 5, 15]) ovalo(x, -5, 5.5, 6, '#d9c8aa', '#8f7d60');
      break;
    case 'tubo':
      rectangulo(-9, -18, 18, 36, 3, '#c99a64', '#8d6439');
      trazo([[-9, -6], [9, -12]], '#a87a48', 2);
      trazo([[-9, 6], [9, 0]], '#a87a48', 2);
      ovalo(0, -18, 9, 4, '#7a5532');
      break;
    // ----- Plástico -----
    case 'botella':
      rectangulo(-8, -25, 16, 9, 2, '#62b4da', '#367994');
      rectangulo(-11, -17, 22, 37, 7, '#a8e5ec', '#4298b0');
      rectangulo(-9, -1, 18, 10, 2, '#ffffffb7');
      break;
    case 'vaso':
      poligono([[-15, -13], [15, -13], [11, 20], [-11, 20]], '#aee1e8', '#397c92');
      rectangulo(-18, -17, 36, 6, 3, '#ffffff', '#397c92');
      trazo([[2, -17], [10, -29]], '#f07f8f', 3);  // pitillo
      break;
    case 'bolsa':
      poligono([[-18, -11], [-7, -18], [7, -18], [18, -11], [15, 19], [-15, 19]], '#e8e8f7d0', '#7f9ec0');
      noFill();
      stroke('#7f9ec0');
      strokeWeight(2);
      arc(0, -17, 16, 16, PI, TWO_PI);  // asa
      break;
    case 'cuchara':
      trazo([[-2, 2], [22, -8]], '#9fb3c8', 7);
      trazo([[-2, 2], [22, -8]], '#ffffff', 4);
      ovalo(-10, 5, 11, 7, '#ffffff', '#9fb3c8');
      break;
    case 'tapa':
      ovalo(0, 6, 13, 5, '#245f94');
      rectangulo(-13, -6, 26, 12, 3, '#3d95dc', '#245f94');
      for (const x of [-8, -3, 2, 7]) trazo([[x, -4], [x, 4]], '#2a74b4', 2);
      break;
    case 'yogur':
      poligono([[-13, -14], [13, -14], [10, 18], [-10, 18]], '#fdfdfd', '#9fb3c8');
      rectangulo(-12, -3, 24, 9, 2, '#f48fb1');
      ovalo(0, -14, 14, 4, '#d9e4ee', '#9fb3c8');
      break;
    // ----- Orgánicos -----
    case 'banano':
      fill('#f9d25b');
      stroke('#bb8b34');
      strokeWeight(2);
      beginShape();
      vertex(-21, -10);
      quadraticVertex(-2, 28, 23, -12);
      quadraticVertex(16, 12, -3, 13);
      quadraticVertex(-15, 7, -21, -10);
      endShape(CLOSE);
      ovalo(22, -12, 3, 3, '#7e6b42');
      break;
    case 'manzana':
      ovalo(0, -11, 11, 6, '#de7464', '#a94845');
      rectangulo(-6, -9, 12, 18, 5, '#fbefc9', '#d8c79a');
      ovalo(0, 11, 11, 6, '#de7464', '#a94845');
      rectangulo(-1.5, -22, 3, 7, 1, '#7d6e3b');
      ovalo(5, -20, 6, 3, '#68ad69');
      break;
    case 'naranja':
      fill('#f9ac4c');
      stroke('#cc7929');
      strokeWeight(2);
      arc(0, 0, 38, 38, 0.15, PI * 1.7, PIE);
      ovalo(0, 0, 12, 12, '#ffe09e');
      ovalo(3, 0, 4, 4, '#fff4bf');
      break;
    case 'pan':
      ovalo(0, 2, 21, 12, '#d39a55', '#9c6a33');
      ovalo(-2, -1, 14, 7, '#f5dcae');
      for (const x of [-8, 0, 8]) ovalo(x, -4, 1.5, 1, '#c08a4a');
      break;
    case 'huevo':
      fill('#fbf3e4');
      stroke('#c9b79c');
      strokeWeight(2);
      arc(-9, 0, 24, 30, 0, PI, CHORD);
      push();
      translate(10, 4);
      rotate(0.6);
      arc(0, 0, 20, 24, 0, PI, CHORD);
      pop();
      trazo([[-21, 0], [-16, -4], [-11, 0], [-6, -4], [3, 0]], '#c9b79c', 2);
      break;
    case 'hojas':
      dibujarHojaSeca(-8, 2, -0.5, '#c98a3a');
      dibujarHojaSeca(8, -3, 0.6, '#a8642a');
      dibujarHojaSeca(2, 9, 0.1, '#d9a441');
      break;
  }
}

function dibujarHojaSeca(x, y, angulo, color) {
  push();
  translate(x, y);
  rotate(angulo);
  ovalo(0, 0, 13, 6, color, '#7a4a1f');
  trazo([[-12, 0], [12, 0]], '#7a4a1f', 1.5);
  pop();
}

// El personaje elegido. Usa los colores de su ropa (PERSONAJES) y, si tiene foto, su cara.
function dibujarJugador() {
  const p = personaje();
  const paso = jugadorCamina && estado === 'jugando' ? sin(pasoJugador) : 0;
  const r = jugadorCamina ? abs(paso) * 3 : sin(reloj * 1.9) * 0.8;  // rebote del cuerpo
  const tieneFoto = p.imagen && p.imagen.complete && p.imagen.naturalWidth > 0;
  push();
  translate(jugadorX, jugadorY);
  ovalo(3, 4, 36, 12, '#09271873');  // sombra

  push();
  scale(jugadorMiraA, 1);  // mira a la izquierda o a la derecha
  // Piernas y zapatos
  trazo([[-9, -24], [-11 + paso * 7, -2]], p.pantalon, 10);
  trazo([[9, -24], [11 - paso * 7, -2]], p.sombraPantalon, 10);
  ovalo(-13 + paso * 7, 2, 12, 5, p.zapatos, p.suela);
  ovalo(12 - paso * 7, 2, 12, 5, p.zapatos, p.suela);
  // Mochila de guardián
  rectangulo(-31, -82 + r, 20, 50, 8, '#d9aa5e', '#705e40');
  rectangulo(-27, -48 + r, 15, 19, 5, '#a77a49');
  // Brazos (se mueven al contrario de las piernas)
  const manoIzquierda = [-24 - paso * 5, -42 + r];
  const manoDerecha = [25 + paso * 5, -41 + r];
  trazo([[-15, -70 + r], manoIzquierda], p.sombraPiel, 13);
  trazo([[-15, -70 + r], manoIzquierda], p.piel, 10);
  trazo([[15, -70 + r], manoDerecha], p.sombraPiel, 13);
  trazo([[15, -70 + r], manoDerecha], p.piel, 10);
  if (p.mangaCorta) {
    trazo([[-14, -73 + r], [-19 - paso * 2, -59 + r]], p.camisa, 15);
    trazo([[14, -73 + r], [19 + paso * 2, -59 + r]], p.camisa, 15);
  }
  // Camisa o chaqueta
  rectangulo(-19, -83 + r, 38, 61, 13, p.camisa, p.sombraCamisa);
  dibujarDetallesRopa(p, r);
  // Cuello
  rectangulo(-7, -100 + r, 14, 22, 6, p.sombraPiel);
  if (!tieneFoto) dibujarCaraDeEco(r);
  pop();

  // La foto va fuera del espejo para que la cara no se vea al revés.
  if (tieneFoto) {
    ovalo(0, -117 + r, 33, 33, '#ffffff', '#0d3b2e');
    drawingContext.drawImage(p.imagen, -30, -147 + r, 60, 60);
  }

  // Residuo que lleva en la mochila
  if (residuoCargado) {
    push();
    translate(36 * jugadorMiraA, -58 + r);
    scale(0.7);
    rectangulo(-27, -29, 55, 55, 14, '#ffffe5ee', '#ffe7a6');
    dibujarArteResiduo(residuoCargado.dibujo);
    pop();
  }
  pop();
}

function dibujarDetallesRopa(p, r) {
  if (p.estilo === 'polo') {
    // Polo blanca: cuello y botones
    poligono([[-10, -83 + r], [0, -74 + r], [10, -83 + r], [6, -86 + r], [0, -80 + r], [-6, -86 + r]], p.cuello, p.sombraCamisa);
    ovalo(0, -70 + r, 1.6, 1.6, '#aab4af');
    ovalo(0, -63 + r, 1.6, 1.6, '#aab4af');
  } else if (p.estilo === 'uniforme') {
    // Camisa del colegio: cuello azul, pliegues y escudo
    trazo([[-10, -84 + r], [-2, -73 + r]], p.cuello, 4);
    trazo([[10, -84 + r], [2, -73 + r]], p.cuello, 4);
    trazo([[-8, -70 + r], [-8, -27 + r]], p.sombraCamisa, 1.5);
    trazo([[-4, -70 + r], [-4, -27 + r]], p.sombraCamisa, 1.5);
    ovalo(9, -63 + r, 4, 5, '#3b5bab', '#e0b43c');
  } else {
    // Chaqueta de Eco: cremallera verde y bolsillos
    rectangulo(-6, -78 + r, 12, 54, 5, p.cuello);
    trazo([[0, -77 + r], [0, -31 + r]], '#d6e2b3', 2);
    rectangulo(-15, -47 + r, 11, 10, 3, '#f2c77d77');
    rectangulo(4, -47 + r, 11, 10, 3, '#f2c77d77');
  }
}

// Eco (sección 9 del documento): 15 años, amable, responsable y aventurera.
function dibujarCaraDeEco(r) {
  ovalo(0, -118 + r, 27, 30, '#f2c39b', '#c18a62');
  ovalo(-9, -123 + r, 9, 13, '#ffdcb8');
  ovalo(-23, -116 + r, 7, 11, '#e4a982');
  // Ojos y sonrisa
  ovalo(-8, -119 + r, 2, 3, '#2d4038');
  ovalo(8, -119 + r, 2, 3, '#2d4038');
  noFill();
  stroke('#95564a');
  strokeWeight(2);
  arc(0, -108 + r, 14, 14, 0.15, PI - 0.15);
  // Cabello y gorra
  ovalo(-4, -139 + r, 24, 13, '#243b33');
  ovalo(1, -144 + r, 29, 11, '#2f9a6c');
  rectangulo(-11, -155 + r, 27, 13, 8, '#2a9368');
  rectangulo(5, -143 + r, 32, 6, 3, '#206d55');
}


/* ===== 11. EFECTOS Y SONIDOS ===== */

function lanzarParticulas(x, y, cantidad, forma) {
  const colores = ['#fff2ac', '#d8ffbc', '#ffd3a2', '#a8eed8'];
  for (let i = 0; i < cantidad; i++) {
    const angulo = (TWO_PI * i) / cantidad;
    const rapidez = random(55, 155);
    particulas.push({
      x, y, forma,
      vx: cos(angulo) * rapidez,
      vy: sin(angulo) * rapidez - 38,
      vida: random(0.75, 1.4),
      color: colores[i % 4],
      tamano: random(2, 7),
      giro: random(TWO_PI)
    });
  }
}

function actualizarParticulas(dt) {
  for (const p of particulas) {
    p.vida -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 125 * dt;  // gravedad
  }
  particulas = particulas.filter(p => p.vida > 0);
}

function dibujarParticulas() {
  noStroke();
  for (const p of particulas) {
    const c = color(p.color);
    c.setAlpha(255 * constrain(p.vida / 1.4, 0, 1));
    fill(c);
    push();
    translate(p.x, p.y);
    rotate(reloj * 2 + p.giro);
    if (p.forma === 'estrella') {
      beginShape();
      for (let k = 0; k < 8; k++) {
        const radio = k % 2 ? 3 : 8;
        vertex(cos((k * PI) / 4) * radio, sin((k * PI) / 4) * radio);
      }
      endShape(CLOSE);
    } else {
      ellipse(0, 0, p.tamano * 2, p.tamano * 1.1);
    }
    pop();
  }
}

// Genera un sonido corto con el navegador (no necesita archivos de audio).
function sonar(frecuencia, duracion, forma = 'sine', volumen = 0.055, frecuenciaFinal = null) {
  if (!sonidoActivo) return;
  try {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return;
    if (!contextoAudio) contextoAudio = new Contexto();
    if (contextoAudio.state === 'suspended') contextoAudio.resume();
    const t = contextoAudio.currentTime;
    const oscilador = contextoAudio.createOscillator();
    const ganancia = contextoAudio.createGain();
    oscilador.type = forma;
    oscilador.frequency.setValueAtTime(frecuencia, t);
    if (frecuenciaFinal) oscilador.frequency.linearRampToValueAtTime(frecuenciaFinal, t + duracion / 2);
    ganancia.gain.setValueAtTime(volumen, t);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    oscilador.connect(ganancia);
    ganancia.connect(contextoAudio.destination);
    oscilador.start(t);
    oscilador.stop(t + duracion + 0.02);
  } catch (error) {
    // El sonido es opcional: si falla, el juego sigue funcionando.
  }
}

// Pasos del personaje y canto de pájaros mientras se juega.
function sonidosDeAmbiente(dt) {
  if (!contextoAudio) return;
  esperaPaso = jugadorCamina ? esperaPaso + dt : 0;
  if (esperaPaso > 0.31) {
    esperaPaso = 0;
    sonar(95, 0.08, 'triangle', 0.012);
  }
  esperaPajaro += dt;
  if (esperaPajaro > 6.5) {
    esperaPajaro = 0;
    sonar(1050, 0.24, 'sine', 0.018, 1600);
  }
}

function alternarSonido() {
  sonidoActivo = !sonidoActivo;
  el('botonSonido').textContent = sonidoActivo ? '♫' : '🔇';
  el('botonSonido').setAttribute('aria-label', sonidoActivo ? 'Desactivar sonido' : 'Activar sonido');
  if (sonidoActivo) sonar(700, 0.09);
}


/* ===== 12. CONTROLES: TECLADO, RATÓN, PANTALLA TÁCTIL Y BOTONES ===== */

// Códigos de teclado: flechas (37 a 40) y letras W A S D.
const TECLAS = { izquierda: [37, 65], derecha: [39, 68], arriba: [38, 87], abajo: [40, 83] };

function direccionPresionada(direccion) {
  return flechasTactiles.has(direccion) || TECLAS[direccion].some(codigo => keyIsDown(codigo));
}

function conectarControles() {
  // Botones de las pantallas
  el('botonJugar').addEventListener('click', abrirSeleccion);
  el('botonVolverDeSeleccion').addEventListener('click', () => mostrarPantalla(PANTALLA_DEL_ESTADO[origenSeleccion]));
  el('botonCambiarPersonaje').addEventListener('click', abrirSeleccion);
  document.querySelectorAll('[data-respuesta]').forEach(boton => {
    boton.addEventListener('click', () => responderPregunta(boton.dataset.respuesta));
  });
  el('botonComoJugar').addEventListener('click', abrirInstrucciones);
  el('botonEntendido').addEventListener('click', cerrarInstrucciones);
  el('botonVolverInicio').addEventListener('click', () => mostrarPantalla('pantallaInicio'));
  el('botonSiguiente').addEventListener('click', siguienteNivel);
  el('botonReanudar').addEventListener('click', alternarPausa);
  el('botonReiniciar').addEventListener('click', iniciarJuego);
  el('botonJugarOtraVez').addEventListener('click', iniciarJuego);
  // Botones del marcador
  el('botonPausa').addEventListener('click', alternarPausa);
  el('botonSonido').addEventListener('click', alternarSonido);
  el('botonAyuda').addEventListener('click', abrirInstrucciones);

  // Teclado
  document.addEventListener('keydown', alPresionarTecla);

  // Ratón o dedo sobre el parque
  lienzo.elt.addEventListener('pointerdown', alTocarLienzo);
  lienzo.elt.addEventListener('pointermove', alMoverPuntero);
  lienzo.elt.addEventListener('pointerleave', () => { residuoSenalado = null; });

  // Si el jugador cambia de pestaña o de ventana, el juego se pausa.
  window.addEventListener('blur', pausarSiJuega);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pausarSiJuega(); });

  // Controles táctiles
  document.querySelectorAll('[data-direccion]').forEach(boton => {
    const direccion = boton.dataset.direccion;
    const soltar = () => {
      flechasTactiles.delete(direccion);
      boton.classList.remove('presionado');
    };
    boton.addEventListener('pointerdown', evento => {
      evento.preventDefault();
      if (estado !== 'jugando') return;
      flechasTactiles.add(direccion);
      boton.classList.add('presionado');
      try { boton.setPointerCapture(evento.pointerId); } catch (error) { /* no es necesario */ }
    });
    boton.addEventListener('pointerup', soltar);
    boton.addEventListener('pointercancel', soltar);
    boton.addEventListener('lostpointercapture', soltar);
  });
  el('botonTactilAccion').addEventListener('pointerdown', evento => {
    evento.preventDefault();
    interactuar();
  });
}

function alPresionarTecla(evento) {
  const tecla = evento.key.toLowerCase();
  const enUnBoton = document.activeElement && document.activeElement.tagName === 'BUTTON';
  // Mientras se juega, las flechas y el espacio no deben mover la página.
  if (estado === 'jugando' && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(tecla)) evento.preventDefault();
  if (evento.repeat) return;

  if (tecla === 'p' || tecla === 'escape') {
    alternarPausa();
  } else if (estado === 'jugando' && (tecla === 'e' || tecla === ' ')) {
    interactuar();
  } else if (tecla === 'enter' && !enUnBoton) {
    if (estado === 'inicio') abrirSeleccion();
    else if (estado === 'final') iniciarJuego();
    else if (estado === 'entreNiveles') siguienteNivel();
  }
}

// Convierte la posición del clic en la pantalla a coordenadas del parque (1040 × 585).
function posicionEnLienzo(evento) {
  const borde = lienzo.elt.getBoundingClientRect();
  return {
    x: ((evento.clientX - borde.left) / borde.width) * ANCHO,
    y: ((evento.clientY - borde.top) / borde.height) * ALTO
  };
}

// Al tocar el parque: si es un residuo, el personaje va a recogerlo; si es una caneca, va a depositar;
// si es el suelo, camina hasta allí.
function alTocarLienzo(evento) {
  if (estado !== 'jugando') return;
  evento.preventDefault();
  const { x, y } = posicionEnLienzo(evento);
  const radio = 50 * min(escalaTexto, 1.6);

  const residuo = residuos.find(r => dist(x, y, r.x, r.y) < radio);
  if (residuo && !residuoCargado) {
    destino = { x: residuo.x, y: residuo.y, residuo };
    return;
  }
  const caneca = CANECAS.find(c => abs(x - c.x) < 57 && y > 110 && y < 255);
  if (caneca) {
    if (!residuoCargado) avisar('🎒 Primero recoge un residuo.');
    else destino = { x: caneca.x, y: Y_DEPOSITO, caneca };
    return;
  }
  destino = {
    x: constrain(x, LIMITES.izquierda, LIMITES.derecha),
    y: constrain(y, LIMITES.arriba, LIMITES.abajo)
  };
}

function alMoverPuntero(evento) {
  const { x, y } = posicionEnLienzo(evento);
  residuoSenalado = residuos.find(r => dist(x, y, r.x, r.y) < 50) || null;
  lienzo.elt.style.cursor = estado === 'jugando' ? 'pointer' : 'default';
}


/* ===== 13. FUNCIONES DE AYUDA =====
   Las de dibujo reciben "g" al final: si no se indica, dibujan en la pantalla principal;
   en el escenario se usa la imagen del fondo. */

function el(id) {
  return document.getElementById(id);
}

// Carga una imagen de la carpeta assets/. Se usa Image() en vez de loadImage() de p5
// porque así también funciona al abrir index.html con doble clic (sin servidor).
function cargarImagen(ruta) {
  const imagen = new Image();
  imagen.src = ruta;
  return imagen;
}

// Guarda y lee datos en este navegador (personaje elegido y récord).
// Si el navegador no lo permite, el juego sigue funcionando sin guardar.
function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (error) { /* sin almacenamiento */ }
}

function leerGuardado(clave) {
  try { return JSON.parse(localStorage.getItem(clave)); } catch (error) { return null; }
}

// Número entre 0 y 1 que siempre es el mismo para la misma semilla (decorado fijo).
function azar(semilla) {
  const x = Math.sin(semilla * 127.1 + 74.7) * 43758.5453;
  return x - Math.floor(x);
}

function formatoTiempo(segundos) {
  const total = Math.ceil(segundos);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function estaEnElLago(x, y, margen = 0) {
  return ((x - LAGO.x) / (LAGO.radioX + margen)) ** 2 + ((y - LAGO.y) / (LAGO.radioY + margen)) ** 2 < 1;
}

function ovalo(x, y, radioX, radioY, relleno, borde = null, g = pantalla) {
  if (borde) { g.stroke(borde); g.strokeWeight(2); } else g.noStroke();
  g.fill(relleno);
  g.ellipse(x, y, radioX * 2, radioY * 2);
}

function rectangulo(x, y, ancho, alto, radio, relleno, borde = null, g = pantalla) {
  if (borde) { g.stroke(borde); g.strokeWeight(2); } else g.noStroke();
  g.fill(relleno);
  g.rect(x, y, ancho, alto, radio);
}

function poligono(puntos, relleno, borde = null, g = pantalla) {
  if (borde) { g.stroke(borde); g.strokeWeight(2); } else g.noStroke();
  g.fill(relleno);
  g.beginShape();
  for (const [x, y] of puntos) g.vertex(x, y);
  g.endShape(CLOSE);
}

function trazo(puntos, color, grosor = 3, g = pantalla) {
  g.noFill();
  g.stroke(color);
  g.strokeWeight(grosor);
  g.beginShape();
  for (const [x, y] of puntos) g.vertex(x, y);
  g.endShape();
}

function escribir(texto, x, y, tamano, color, alineacion = CENTER, g = pantalla) {
  g.noStroke();
  g.fill(color);
  g.textStyle(BOLD);
  g.textSize(tamano);
  g.textAlign(alineacion, CENTER);
  g.text(texto, x, y);
}

// Nombre del residuo en una cajita (más grande en teléfonos).
function etiqueta(texto, x, y) {
  const e = escalaTexto;
  textStyle(BOLD);
  textSize(10.5 * e);
  const ancho = textWidth(texto) + 20 * e;
  const cx = constrain(x, ancho / 2 + 4, ANCHO - ancho / 2 - 4);
  rectangulo(cx - ancho / 2, y - 12.5 * e, ancho, 25 * e, 9 * e, '#fffef0e6');
  escribir(texto, cx, y, 10.5 * e, '#295d45');
}

// Globo de ayuda sobre el personaje ("E · RECOGER").
function burbuja(texto, x, y) {
  const e = escalaTexto;
  textStyle(BOLD);
  textSize(12 * e);
  const ancho = textWidth(texto) + 22 * e;
  const cx = constrain(x, ancho / 2 + 10, ANCHO - ancho / 2 - 10);
  const cy = max(14 * e + 4, y);
  rectangulo(cx - ancho / 2, cy - 13 * e, ancho, 26 * e, 12 * e, '#1d654ce8');
  escribir(texto, cx, cy, 12 * e, '#ffffff');
}

// Usa el canvas normal de JavaScript y deja todo como estaba al terminar.
function conContexto(g, dibujar) {
  const c = g.drawingContext;
  c.save();
  dibujar(c);
  c.restore();
}

function degradadoLineal(c, x0, y0, x1, y1, colores) {
  const degradado = c.createLinearGradient(x0, y0, x1, y1);
  colores.forEach((color, i) => degradado.addColorStop(i / (colores.length - 1), color));
  return degradado;
}

function ovaloDegradado(c, x, y, radioX, radioY, claro, oscuro) {
  const degradado = c.createRadialGradient(x - radioX * 0.32, y - radioY * 0.46, 2, x, y, Math.max(radioX, radioY) * 1.2);
  degradado.addColorStop(0, claro);
  degradado.addColorStop(1, oscuro);
  c.fillStyle = degradado;
  c.beginPath();
  c.ellipse(x, y, radioX, radioY, 0, 0, Math.PI * 2);
  c.fill();
}

// Solo lectura: permite revisar el estado del juego desde la consola del navegador (F12).
window.GuardianesDelPlaneta = Object.freeze({
  estado: () => ({
    estado, nivel, puntos, tiempo, aciertos, errores, metaAlcanzada, parqueRecuperado,
    jugadorX, jugadorY, racha,
    personaje: personajeElegido,
    pregunta: preguntaActual ? preguntaActual.tipo : null,
    residuoCargado: residuoCargado ? residuoCargado.nombre : null,
    residuos: residuos.map(r => ({ nombre: r.nombre, tipo: r.tipo, x: r.x, y: r.y }))
  })
});

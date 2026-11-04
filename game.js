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

// Extras: mejoras que agregamos además de lo que pide el documento.
const RACHA_PARA_BONO = 3;          // cada 3 aciertos seguidos sin errores...
const PUNTOS_BONO_RACHA = 5;        // ...dan 5 puntos extra
const SEGUNDOS_BONO_PREGUNTA = 5;   // acertar la pregunta rápida entre niveles regala 5 segundos


/* ===== 2. NIVELES, CANECAS Y RESIDUOS =====
   El juego pasa en nuestro colegio, la I.E. Ángela María Torres Suárez, durante la semana ambiental.
   Cada nivel es un lugar del colegio con la basura que de verdad se encuentra allí. */

// Tres niveles: fácil, intermedio y difícil (sección 15 del documento).
// "ocupado" son zonas con muebles donde no se ponen residuos: [x, y, ancho, alto].
const NIVELES = [
  {
    nombre: 'Fácil', zona: 'El salón', momento: 'después de clase', cantidad: 4, exterior: false,
    canecaIlumina: true, nombresVisibles: true, viento: false,
    ocupado: [[56, 220, 308, 90]],
    tituloLimpio: '¡El salón quedó impecable!',
    textoLimpio: 'Sonó la campana del descanso… y la tienda escolar se llenó de empaques.'
  },
  {
    nombre: 'Intermedio', zona: 'La tienda escolar', momento: 'en el descanso', cantidad: 5, exterior: true,
    canecaIlumina: false, nombresVisibles: true, viento: false,
    ocupado: [[36, 236, 308, 94]],
    novedad: '5 residuos del descanso y las canecas ya no se iluminan. ¡Ojo con los empaques brillantes!',
    tituloLimpio: '¡La tienda escolar quedó limpia!',
    textoLimpio: 'Terminó el partido del descanso y la cancha quedó llena de basura.'
  },
  {
    nombre: 'Difícil', zona: 'La cancha', momento: 'después del partido', cantidad: 6, exterior: true,
    canecaIlumina: false, nombresVisibles: false, viento: true,
    ocupado: [[28, 288, 116, 100]],
    novedad: '6 residuos que confunden: el mismo material cambia de caneca si está sucio o mojado. El viento los mueve y el nombre solo aparece al acercarte.'
  }
];
const TOTAL_RESIDUOS = NIVELES.reduce((suma, n) => suma + n.cantidad, 0);  // 15

// Canecas del punto ecológico con el código de colores de Colombia (Resolución 2184 de 2019).
const CANECAS = [
  { tipo: 'aprovechable',   nombre: 'BLANCA', x: 696, color: '#f1f4f0', oscuro: '#9aa8a2' },
  { tipo: 'organico',       nombre: 'VERDE',  x: 825, color: '#4caf68', oscuro: '#2a7643' },
  { tipo: 'noAprovechable', nombre: 'NEGRA',  x: 954, color: '#3d464c', oscuro: '#1f262b' }
];

// Cada residuo tiene: nombre, tipo (su caneca), dibujo, nivel en el que aparece
// y un dato que explica POR QUÉ va en esa caneca (se muestra al acertar y al equivocarse).
const RESIDUOS = [
  // Nivel 1 · El salón, después de clase
  { nombre: 'Hoja de cuaderno',      tipo: 'aprovechable',   dibujo: 'hoja',            nivel: 1, dato: 'El papel limpio y seco va en la blanca y se puede reciclar varias veces.' },
  { nombre: 'Fotocopias',            tipo: 'aprovechable',   dibujo: 'fotocopias',      nivel: 1, dato: 'Las fotocopias que ya no sirven son papel aprovechable: van en la blanca.' },
  { nombre: 'Botella de agua',       tipo: 'aprovechable',   dibujo: 'botella',         nivel: 1, dato: 'Las botellas plásticas vacías van en la blanca. ¡Mejor si las aplastas!' },
  { nombre: 'Cáscara de banano',     tipo: 'organico',       dibujo: 'banano',          nivel: 1, dato: 'Las cáscaras de la lonchera son orgánicas: van en la verde y se vuelven abono.' },
  { nombre: 'Cáscara de mandarina',  tipo: 'organico',       dibujo: 'mandarina',       nivel: 1, dato: 'Los restos de fruta son orgánicos: van en la verde.' },
  { nombre: 'Pañuelo usado',         tipo: 'noAprovechable', dibujo: 'panuelo',         nivel: 1, dato: 'Los pañuelos y el papel higiénico usados no se aprovechan: van en la negra.' },
  // Nivel 2 · La tienda escolar, en el descanso
  { nombre: 'Lata de gaseosa',       tipo: 'aprovechable',   dibujo: 'lata',            nivel: 2, dato: 'Las latas son metal aprovechable: vacías van en la blanca.' },
  { nombre: 'Caja de jugo',          tipo: 'aprovechable',   dibujo: 'cajaJugo',        nivel: 2, dato: 'Aunque tiene varias capas, la caja de jugo vacía es aprovechable: va en la blanca.' },
  { nombre: 'Paquete de papas',      tipo: 'noAprovechable', dibujo: 'paquetePapas',    nivel: 2, dato: 'Los empaques metalizados (papas, chitos) no se aprovechan: van en la negra.' },
  { nombre: 'Envoltura de chocolatina', tipo: 'noAprovechable', dibujo: 'chocolatina',  nivel: 2, dato: 'Las envolturas brillantes son metalizadas: van en la negra.' },
  { nombre: 'Servilleta con grasa',  tipo: 'noAprovechable', dibujo: 'servilletaGrasa', nivel: 2, dato: 'El papel sucio con comida ya no se puede reciclar: va en la negra.' },
  { nombre: 'Corazón de manzana',    tipo: 'organico',       dibujo: 'manzana',         nivel: 2, dato: 'Los restos de fruta son orgánicos: van en la verde.' },
  // Nivel 3 · La cancha, después del partido (residuos que confunden)
  { nombre: 'Botella de hidratante', tipo: 'aprovechable',   dibujo: 'bebida',          nivel: 3, dato: 'Vacía la botella: el plástico limpio y seco va en la blanca.' },
  { nombre: 'Caja de cartón limpia', tipo: 'aprovechable',   dibujo: 'caja',            nivel: 3, dato: 'El cartón limpio y seco va en la blanca. Aplástalo para que ocupe menos.' },
  { nombre: 'Caja de pizza con grasa', tipo: 'noAprovechable', dibujo: 'cajaPizza',     nivel: 3, dato: 'Si el cartón tiene grasa o comida ya no se aprovecha: va en la negra.' },
  { nombre: 'Periódico mojado',      tipo: 'noAprovechable', dibujo: 'periodicoMojado', nivel: 3, dato: 'El papel mojado pierde su valor para reciclar: va en la negra.' },
  { nombre: 'Cáscara de naranja',    tipo: 'organico',       dibujo: 'naranja',         nivel: 3, dato: 'Las cáscaras de las naranjas del medio tiempo van en la verde.' },
  { nombre: 'Restos de arroz',       tipo: 'organico',       dibujo: 'arroz',           nivel: 3, dato: 'Los restos de comida son orgánicos: van en la verde.' }
];

// Extra: pregunta rápida entre niveles, con residuos del colegio que no aparecen en los escenarios.
const PREGUNTAS = [
  { nombre: 'una tapa de gaseosa',              tipo: 'aprovechable',   dato: 'Las tapas plásticas limpias van en la blanca.' },
  { nombre: 'un cuaderno viejo',                tipo: 'aprovechable',   dato: 'El papel de los cuadernos viejos es aprovechable: va en la blanca.' },
  { nombre: 'un vaso de icopor con comida',     tipo: 'noAprovechable', dato: 'El icopor sucio con comida no se aprovecha: va en la negra.' },
  { nombre: 'un empaque de galletas',           tipo: 'noAprovechable', dato: 'Los empaques metalizados de galletas van en la negra.' },
  { nombre: 'la borra del tinto de los profes', tipo: 'organico',       dato: 'El café usado es orgánico: va en la verde y sirve de abono.' },
  { nombre: 'una cáscara de huevo de la lonchera', tipo: 'organico',    dato: 'Las cáscaras de huevo son orgánicas: van en la verde.' }
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
let colegioRecuperado = false;  // se vuelve true al limpiar los 3 niveles (el colegio queda limpio)

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

// Papelitos y migas en el piso: desaparecen poco a poco a medida que se limpia.
const PAPELITOS = Array.from({ length: 45 }, (_, i) => ({
  x: 20 + azar(i * 6.13 + 4) * (ANCHO - 40),
  y: 262 + azar(i * 3.7) * 310,
  tamano: 2 + azar(i * 1.7) * 3,
  giro: azar(i * 9.1) * Math.PI,
  color: ['#f4f1e6', '#e9d48a', '#d98b6a', '#b9c4c9'][i % 4],
  seLimpia: (i + 1) / 46        // porcentaje de limpieza con el que desaparece
}));

/* ===== 4. p5.js: setup() se ejecuta una vez y draw() 60 veces por segundo ===== */

function setup() {
  lienzo = createCanvas(ANCHO, ALTO);
  lienzo.parent('contenedorJuego');
  lienzo.elt.setAttribute('aria-label', 'Escenario del colegio. Muévete con las flechas o W A S D, o toca el suelo. E o espacio recoge y deposita.');
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
  colegioRecuperado = false;
  particulas = [];
  racha = 0;
  preguntas = shuffle(PREGUNTAS);

  prepararNivel(1);
  estado = 'jugando';
  mostrarPantalla(null);
  actualizarMarcador();
  avisar(`🌱 ¡Vamos, ${personaje().nombre}! Nivel 1 · Fácil: el salón, después de clase. Recoge un residuo y llévalo al punto ecológico.`);
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

// Elige al azar los residuos del nivel (al menos uno de cada tipo) y los ubica en el escenario.
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

// Busca un lugar en el piso que no tape las canecas, los muebles ni otro residuo.
function buscarLugarLibre(ocupados, numero) {
  const muebles = NIVELES[numero - 1].ocupado;
  for (let intento = 0; intento < 400; intento++) {
    const x = random(80, 980);
    const y = random(290, 512);
    const libre =
      !(x > 600 && y < 335) &&                              // frente al punto ecológico
      !muebles.some(([mx, my, ancho, alto]) => x > mx - 30 && x < mx + ancho + 30 && y > my - 30 && y < my + alto + 40) &&
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
    else avisar('🗑️ Acércate a una de las canecas del punto ecológico.');
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
  avisar(`🎒 Recogiste: ${residuo.nombre}. Llévalo al punto ecológico.${pista}`);
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
      mensaje = `🎯 ¡Llegaste a ${META_PUNTOS} puntos y ganaste! Limpia todo el colegio para ganar plata u oro.`;
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
    avisar(`❌ −${PUNTOS_POR_ERROR} puntos. No va en la ${caneca.nombre.toLowerCase()}. ${residuo.dato}`, true);
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
  avisar(`🏫 Nivel ${nivel} · ${n.nombre}: ${n.zona.toLowerCase()}, ${n.momento}.`);
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
    el('preguntaResultado').textContent = `❌ Va en la caneca ${caneca}. ${pregunta.dato}`;
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
   Victoria: alcanzar 100 puntos antes de que suene el timbre (regla 5).
   Derrota: que suene el timbre sin alcanzar la meta (GDD).
   Si además se limpian los 3 lugares, el colegio queda limpio y hay celebración. */

function terminarJuego(colegioLimpio) {
  if (estado === 'celebrando' || estado === 'final') return;
  destino = null;
  flechasTactiles.clear();
  if (colegioLimpio) {
    // Celebración: los papelitos desaparecen, sale el arcoíris y cae confeti antes de los resultados.
    colegioRecuperado = true;
    estado = 'celebrando';
    avisar('🏫 ¡El colegio quedó limpio! Cada residuo llegó al punto ecológico.');
    sonar(860, 0.22);
    setTimeout(() => sonar(1040, 0.35), 220);
    temporizadorCelebracion = setTimeout(() => mostrarResultados(true), 3500);
  } else {
    sonarTimbre();
    mostrarResultados(false);
  }
  actualizarMarcador();
}

function mostrarResultados(colegioLimpio) {
  estado = 'final';
  const gano = metaAlcanzada;
  const nombre = personaje().nombre;
  let icono, etiqueta, titulo, texto;
  if (gano && colegioLimpio) {
    [icono, etiqueta, titulo] = ['🏆', 'MISIÓN CUMPLIDA', `¡Colegio limpio, ${nombre}!`];
    texto = 'El salón, la tienda escolar y la cancha quedaron limpios, y cada residuo llegó a su caneca. ¡Eres un verdadero Guardián del Planeta!';
  } else if (gano) {
    [icono, etiqueta, titulo] = ['🎯', '¡GANASTE!', `¡Meta alcanzada, ${nombre}!`];
    texto = `Conseguiste ${META_PUNTOS} puntos antes del timbre, pero quedó basura en el colegio. ¡Límpialo todo para ganar plata u oro!`;
  } else if (colegioLimpio) {
    [icono, etiqueta, titulo] = ['🌱', '¡CASI LO LOGRAS!', '¡El colegio está limpio!'];
    texto = `Pero te faltaron puntos: necesitas ${META_PUNTOS}. Clasifica con cuidado para no perder puntos.`;
  } else {
    [icono, etiqueta, titulo] = ['🔔', '¡AÚN PUEDES MEJORAR!', '¡Sonó el timbre!'];
    texto = `Necesitas ${META_PUNTOS} puntos antes de que suene el timbre. ¡Inténtalo otra vez!`;
  }

  el('resultadoIcono').textContent = icono;
  el('resultadoEtiqueta').textContent = etiqueta;
  el('resultadoTitulo').textContent = titulo;
  el('resultadoTexto').textContent = texto;
  el('finalPuntos').textContent = puntos;
  el('finalResiduos').textContent = `${aciertos}/${TOTAL_RESIDUOS}`;
  el('finalErrores').textContent = errores;
  el('medalla').textContent = elegirMedalla(gano, colegioLimpio);

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
    .map(p => `<li><b>${p.nombre}</b> va en la caneca ${p.caneca}.</li>`)
    .join('');

  mostrarPantalla('pantallaResultados');
  actualizarMarcador();
  if (!colegioLimpio) {
    if (gano) { sonar(860, 0.22); setTimeout(() => sonar(1040, 0.35), 220); }
    else sonar(260, 0.25);
  }
}

// Medallas de reciclaje (sección 8 del documento).
function elegirMedalla(gano, colegioLimpio) {
  if (!gano) return '🌿 Cada intento es una oportunidad para aprender';
  if (colegioLimpio && errores === 0) return '🥇 Medalla de oro · Reciclaje perfecto';
  if (colegioLimpio) return '🥈 Medalla de plata · Colegio limpio';
  return '🥉 Medalla de bronce · Meta alcanzada';
}


/* ===== 7. MARCADOR Y PANTALLAS (HTML) ===== */

const PANTALLAS = ['pantallaInicio', 'pantallaPersonaje', 'pantallaInstrucciones', 'pantallaNivel', 'pantallaPausa', 'pantallaResultados'];
const PANTALLA_DEL_ESTADO = { inicio: 'pantallaInicio', pausa: 'pantallaPausa', entreNiveles: 'pantallaNivel', final: 'pantallaResultados' };

// Muestra una pantalla sobre el juego, o ninguna si id es null.
function mostrarPantalla(id) {
  el('capa').classList.toggle('oculta', id === null);
  el('capa').classList.toggle('capa-clara', id === 'pantallaResultados' && colegioRecuperado);
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
   Cada nivel es un lugar del colegio. Se dibuja una sola vez por nivel en una imagen aparte
   (createGraphics), así el juego no redibuja miles de detalles 60 veces por segundo.
   Las funciones con "c" usan el canvas normal de JavaScript (drawingContext),
   porque p5.js no trae degradados de color. */

function crearFondo(numero) {
  const g = createGraphics(ANCHO, ALTO);
  g.strokeJoin(ROUND);
  if (numero === 1) dibujarSalon(g);
  if (numero === 2) dibujarTiendaEscolar(g);
  if (numero === 3) dibujarCancha(g);
  dibujarPuntoEcologico(g);
  dibujarCartelDelNivel(g, numero);
  return g;
}

// Nivel 1: el salón de clase después de la última hora.
function dibujarSalon(g) {
  // Pared y zócalo
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 0, 0, 250, ['#f3ead2', '#e4d8b8']);
    c.fillRect(0, 0, ANCHO, 250);
  });
  rectangulo(0, 200, ANCHO, 50, 0, '#8fb9a0', null, g);
  rectangulo(0, 198, ANCHO, 5, 0, '#6e9c83', null, g);
  // Piso de baldosa
  g.noStroke();
  for (let fila = 0; fila < 7; fila++) {
    for (let col = 0; col < 15; col++) {
      g.fill((fila + col) % 2 ? '#d9d2c3' : '#cec6b4');
      g.rect(col * 80 - (fila % 2) * 40, 250 + fila * 50, 80, 50);
    }
  }
  g.stroke('#bdb4a1');
  g.strokeWeight(1.5);
  for (let y = 250; y < ALTO; y += 50) g.line(0, y, ANCHO, y);
  conContexto(g, c => {  // sombra de la pared sobre el piso
    c.fillStyle = degradadoLineal(c, 0, 250, 0, 290, ['#5a4a3040', '#5a4a3000']);
    c.fillRect(0, 250, ANCHO, 40);
  });
  // Tablero con el mensaje de la semana ambiental
  rectangulo(66, 66, 500, 132, 6, '#7a5a3a', null, g);
  rectangulo(76, 74, 480, 112, 4, '#2f5d4a', null, g);
  rectangulo(70, 184, 492, 8, 2, '#8b6a46', null, g);
  rectangulo(110, 178, 22, 6, 2, '#f4f1e6', null, g);  // tiza
  escribir('SEMANA AMBIENTAL', 316, 100, 22, '#eef3e8', CENTER, g);
  escribir('¡Separa en la fuente!', 316, 130, 16, '#d8e8d0', CENTER, g);
  escribir('Blanca', 236, 160, 15, '#ffffff', CENTER, g);
  escribir('Verde', 316, 160, 15, '#8fe0a0', CENTER, g);
  escribir('Negra', 396, 160, 15, '#a9b2b8', CENTER, g);
  // Reloj de pared
  ovalo(590, 42, 17, 17, '#ffffff', '#3d4a45', g);
  trazo([[590, 42], [590, 31]], '#2d3a35', 2, g);
  trazo([[590, 42], [598, 46]], '#2d3a35', 2, g);
  // Escritorio del profesor con libros y un globo terráqueo
  ovalo(210, 308, 165, 14, '#5a4a3038', null, g);
  rectangulo(70, 262, 16, 44, 2, '#7a5232', null, g);
  rectangulo(334, 262, 16, 44, 2, '#7a5232', null, g);
  rectangulo(96, 262, 228, 30, 3, '#8f6440', null, g);
  rectangulo(60, 246, 300, 18, 4, '#a57447', '#7a5232', g);
  rectangulo(108, 230, 44, 16, 2, '#c0504d', null, g);
  rectangulo(112, 220, 38, 11, 2, '#3f7fbf', null, g);
  trazo([[300, 246], [300, 236]], '#5d4a36', 3, g);
  ovalo(300, 224, 13, 13, '#4f9fd8', '#2e6f9f', g);
  ovalo(296, 220, 5, 4, '#6cc070', null, g);
}

// Nivel 2: la tienda escolar y el patio en el descanso.
function dibujarTiendaEscolar(g) {
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 0, 0, 80, ['#8cc8e0', '#c4e6ef']);
    c.fillRect(0, 0, ANCHO, 80);
  });
  // Fachada del colegio
  rectangulo(0, 62, ANCHO, 12, 0, '#b4553e', null, g);  // borde de teja
  rectangulo(0, 74, ANCHO, 176, 0, '#f0dca6', null, g);
  rectangulo(0, 205, ANCHO, 45, 0, '#4f8f6a', null, g);  // zócalo verde
  for (const x of [384, 488]) {                          // ventanas
    rectangulo(x, 96, 84, 74, 4, '#e8e2cf', '#8f8a7a', g);
    rectangulo(x + 6, 102, 72, 62, 2, '#9fd0e6', null, g);
    trazo([[x + 42, 102], [x + 42, 164]], '#e8e2cf', 4, g);
    trazo([[x + 6, 133], [x + 78, 133]], '#e8e2cf', 4, g);
  }
  // Jardinera con plantas
  for (let i = 0; i < 7; i++) ovalo(392 + i * 30, 212, 17, 15, i % 2 ? '#4fa45c' : '#3d8a4c', null, g);
  for (let i = 0; i < 5; i++) ovalo(404 + i * 40, 204, 4, 4, ['#ffd166', '#ff8fa3'][i % 2], null, g);
  rectangulo(372, 218, 212, 32, 4, '#b4553e', '#8d3f2d', g);
  // Piso del patio
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 250, 0, ALTO, ['#d3d6cf', '#b8bcb5']);
    c.fillRect(0, 250, ANCHO, ALTO - 250);
    c.fillStyle = degradadoLineal(c, 0, 250, 0, 285, ['#3a3a3038', '#3a3a3000']);
    c.fillRect(0, 250, ANCHO, 35);
  });
  g.stroke('#a9ada5');
  g.strokeWeight(1.5);
  for (let y = 310; y < ALTO; y += 70) g.line(0, y, ANCHO, y);
  for (let x = -260; x <= ANCHO + 260; x += 130) g.line(x, 250, 520 + (x - 520) * 1.35, ALTO);
  // Tienda escolar: estantes con mecato, toldo y mostrador
  rectangulo(40, 92, 300, 158, 6, '#fbf8ef', '#c9c2ad', g);
  const colores = ['#f2c230', '#d64545', '#3f8fd2', '#4caf68', '#ef8a3c'];
  for (const fila of [116, 154]) {
    for (let i = 0; i < 11; i++) rectangulo(62 + i * 24, fila, 18, 24, 3, colores[(i * 2 + fila) % 5], null, g);
    rectangulo(56, fila + 24, 268, 5, 1, '#8f6440', null, g);
  }
  for (let i = 0; i < 10; i++) {                         // toldo a rayas
    rectangulo(30 + i * 32, 84, 32, 22, 0, i % 2 ? '#f4f4f0' : '#d9443a', null, g);
    ovalo(46 + i * 32, 106, 16, 7, i % 2 ? '#f4f4f0' : '#d9443a', null, g);
  }
  rectangulo(108, 58, 164, 28, 8, '#2f6b4f', '#ffffff', g);
  escribir('TIENDA ESCOLAR', 190, 72, 13, '#ffffff', CENTER, g);
  ovalo(190, 332, 165, 12, '#3a3a3030', null, g);
  rectangulo(46, 254, 288, 74, 4, '#2f6b4f', '#244f3b', g);
  rectangulo(36, 238, 308, 18, 4, '#c98a4b', '#93602f', g);
  rectangulo(62, 268, 92, 48, 3, '#fdf6e3', null, g);  // tablero de precios
  for (const y of [280, 292, 304]) trazo([[70, y], [146, y]], '#9a8f78', 2, g);
}

// Nivel 3: la cancha múltiple después del partido del descanso.
function dibujarCancha(g) {
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 0, 0, 210, ['#79b9d6', '#cbe8ee']);
    c.fillRect(0, 0, ANCHO, 210);
    // Árboles detrás de la malla
    for (let i = 0; i < 9; i++) {
      const x = 30 + i * 125 + azar(i) * 30;
      c.fillStyle = '#6b5236';
      c.fillRect(x - 5, 150, 10, 60);
      ovaloDegradado(c, x, 140, 46 + azar(i * 2) * 14, 40, '#7bd08f', '#2f7a4f');
    }
  });
  ovalo(330, 46, 22, 22, '#fff6c8', null, g);  // sol
  // Muro bajo y malla
  rectangulo(0, 205, ANCHO, 45, 0, '#d8d1bd', null, g);
  g.stroke('#7d8a8588');
  g.strokeWeight(1);
  for (let x = -120; x < ANCHO; x += 16) {
    g.line(x, 205, x + 110, 95);
    g.line(x, 95, x + 110, 205);
  }
  for (let x = 10; x < ANCHO; x += 130) trazo([[x, 92], [x, 206]], '#5f6b66', 5, g);
  trazo([[0, 95], [ANCHO, 95]], '#5f6b66', 4, g);
  // Piso de la cancha con sus líneas
  rectangulo(0, 245, ANCHO, ALTO - 245, 0, '#c4673f', null, g);
  rectangulo(24, 260, ANCHO - 48, ALTO - 272, 0, '#3e8e74', null, g);
  g.noFill();
  g.stroke('#f2f5ef');
  g.strokeWeight(3);
  g.rect(40, 274, ANCHO - 80, ALTO - 300);
  g.line(520, 274, 520, ALTO - 26);
  g.ellipse(520, 416, 150, 100);
  g.arc(40, 416, 240, 190, -HALF_PI, HALF_PI);
  // Arco de microfútbol con su red
  ovalo(86, 386, 60, 8, '#00000030', null, g);
  g.stroke('#ffffff88');
  g.strokeWeight(1);
  for (let x = 44; x < 128; x += 10) g.line(x, 302, x, 382);
  for (let y = 308; y < 382; y += 10) g.line(42, y, 128, y);
  trazo([[38, 384], [38, 298], [130, 298], [130, 384]], '#ffffff', 6, g);
  // Balón
  ovalo(996, 534, 13, 13, '#ffffff', '#3a3a3a', g);
  poligono([[996, 528], [1002, 533], [999, 540], [993, 540], [990, 533]], '#3a3a3a', null, g);
}

// Escenario 2 del documento: el punto ecológico del colegio (las canecas se dibujan aparte).
function dibujarPuntoEcologico(g) {
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
  escribir('♻  PUNTO ECOLÓGICO', 203, 36, 15, '#f3fff0', CENTER, g);
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
  const limpieza = colegioRecuperado ? 1 : aciertos / TOTAL_RESIDUOS;  // de 0 (sucio) a 1 (limpio)
  dibujarSuciedad(limpieza);
  if (NIVELES[nivel - 1].exterior) dibujarVida(limpieza);
  dibujarCanecas();
  dibujarMarcaDestino();
  dibujarResiduosYJugador();
  dibujarAyudaCercana();
  dibujarParticulas();
  if (colegioRecuperado) dibujarConfeti();
}

// Al principio el lugar se ve opaco y con papelitos en el piso; se aclara con cada acierto.
function dibujarSuciedad(limpieza) {
  if (limpieza < 1) {
    noStroke();
    fill(110, 95, 60, 55 * (1 - limpieza));
    rect(0, 0, ANCHO, ALTO);
  }
  for (const p of PAPELITOS) {
    if (p.seLimpia <= limpieza) continue;
    push();
    translate(p.x, p.y);
    rotate(p.giro);
    rectangulo(-p.tamano, -p.tamano * 0.6, p.tamano * 2, p.tamano * 1.2, 1, p.color);
    pop();
  }
}

// Aves y mariposas en los lugares al aire libre; aparecen más a medida que se limpia.
function dibujarVida(limpieza) {
  if (colegioRecuperado) dibujarArcoiris();
  dibujarPajaro(458 + ((reloj * 6) % 120), 30, 0.7);
  dibujarPajaro(530 + ((reloj * 5) % 100), 46, 0.45);
  if (limpieza > 0.25) {
    dibujarMariposa(413 + sin(reloj * 0.45) * 24, 232, 0.57);
    dibujarMariposa(551 + sin(reloj * 0.6) * 21, 282, 0.42);
  }
  if (colegioRecuperado) {
    dibujarMariposa(250 + sin(reloj * 0.5) * 30, 300, 0.5);
    dibujarMariposa(760 + sin(reloj * 0.7) * 26, 470, 0.55);
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
  if (caneca.tipo === 'aprovechable') {
    escribir('♻', 0, 1, 30, '#4f6f66');
  } else if (caneca.tipo === 'organico') {
    ovalo(-4, 1, 12, 8, '#468a55');
    ovalo(7, -6, 11, 7, '#6daf6a');
    trazo([[-6, 10], [8, -8]], caneca.oscuro, 3);
  } else {
    // Bolsa de basura
    ovalo(0, 5, 13, 12, '#3a4248');
    poligono([[-6, -6], [0, -15], [6, -6]], '#3a4248');
    trazo([[-4, -9], [4, -9]], '#9aa3a8', 2);
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
    // ----- Caneca blanca: aprovechables limpios y secos -----
    case 'hoja':
      poligono([[-15, -15], [7, -19], [19, -6], [14, 17], [-16, 13]], '#fffdf2', '#7c9e9d');
      trazo([[-9, -5], [6, -7]], '#a5c6ce', 2);
      trazo([[-9, 2], [10, 1]], '#a5c6ce', 2);
      trazo([[-8, 9], [6, 9]], '#a5c6ce', 2);
      break;
    case 'fotocopias':
      rectangulo(-14, -18, 30, 36, 1, '#eeeeea', '#9aa3a8');
      rectangulo(-18, -14, 30, 36, 1, '#ffffff', '#7f8a90');
      for (const y of [-7, -2, 3, 8, 13]) trazo([[-13, y], [7, y]], '#6f7a80', 1.5);
      ovalo(-15, -11, 2, 2, '#9aa3a8');  // gancho de cosedora
      break;
    case 'botella':
      rectangulo(-8, -25, 16, 9, 2, '#62b4da', '#367994');
      rectangulo(-11, -17, 22, 37, 7, '#a8e5ec', '#4298b0');
      rectangulo(-9, -1, 18, 10, 2, '#ffffffb7');
      break;
    case 'lata':
      rectangulo(-11, -18, 22, 36, 5, '#d64545', '#8f2a2a');
      rectangulo(-11, -4, 22, 8, 0, '#f2f2f2');
      ovalo(0, -18, 11, 4, '#c9cfd4', '#8a9298');
      ovalo(-4, -18, 3, 1.5, '#6f777d');
      break;
    case 'cajaJugo':
      rectangulo(-12, -16, 24, 32, 3, '#ffd166', '#c9962a');
      rectangulo(-12, -16, 24, 7, 2, '#f4f4f4');
      ovalo(-2, 3, 7, 7, '#ef8a3c');
      trazo([[6, -16], [10, -28]], '#ffffff', 3);  // pitillo
      break;
    case 'bebida':
      rectangulo(-8, -25, 16, 9, 2, '#2c7be5', '#1b4f99');
      rectangulo(-11, -17, 22, 37, 7, '#7fd3f7', '#2a8cc0');
      rectangulo(-11, -4, 22, 12, 2, '#f25c54');
      break;
    case 'caja':
      rectangulo(-20, -13, 40, 27, 3, '#c99460', '#a87442');
      trazo([[0, -13], [0, 14]], '#a87442', 2);
      trazo([[-20, -4], [0, 0], [20, -4]], '#e3b682', 2);
      break;
    // ----- Caneca verde: orgánicos -----
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
    case 'naranja':
      fill('#f9ac4c');
      stroke('#cc7929');
      strokeWeight(2);
      arc(0, 0, 38, 38, 0.15, PI * 1.7, PIE);
      ovalo(0, 0, 12, 12, '#ffe09e');
      ovalo(3, 0, 4, 4, '#fff4bf');
      break;
    case 'mandarina':
      push();
      scale(0.8);
      dibujarArteResiduo('naranja');
      pop();
      ovalo(-12, -12, 5, 3, '#5aa05c');  // hojita
      break;
    case 'manzana':
      ovalo(0, -11, 11, 6, '#de7464', '#a94845');
      rectangulo(-6, -9, 12, 18, 5, '#fbefc9', '#d8c79a');
      ovalo(0, 11, 11, 6, '#de7464', '#a94845');
      rectangulo(-1.5, -22, 3, 7, 1, '#7d6e3b');
      ovalo(5, -20, 6, 3, '#68ad69');
      break;
    case 'arroz':
      ovalo(0, 8, 20, 6, '#00000018');
      for (let i = 0; i < 26; i++) ovalo(-14 + azar(i) * 28, -2 + azar(i * 3) * 11 - abs(azar(i) - 0.5) * 8, 2.6, 1.3, i % 4 ? '#fbf8ee' : '#e8dfc4');
      break;
    // ----- Caneca negra: no aprovechables (sucios, mojados o metalizados) -----
    case 'panuelo':
      poligono([[-16, -8], [-6, -16], [8, -12], [17, -2], [12, 12], [-4, 15], [-15, 8]], '#f7f7f4', '#b9bdb8');
      trazo([[-8, -6], [2, 0], [-2, 8]], '#d6d9d4', 2);
      trazo([[6, -6], [10, 4]], '#d6d9d4', 2);
      break;
    case 'paquetePapas':
      poligono([[-14, -20], [14, -20], [16, 18], [-16, 18]], '#f2c230', '#b38a12');
      rectangulo(-16, -22, 32, 5, 1, '#c9ced3');  // bordes metalizados
      rectangulo(-16, 16, 32, 5, 1, '#c9ced3');
      ovalo(0, 1, 9, 7, '#e8a23a');
      trazo([[-10, -12], [-4, -6]], '#ffffffaa', 3);  // brillo
      break;
    case 'chocolatina':
      poligono([[-20, -8], [-27, -13], [-27, 13], [-20, 8]], '#d4b13a');
      poligono([[20, -8], [27, -13], [27, 13], [20, 8]], '#d4b13a');
      rectangulo(-20, -8, 40, 16, 2, '#6b3e26', '#3f2416');
      trazo([[-12, -3], [8, -3]], '#f0d27a', 2);
      break;
    case 'servilletaGrasa':
      poligono([[-21, -13], [-4, -18], [15, -13], [23, 10], [3, 17], [-18, 11]], '#f2eee4', '#b8ad97');
      ovalo(-3, -1, 10, 6, '#c9a26a99');
      ovalo(9, 7, 6, 4, '#b8894f88');
      break;
    case 'cajaPizza':
      rectangulo(-24, -14, 48, 30, 3, '#d3a46b', '#93683b');
      ovalo(-9, 2, 9, 6, '#a8733699');
      ovalo(10, -5, 7, 5, '#a8733688');
      poligono([[4, 6], [19, 2], [14, 14]], '#f2c14e', '#c98a2a');  // pedazo de pizza
      break;
    case 'periodicoMojado':
      rectangulo(-21, -15, 42, 30, 2, '#dcd8cc', '#7f7c70');
      rectangulo(-17, -11, 34, 6, 1, '#59606b');
      for (const y of [-1, 4, 9]) trazo([[-17, y], [17, y]], '#9a978c', 2);
      ovalo(-7, 3, 10, 7, '#7fb2d988');  // manchas de agua
      ovalo(10, -3, 6, 5, '#7fb2d988');
      trazo([[-7, 10], [-7, 18]], '#7fb2d9', 2);
      break;
  }
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
  if (esperaPajaro > 6.5 && NIVELES[nivel - 1].exterior) {
    esperaPajaro = 0;
    sonar(1050, 0.24, 'sine', 0.018, 1600);
  }
}

// El timbre del colegio: suena cuando se acaba el tiempo.
function sonarTimbre() {
  for (let i = 0; i < 6; i++) setTimeout(() => sonar(i % 2 ? 660 : 880, 0.14, 'square', 0.03), i * 150);
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

  // Ratón o dedo sobre el escenario
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

// Convierte la posición del clic en la pantalla a coordenadas del escenario (1040 × 585).
function posicionEnLienzo(evento) {
  const borde = lienzo.elt.getBoundingClientRect();
  return {
    x: ((evento.clientX - borde.left) / borde.width) * ANCHO,
    y: ((evento.clientY - borde.top) / borde.height) * ALTO
  };
}

// Al tocar el escenario: si es un residuo, el personaje va a recogerlo; si es una caneca, va a depositar;
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
    estado, nivel, puntos, tiempo, aciertos, errores, metaAlcanzada, colegioRecuperado,
    jugadorX, jugadorY, racha,
    personaje: personajeElegido,
    pregunta: preguntaActual ? preguntaActual.tipo : null,
    residuoCargado: residuoCargado ? residuoCargado.nombre : null,
    residuos: residuos.map(r => ({ nombre: r.nombre, tipo: r.tipo, x: r.x, y: r.y }))
  })
});

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
    ocupado: [[30, 230, 320, 92], [20, 480, 160, 105], [870, 480, 170, 105]],  // escritorio y pupitres
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
  { tipo: 'aprovechable',   nombre: 'BLANCA', x: 696, claro: '#ffffff', color: '#e4e8e5', oscuro: '#a2ada8' },
  { tipo: 'organico',       nombre: 'VERDE',  x: 825, claro: '#72d494', color: '#2f9e55', oscuro: '#1b6536' },
  { tipo: 'noAprovechable', nombre: 'NEGRA',  x: 954, claro: '#6a737a', color: '#30373c', oscuro: '#15191c' }
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
   Para que se vea más real usamos perspectiva (el piso se junta hacia el fondo), texturas,
   luz y sombras suaves. Las funciones con "c" usan el canvas normal de JavaScript
   (drawingContext), porque p5.js no trae degradados de color. */

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
  g.background('#d8d0bf');
  // Pared pintada con textura y zócalo
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 0, 0, PISO_Y, ['#f1e8cf', '#ded1af']);
    c.fillRect(0, 0, ANCHO, PISO_Y);
    c.fillStyle = degradadoLineal(c, 0, 202, 0, PISO_Y, ['#86b59b', '#699880']);
    c.fillRect(0, 202, ANCHO, PISO_Y - 202);
  });
  textura(g, 0, 0, ANCHO, 200, 2600, '#ffffff22', '#7a6a4a14', 1);
  manchas(g, 0, 0, ANCHO, 190, 12, '#b9a77a12', 2);
  rectangulo(0, 198, ANCHO, 6, 0, '#5c8a72', null, g);
  // Piso de baldosa en perspectiva, con la luz que entra por las ventanas
  dibujarPisoDeBaldosas(g, 70, ['#ddd5c4', '#cdc4b0'], '#b1a893');
  luzEnElPiso(g, [[40, PISO_Y], [210, PISO_Y], [420, ALTO], [110, ALTO]], 0.16);
  luzEnElPiso(g, [[280, PISO_Y], [400, PISO_Y], [690, ALTO], [470, ALTO]], 0.12);
  sombraDeLaPared(g);
  dibujarCartelera(g);
  dibujarTablero(g);
  dibujarRelojDePared(g, 578, 46);
  dibujarEscritorioDelProfe(g);
  dibujarPupitre(g, 92, 528);
  dibujarPupitre(g, 952, 528);
}

function dibujarCartelera(g) {
  sombraSuave(76, 194, 62, 6, 0.25, g);
  rectanguloConVolumen(18, 72, 114, 116, 4, ['#93694a', '#6e4b30'], null, g);
  rectangulo(25, 79, 100, 102, 2, '#c99a63', null, g);
  textura(g, 25, 79, 100, 102, 520, '#ecc48e66', '#7a522866', 3);
  avisoClavado(g, 31, 86, 42, 34, -0.06, '#fffdf3');
  avisoClavado(g, 80, 90, 38, 28, 0.08, '#fff1a8');
  avisoClavado(g, 80, 128, 38, 44, -0.04, '#d8f0ff');
  // Bandera de Colombia en papel
  g.push();
  g.translate(32, 132);
  g.rotate(0.05);
  rectangulo(0, 0, 40, 13, 0, '#fcd116', null, g);
  rectangulo(0, 13, 40, 7, 0, '#003893', null, g);
  rectangulo(0, 20, 40, 7, 0, '#ce1126', null, g);
  g.pop();
  ovalo(52, 133, 2.5, 2.5, '#d64545', null, g);
}

function avisoClavado(g, x, y, ancho, alto, angulo, color) {
  g.push();
  g.translate(x, y);
  g.rotate(angulo);
  rectangulo(2, 2, ancho, alto, 1, '#00000022', null, g);
  rectangulo(0, 0, ancho, alto, 1, color, null, g);
  for (let i = 0; i < 3; i++) trazo([[5, 9 + i * 7], [ancho - 6, 9 + i * 7]], '#8a8f9a', 1.4, g);
  ovalo(ancho / 2, 3, 2.5, 2.5, '#d64545', null, g);
  g.pop();
}

function dibujarTablero(g) {
  sombraSuave(346, 200, 215, 8, 0.25, g);
  rectanguloConVolumen(146, 62, 400, 134, 5, ['#dfe3e5', '#a3aaae', '#cfd4d6'], null, g);  // marco de aluminio
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 70, 0, 188, ['#32634f', '#264c3f']);
    c.fillRect(154, 70, 384, 118);
  });
  for (let i = 0; i < 18; i++) {  // polvo de tiza que quedó al borrar
    const x = 165 + azar(i * 3) * 330;
    const y = 80 + azar(i * 4) * 98;
    g.stroke(255, 255, 255, 10 + azar(i) * 16);
    g.strokeWeight(6 + azar(i * 2) * 10);
    g.line(x, y, x + 30 + azar(i * 5) * 50, y + (azar(i * 6) - 0.5) * 8);
  }
  tiza(g, 'SEMANA AMBIENTAL', 346, 104, 22, '#f2f5ee');
  tiza(g, '¡Separa en la fuente!', 346, 134, 16, '#dbe8d4');
  tiza(g, 'Blanca', 270, 164, 15, '#ffffff');
  tiza(g, 'Verde', 346, 164, 15, '#97e3a6');
  tiza(g, 'Negra', 422, 164, 15, '#b3bcc2');
  rectanguloConVolumen(150, 188, 392, 8, 2, ['#c9cfd2', '#8e969a'], null, g);  // repisa
  rectangulo(186, 182, 20, 6, 2, '#f7f4ea', null, g);                            // tizas
  rectangulo(214, 183, 14, 5, 2, '#f2d2d8', null, g);
  rectanguloConVolumen(470, 179, 34, 10, 2, ['#4a5aa0', '#26305e'], null, g);   // borrador
}

function dibujarRelojDePared(g, x, y) {
  sombraSuave(x + 2, y + 3, 20, 20, 0.2, g);
  ovaloConVolumen(x, y, 18, 18, '#ffffff', '#c9cdd0', g);
  ovalo(x, y, 18, 18, '#00000000', '#3d4a45', g);
  for (let i = 0; i < 12; i++) {
    const a = (i * TWO_PI) / 12;
    trazo([[x + cos(a) * 13, y + sin(a) * 13], [x + cos(a) * 15, y + sin(a) * 15]], '#3d4a45', 1.5, g);
  }
  trazo([[x, y], [x, y - 11]], '#2d3a35', 2, g);
  trazo([[x, y], [x + 8, y + 4]], '#2d3a35', 2, g);
}

function dibujarEscritorioDelProfe(g) {
  sombraSuave(190, 320, 180, 16, 0.4, g);
  poligonoConVolumen([[52, 256], [326, 256], [340, 274], [40, 274]], ['#c99561', '#a5733f'], '#7a5232', g, true);
  rectanguloConVolumen(40, 274, 300, 42, 3, ['#956944', '#7a5232', '#5c3c24'], null, g);
  trazo([[52, 286], [328, 286]], '#5f3f26', 1.5, g);
  rectanguloConVolumen(176, 292, 28, 5, 2, ['#e6c47c', '#b8913f'], null, g);  // manija del cajón
  // Libros y globo terráqueo
  rectanguloConVolumen(96, 240, 46, 14, 2, ['#e0706a', '#a83f3b'], null, g);
  rectanguloConVolumen(100, 230, 40, 11, 2, ['#5b9ad8', '#2f6ea8'], null, g);
  trazo([[288, 262], [288, 250]], '#5d4a36', 3, g);
  ovaloConVolumen(288, 236, 14, 14, '#8fd0f5', '#2e6f9f', g);
  ovalo(284, 232, 5, 4, '#6cc070', null, g);
  ovalo(293, 241, 4, 3, '#6cc070', null, g);
}

// Pupitre visto desde atrás: tablero de madera y espaldar azul de la silla.
function dibujarPupitre(g, x, y) {
  sombraSuave(x, y + 52, 80, 12, 0.35, g);
  trazo([[x - 52, y + 6], [x - 48, y + 54]], '#5c6670', 5, g);
  trazo([[x + 52, y + 6], [x + 48, y + 54]], '#5c6670', 5, g);
  poligonoConVolumen([[x - 58, y - 10], [x + 58, y - 10], [x + 64, y + 4], [x - 64, y + 4]], ['#e0b884', '#b98a52'], '#8f6a3d', g, true);
  rectangulo(x - 64, y + 4, 128, 6, 2, '#8f6a3d', null, g);
  trazo([[x - 30, y + 30], [x - 30, y + 56]], '#5c6670', 4, g);
  trazo([[x + 30, y + 30], [x + 30, y + 56]], '#5c6670', 4, g);
  rectanguloConVolumen(x - 42, y + 12, 84, 26, 9, ['#5b9ad8', '#3a72b5', '#2a5690'], null, g);
}

// Nivel 2: la tienda escolar y el patio en el descanso.
function dibujarTiendaEscolar(g) {
  g.background('#c9ccc5');
  dibujarCielo(g, 82, ['#7fbedc', '#c6e6ef']);
  dibujarNubes(g, [[560, 22, 1], [880, 30, 0.8]]);
  // Tejado de barro
  for (let x = 0; x < ANCHO; x += 18) rectanguloConVolumen(x, 50, 18, 32, 8, ['#e08a63', '#b4553e', '#86392a'], null, g);
  // Fachada con textura y humedad abajo
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 80, 0, 205, ['#f3e1ae', '#e3cb8f']);
    c.fillRect(0, 80, ANCHO, 125);
    c.fillStyle = degradadoLineal(c, 0, 80, 0, 100, ['rgba(60,40,20,0.35)', 'rgba(60,40,20,0)']);
    c.fillRect(0, 80, ANCHO, 20);
    c.fillStyle = degradadoLineal(c, 0, 205, 0, PISO_Y, ['#5aa077', '#3f7c5b']);
    c.fillRect(0, 205, ANCHO, PISO_Y - 205);
  });
  textura(g, 0, 82, ANCHO, 168, 2400, '#ffffff22', '#6b552a18', 4);
  manchas(g, 0, 170, ANCHO, 30, 10, '#8a744a14', 5);
  for (const x of [384, 488]) dibujarVentanaConReja(g, x, 98);
  dibujarJardinera(g, 372, 218, 212);
  // Piso del patio: placas de cemento en perspectiva
  dibujarPisoDeBaldosas(g, 130, ['#cdd0c9', '#c3c6be'], '#a3a79f', 42);
  textura(g, 0, PISO_Y, ANCHO, ALTO - PISO_Y, 2600, '#ffffff22', '#4a4a4018', 6);
  manchas(g, 0, 300, ANCHO, 280, 10, '#6b6a5a12', 7);
  luzEnElPiso(g, [[600, PISO_Y], [1040, PISO_Y], [1040, ALTO], [760, ALTO]], 0.14);
  sombraDeLaPared(g, 0.34);
  dibujarTienda(g);
}

function dibujarCielo(g, alto, colores) {
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 0, 0, alto, colores);
    c.fillRect(0, 0, ANCHO, alto);
  });
}

function dibujarNubes(g, nubes) {
  for (const [x, y, e] of nubes) {
    ovalo(x - 26 * e, y + 6 * e, 34 * e, 12 * e, '#ffffffb0', null, g);
    ovalo(x, y, 30 * e, 16 * e, '#ffffffd0', null, g);
    ovalo(x + 28 * e, y + 6 * e, 34 * e, 11 * e, '#ffffffb8', null, g);
  }
}

function dibujarVentanaConReja(g, x, y) {
  sombraSuave(x + 44, y + 82, 46, 5, 0.2, g);
  rectanguloConVolumen(x, y, 88, 78, 3, ['#f4f1e6', '#d5d0c0'], '#9a9583', g);
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, x, y, x + 88, y + 78, ['#bfe3f2', '#7fb6cf', '#a9d4e6']);
    c.fillRect(x + 6, y + 6, 76, 66);
    c.fillStyle = 'rgba(255,255,255,0.35)';  // reflejo
    trazarPoligono(c, [[x + 14, y + 6], [x + 34, y + 6], [x + 14, y + 40]]);
    c.fill();
  });
  for (let i = 1; i < 8; i++) trazo([[x + 6 + i * 9.5, y + 6], [x + 6 + i * 9.5, y + 72]], '#3a3f44', 2, g);  // reja
  trazo([[x + 6, y + 39], [x + 82, y + 39]], '#3a3f44', 2.5, g);
}

function dibujarJardinera(g, x, y, ancho) {
  for (let i = 0; i < 8; i++) {
    ovaloConVolumen(x + 14 + i * 27, y - 8 - azar(i) * 6, 17, 15, i % 2 ? '#7ccf86' : '#5cb36a', '#2f6e3c', g);
  }
  for (let i = 0; i < 5; i++) ovalo(x + 30 + i * 40, y - 16, 4, 4, ['#ffd166', '#ff8fa3'][i % 2], null, g);
  rectanguloConVolumen(x, y, ancho, 32, 4, ['#c9674b', '#a5492f', '#7f3524'], null, g);
  for (let fila = 0; fila < 3; fila++) {   // ladrillos
    trazo([[x, y + 10 + fila * 10], [x + ancho, y + 10 + fila * 10]], '#7f352466', 1, g);
  }
}

function dibujarTienda(g) {
  // Pared interior con estantes de mecato
  rectanguloConVolumen(36, 92, 308, 150, 4, ['#fdfbf4', '#e6e0d0'], '#c9c2ad', g);
  const productos = [['#ffe27a', '#c99a12'], ['#f07a7a', '#a42f2f'], ['#7fbcf0', '#2f6ea8'], ['#8ad79a', '#2f8a4d'], ['#f8b77a', '#c26a24']];
  for (const fila of [112, 152]) {
    for (let i = 0; i < 9; i++) {
      const [claro, oscuro] = productos[(i * 2 + fila) % 5];
      rectanguloConVolumen(54 + i * 24, fila, 19, 26, 4, [claro, oscuro], null, g);
      rectangulo(57 + i * 24, fila + 9, 13, 7, 2, '#ffffffaa', null, g);  // etiqueta del paquete
    }
    rectanguloConVolumen(48, fila + 26, 230, 5, 1, ['#a8784e', '#7a5232'], null, g);
  }
  // Nevera con bebidas
  rectanguloConVolumen(282, 98, 56, 140, 5, ['#f4f6f6', '#cfd5d6', '#aeb6b8'], '#8f989a', g);
  rectangulo(288, 106, 44, 96, 3, '#cfe9f2', null, g);
  for (let fila = 0; fila < 3; fila++) {
    for (let i = 0; i < 4; i++) {
      rectanguloConVolumen(291 + i * 10, 112 + fila * 31, 8, 24, 3, [['#ff8a8a', '#c62828'], ['#9be7a8', '#2f8a4d'], ['#ffd27a', '#c98a12']][(i + fila) % 3], null, g);
    }
  }
  conContexto(g, c => {
    c.fillStyle = 'rgba(255,255,255,0.35)';
    trazarPoligono(c, [[292, 106], [306, 106], [292, 140]]);
    c.fill();
  });
  // Toldo a rayas
  for (let i = 0; i < 10; i++) {
    const colores = i % 2 ? ['#ffffff', '#e2e2dc'] : ['#e8574c', '#b8322a'];
    rectanguloConVolumen(30 + i * 32, 84, 32, 22, 0, colores, null, g);
    ovaloConVolumen(46 + i * 32, 106, 16, 7, colores[0], colores[1], g);
  }
  conContexto(g, c => {   // sombra del toldo sobre la pared
    c.fillStyle = degradadoLineal(c, 0, 108, 0, 128, ['rgba(40,30,20,0.25)', 'rgba(40,30,20,0)']);
    c.fillRect(36, 108, 308, 20);
  });
  rectanguloConVolumen(108, 58, 164, 28, 8, ['#3a8262', '#2f6b4f'], '#ffffff', g);
  escribir('TIENDA ESCOLAR', 190, 72, 13, '#ffffff', CENTER, g);
  // Mostrador
  sombraSuave(190, 334, 180, 14, 0.4, g);
  rectanguloConVolumen(28, 254, 326, 74, 4, ['#41936b', '#2f6b4f', '#24563f'], null, g);
  poligonoConVolumen([[30, 238], [350, 238], [356, 256], [24, 256]], ['#e0a466', '#b8793d'], '#93602f', g, true);
  rectanguloConVolumen(62, 268, 92, 48, 3, ['#fffbef', '#ece4cf'], null, g);  // tablero de precios
  for (const y of [280, 292, 304]) trazo([[70, y], [146, y]], '#9a8f78', 2, g);
  // Frasco de dulces sobre el mostrador
  ovaloConVolumen(310, 226, 15, 14, '#ffffffcc', '#bcd7e0aa', g);
  for (let i = 0; i < 6; i++) ovalo(302 + azar(i) * 16, 222 + azar(i * 2) * 10, 3, 3, ['#ff8fa3', '#ffd166', '#8fe0a0'][i % 3], null, g);
}

// Nivel 3: la cancha múltiple después del partido del descanso.
function dibujarCancha(g) {
  g.background('#c4673f');
  dibujarCielo(g, 210, ['#6fb2d2', '#cbe8ee']);
  conContexto(g, c => {   // brillo del sol
    const sol = c.createRadialGradient(330, 46, 4, 330, 46, 160);
    sol.addColorStop(0, 'rgba(255,250,220,0.95)');
    sol.addColorStop(0.15, 'rgba(255,240,190,0.5)');
    sol.addColorStop(1, 'rgba(255,240,190,0)');
    c.fillStyle = sol;
    c.fillRect(170, 0, 320, 210);
  });
  dibujarNubes(g, [[600, 40, 1], [860, 70, 0.8], [120, 90, 0.7]]);
  // Montañas a lo lejos
  g.noStroke();
  g.fill('#9fbdb3');
  g.beginShape();
  g.vertex(0, 150);
  for (let x = 0; x <= ANCHO; x += 40) g.vertex(x, 128 + sin(x * 0.01) * 18 + azar(x) * 10);
  g.vertex(ANCHO, 210);
  g.vertex(0, 210);
  g.endShape(CLOSE);
  // Árboles detrás de la malla
  conContexto(g, c => {
    for (let i = 0; i < 9; i++) {
      const x = 30 + i * 125 + azar(i) * 30;
      c.fillStyle = degradadoLineal(c, x - 6, 0, x + 6, 0, ['#8a6a46', '#5a4128']);
      c.fillRect(x - 6, 150, 12, 60);
      ovaloDegradado(c, x, 140, 48 + azar(i * 2) * 14, 42, '#8fdc9f', '#2a6f47');
    }
  });
  // Gradería de cemento
  for (let i = 0; i < 4; i++) {
    const y = 140 + i * 16;
    rectangulo(20 - i * 8, y, 280 + i * 16, 6, 0, '#e2e2da', null, g);
    rectanguloConVolumen(20 - i * 8, y + 6, 280 + i * 16, 10, 0, ['#c2c2b8', '#a5a59b'], null, g);
  }
  // Muro bajo y malla
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 205, 0, 245, ['#ddd6c3', '#c2baa4']);
    c.fillRect(0, 205, ANCHO, 40);
  });
  textura(g, 0, 205, ANCHO, 40, 700, '#ffffff22', '#5a503818', 8);
  g.stroke('#6d7a7588');
  g.strokeWeight(1);
  for (let x = -120; x < ANCHO; x += 14) {
    g.line(x, 205, x + 110, 95);
    g.line(x, 95, x + 110, 205);
  }
  for (let x = 10; x < ANCHO; x += 130) rectanguloConVolumen(x - 3, 90, 7, 118, 2, ['#9aa6a1', '#4f5a56'], null, g);
  rectanguloConVolumen(0, 92, ANCHO, 5, 2, ['#8a9691', '#5f6b66'], null, g);
  // Piso: borde de color ladrillo y superficie de la cancha en perspectiva
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, 245, 0, ALTO, ['#b85e38', '#cf7046']);
    c.fillRect(0, 245, ANCHO, ALTO - 245);
    c.fillStyle = degradadoLineal(c, 0, 260, 0, ALTO, ['#3f8a70', '#4a9a80']);
    trazarPoligono(c, [[xEnPerspectiva(26, 260), 260], [xEnPerspectiva(1014, 260), 260], [xEnPerspectiva(1014, ALTO), ALTO], [xEnPerspectiva(26, ALTO), ALTO]]);
    c.fill();
  });
  textura(g, 0, 260, ANCHO, ALTO - 260, 3000, '#ffffff1c', '#1a3a2e18', 9);
  manchas(g, 0, 290, ANCHO, 280, 12, '#d8e8cc10', 10);
  sombraDeLaPared(g, 0.3);
  // Líneas de la cancha (también en perspectiva)
  g.noFill();
  g.stroke('#f2f5efdd');
  g.strokeWeight(3);
  g.line(xEnPerspectiva(48, 276), 276, xEnPerspectiva(992, 276), 276);
  g.line(xEnPerspectiva(48, 276), 276, xEnPerspectiva(48, ALTO), ALTO);
  g.line(xEnPerspectiva(992, 276), 276, xEnPerspectiva(992, ALTO), ALTO);
  g.line(FUGA.x, 276, FUGA.x, ALTO);
  g.ellipse(FUGA.x, 430, 190, 86);
  g.arc(xEnPerspectiva(48, 430), 430, 300, 170, -HALF_PI, HALF_PI);
  // Arco de microfútbol con su red
  sombraSuave(88, 388, 64, 9, 0.35, g);
  g.stroke('#ffffff88');
  g.strokeWeight(1);
  for (let x = 44; x < 128; x += 10) g.line(x, 302, x, 382);
  for (let y = 308; y < 382; y += 10) g.line(42, y, 128, y);
  trazo([[38, 384], [38, 298], [130, 298], [130, 384]], '#d9dcda', 7, g);
  trazo([[37, 384], [37, 297], [129, 297], [129, 384]], '#ffffff', 4, g);
  // Balón
  sombraSuave(998, 548, 16, 5, 0.4, g);
  ovaloConVolumen(996, 534, 13, 13, '#ffffff', '#b9bec2', g);
  poligono([[996, 528], [1002, 533], [999, 540], [993, 540], [990, 533]], '#2f3438', null, g);
}

// Escenario 2 del documento: el punto ecológico del colegio (las canecas se dibujan aparte).
function dibujarPuntoEcologico(g) {
  sombraSuave(830, 238, 235, 24, 0.35, g);
  g.push();
  g.translate(622, 59);
  rectanguloConVolumen(6, 60, 395, 120, 8, ['#347a62', '#2a6551', '#235646'], null, g);  // panel trasero
  textura(g, 6, 60, 395, 120, 420, '#ffffff12', '#00000014', 11);
  for (let i = 0; i < 5; i++) {                                                             // columnas metálicas
    rectanguloConVolumen(13 + i * 92, 56, 10, 126, 3, ['#b5c6bf', '#6f8a7f', '#3f5a4e'], null, g);
  }
  poligonoConVolumen([[-10, 55], [37, 9], [377, 9], [417, 55]], ['#45967a', '#2b6a53', '#1f4f3e'], null, g, true);
  rectanguloConVolumen(-10, 52, 427, 10, 3, ['#2d6a54', '#1c4537'], null, g);
  conContexto(g, c => {   // sombra del techo
    c.fillStyle = degradadoLineal(c, 0, 62, 0, 92, ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']);
    c.fillRect(6, 62, 395, 30);
  });
  rectanguloConVolumen(118, 20, 170, 26, 8, ['#ffffff', '#e4ece6'], '#1f5a44', g);
  escribir('♻ PUNTO ECOLÓGICO', 203, 33, 13, '#1f5a44', CENTER, g);
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
  dibujarLuz();
  dibujarAyudaCercana();
  dibujarParticulas();
  if (colegioRecuperado) dibujarConfeti();
}

// Al principio el lugar se ve opaco y con papelitos en el piso; se aclara con cada acierto.
function dibujarSuciedad(limpieza) {
  if (limpieza < 1) {
    noStroke();
    fill(110, 95, 60, 40 * (1 - limpieza));
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

// Caneca con volumen: cuerpo con luz y sombra, tapa, agarradera, pedal y etiqueta.
function dibujarCaneca(caneca, iluminada) {
  push();
  translate(caneca.x, 192 + (iluminada ? sin(reloj * 6) * 1.5 : 0));
  sombraSuave(0, 40, 56, 12, 0.55);
  if (iluminada) ovalo(0, -6, 62 + sin(reloj * 5) * 3, 66 + sin(reloj * 5) * 3, '#fffbc770');
  const colores = [caneca.claro, caneca.color, caneca.oscuro];
  poligonoConVolumen([[-35, -40], [35, -40], [30, 38], [-30, 38]], colores);   // cuerpo (más angosto abajo)
  trazo([[-24, -30], [-21, 30]], '#00000014', 3);                             // relieve lateral
  trazo([[24, -30], [21, 30]], '#ffffff14', 3);
  poligonoConVolumen([[-37, -52], [37, -52], [41, -43], [-41, -43]], colores, null, pantalla, true);  // tapa
  rectanguloConVolumen(-41, -44, 82, 7, 3, [caneca.color, caneca.oscuro]);
  rectangulo(-11, -50, 22, 4, 2, '#00000030');                                 // agarradera
  rectanguloConVolumen(-9, 35, 18, 6, 2, ['#5b6268', '#2a2f33']);              // pedal
  rectangulo(-22, -27, 44, 40, 6, '#ffffffee', '#00000020');                    // etiqueta
  push();
  translate(0, -7);
  scale(0.85);
  dibujarSimboloCaneca(caneca);
  pop();
  const e = min(escalaTexto, 1.3);
  rectangulo(-49 * e, 51, 98 * e, 24 * e, 9, '#fbfff3f2');
  escribir(caneca.nombre, 0, 51 + 12 * e, 12 * e, '#275443');
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
  if (accion) burbuja(esPantallaTactil ? `👆 ${accion}` : `E · ${accion}`, jugadorX, jugadorY - 185 * escalaPorProfundidad(jugadorY));
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
  const escala = escalaPorProfundidad(r.y);
  const levantar = resaltado ? abs(sin(reloj * 4)) * 3 : 0;  // salta un poco cuando está cerca
  sombraSuave(r.x, r.y + 12 * escala, 27 * escala, 8 * escala, 0.5);
  if (resaltado) ovalo(r.x, r.y - 4, 38 * escala, 34 * escala, '#fff8b440');
  push();
  translate(r.x, r.y - 2 - levantar);
  scale(escala);
  rotate(0.1 * sin(r.semilla));
  dibujarArteResiduo(r.dibujo);
  pop();
  if (NIVELES[nivel - 1].nombresVisibles || resaltado) etiqueta(r.nombre, r.x, r.y + 38 * escala);
}

// Dibuja cada residuo alrededor del punto (0, 0), con luz arriba a la izquierda.
function dibujarArteResiduo(dibujo) {
  switch (dibujo) {
    // ----- Caneca blanca: aprovechables limpios y secos -----
    case 'hoja':
      poligonoConVolumen([[-15, -15], [7, -19], [19, -6], [14, 17], [-16, 13]], ['#ffffff', '#f4f2ea', '#e2dfd2'], '#9fb3b2');
      trazo([[-9, -5], [6, -7]], '#a5c6ce', 2);
      trazo([[-9, 2], [10, 1]], '#a5c6ce', 2);
      trazo([[-8, 9], [6, 9]], '#a5c6ce', 2);
      trazo([[-12, -16], [-12, 14]], '#e8a0a0', 1.2);  // margen del cuaderno
      break;
    case 'fotocopias':
      rectanguloConVolumen(-14, -18, 30, 36, 1, ['#f2f2ee', '#dcdcd6'], '#9aa3a8');
      rectanguloConVolumen(-18, -14, 30, 36, 1, ['#ffffff', '#ecece6'], '#7f8a90');
      for (const y of [-7, -2, 3, 8, 13]) trazo([[-13, y], [7, y]], '#6f7a80', 1.5);
      ovalo(-15, -11, 2, 2, '#9aa3a8');  // gancho de cosedora
      break;
    case 'botella':
      dibujarBotella(['#e4f7fbcc', '#9fdbe8cc', '#5aaec4cc'], ['#7cc6e6', '#2f7ea6'], '#ffffffd0');
      break;
    case 'bebida':
      dibujarBotella(['#b8ecffcc', '#62c4ef', '#2a8cc0'], ['#4f94ef', '#1b4f99'], '#f25c54');
      break;
    case 'lata':
      rectanguloConVolumen(-11, -18, 22, 36, 5, ['#ff9a9a', '#d23a3a', '#8e1d1d', '#c84545'], '#7a1414');
      rectanguloConVolumen(-11, -4, 22, 8, 0, ['#ffffff', '#d9d9d9']);
      ovaloConVolumen(0, -18, 11, 4, '#f4f6f8', '#8a9298');
      ovalo(-4, -18, 3, 1.5, '#6f777d');
      trazo([[-6, -14], [-6, 14]], '#ffffff66', 2);  // brillo metálico
      break;
    case 'cajaJugo':
      dibujarCaja(-12, -14, 22, 30, 7, ['#ffe08a', '#f7c548'], '#d9a42a', '#fff2c4');
      rectangulo(-12, -14, 22, 6, 1, '#f4f4f4');
      ovaloConVolumen(-1, 4, 7, 7, '#ffb36b', '#e0702a');
      trazo([[4, -18], [9, -30]], '#ffffff', 3);  // pitillo
      break;
    case 'caja':
      dibujarCaja(-20, -10, 34, 24, 9, ['#d9a56c', '#c08a50'], '#9a6a38', '#e6bd88');
      trazo([[-3, -10], [-3, 14]], '#c9b48a', 4);  // cinta
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
      noFill();
      stroke('#fff3b0');
      strokeWeight(2);
      arc(1, -6, 34, 30, 0.6, 2.4);  // brillo
      ovalo(22, -12, 3, 3, '#5e4a2a');
      ovalo(-6, 6, 2, 1.5, '#8a6a2a');
      ovalo(6, 7, 1.5, 1.2, '#8a6a2a');
      break;
    case 'naranja':
      fill('#f9ac4c');
      stroke('#cc7929');
      strokeWeight(2);
      arc(0, 0, 38, 38, 0.15, PI * 1.7, PIE);
      ovaloConVolumen(0, 0, 13, 13, '#fff2c4', '#ffcf7a');
      for (let i = 0; i < 6; i++) trazo([[0, 0], [cos(i) * 11, sin(i) * 11]], '#f7b95e', 1);
      break;
    case 'mandarina':
      push();
      scale(0.8);
      dibujarArteResiduo('naranja');
      pop();
      ovalo(-12, -12, 5, 3, '#5aa05c');  // hojita
      break;
    case 'manzana':
      ovaloConVolumen(0, -11, 11, 6, '#f29a8c', '#b84a40');
      rectanguloConVolumen(-6, -9, 12, 18, 5, ['#fff7da', '#efdfb2']);
      ovaloConVolumen(0, 11, 11, 6, '#f29a8c', '#b84a40');
      ovalo(-1, 0, 1.5, 2.5, '#5e4a2a');  // semilla
      rectangulo(-1.5, -22, 3, 7, 1, '#7d6e3b');
      ovalo(5, -20, 6, 3, '#68ad69');
      break;
    case 'arroz':
      ovalo(0, 8, 20, 6, '#00000018');
      for (let i = 0; i < 26; i++) ovalo(-14 + azar(i) * 28, -2 + azar(i * 3) * 11 - abs(azar(i) - 0.5) * 8, 2.6, 1.3, i % 4 ? '#fbf8ee' : '#e0d6b8');
      break;
    // ----- Caneca negra: no aprovechables (sucios, mojados o metalizados) -----
    case 'panuelo':
      poligonoConVolumen([[-16, -8], [-6, -16], [8, -12], [17, -2], [12, 12], [-4, 15], [-15, 8]], ['#ffffff', '#ecece6', '#cfd2cc'], '#b9bdb8');
      trazo([[-8, -6], [2, 0], [-2, 8]], '#cfd2cc', 2);
      trazo([[6, -6], [10, 4]], '#cfd2cc', 2);
      break;
    case 'paquetePapas':
      poligonoConVolumen([[-14, -20], [14, -20], [16, 18], [-16, 18]], ['#fff3b0', '#f2c230', '#b38a12', '#f7d35c'], '#9a7410');
      rectanguloConVolumen(-16, -23, 32, 5, 1, ['#f4f6f8', '#9aa3aa', '#e0e4e8']);  // bordes metalizados
      rectanguloConVolumen(-16, 16, 32, 5, 1, ['#f4f6f8', '#9aa3aa', '#e0e4e8']);
      ovaloConVolumen(0, 1, 9, 7, '#ffd27a', '#c9782a');
      trazo([[-10, -14], [-5, -7]], '#ffffffcc', 3);  // brillo
      trazo([[8, -16], [6, 12]], '#a8780f66', 1.5);    // arrugas
      break;
    case 'chocolatina':
      poligonoConVolumen([[-20, -8], [-27, -13], [-27, 13], [-20, 8]], ['#fff0a8', '#d4b13a', '#9a7a1a']);
      poligonoConVolumen([[20, -8], [27, -13], [27, 13], [20, 8]], ['#fff0a8', '#d4b13a', '#9a7a1a']);
      rectanguloConVolumen(-20, -8, 40, 16, 2, ['#9a6040', '#6b3e26', '#3f2416'], '#3f2416');
      trazo([[-12, -3], [8, -3]], '#f0d27a', 2);
      break;
    case 'servilletaGrasa':
      poligonoConVolumen([[-21, -13], [-4, -18], [15, -13], [23, 10], [3, 17], [-18, 11]], ['#ffffff', '#f2eee4', '#ddd6c6'], '#b8ad97');
      ovalo(-3, -1, 10, 6, '#c9a26a88');
      ovalo(9, 7, 6, 4, '#b8894f77');
      ovalo(-12, 6, 4, 3, '#b8894f55');
      break;
    case 'cajaPizza':
      poligonoConVolumen([[-24, -10], [20, -10], [26, -4], [-18, -4]], ['#ebc18f', '#d3a46b'], null, pantalla, true);  // canto
      rectanguloConVolumen(-26, -4, 52, 22, 3, ['#e0b07a', '#c9955a', '#a8743f'], '#8a5f30');
      ovalo(-10, 6, 9, 5, '#8a5a2a77');   // grasa
      ovalo(10, 2, 7, 4, '#8a5a2a66');
      poligonoConVolumen([[2, 12], [20, 6], [16, 18]], ['#ffd977', '#f2a83e'], '#c98a2a');  // pedazo de pizza
      ovalo(13, 11, 2, 2, '#d64545');
      break;
    case 'periodicoMojado':
      rectanguloConVolumen(-21, -15, 42, 30, 2, ['#e6e3d8', '#d2cec1', '#b9b5a8'], '#7f7c70');
      rectangulo(-17, -11, 34, 6, 1, '#59606b');
      for (const y of [-1, 4, 9]) trazo([[-17, y], [17, y]], '#9a978c', 2);
      ovaloConVolumen(-7, 3, 10, 7, '#9cc4e2aa', '#5f8fb588');  // manchas de agua
      ovaloConVolumen(10, -3, 6, 5, '#9cc4e2aa', '#5f8fb588');
      trazo([[-7, 10], [-7, 19]], '#7fb2d9', 2);
      break;
  }
}

// Botella plástica transparente con tapa, etiqueta y reflejo.
function dibujarBotella(cuerpo, tapa, etiqueta) {
  rectanguloConVolumen(-7, -26, 14, 8, 2, tapa);
  poligonoConVolumen([[-6, -18], [6, -18], [11, -10], [11, 18], [-11, 18], [-11, -10]], cuerpo, '#4a9ab088');
  rectangulo(-11, -2, 22, 10, 1, etiqueta);
  trazo([[-6, -10], [-6, 14]], '#ffffffaa', 2.5);   // reflejo
  trazo([[-11, 10], [11, 7]], '#4a9ab066', 1.5);    // arruga de botella aplastada
}

// Caja en 3D: cara del frente, costado (más oscuro) y tapa (más clara).
function dibujarCaja(x, y, ancho, alto, fondo, frente, costado, arriba) {
  poligono([[x, y], [x + fondo, y - fondo * 0.6], [x + ancho + fondo, y - fondo * 0.6], [x + ancho, y]], arriba);
  poligono([[x + ancho, y], [x + ancho + fondo, y - fondo * 0.6], [x + ancho + fondo, y + alto - fondo * 0.6], [x + ancho, y + alto]], costado);
  rectanguloConVolumen(x, y, ancho, alto, 1, frente, '#00000033');
}

// El personaje elegido. Usa los colores de su ropa (PERSONAJES) y, si tiene foto, su cara.
function dibujarJugador() {
  const p = personaje();
  const paso = jugadorCamina && estado === 'jugando' ? sin(pasoJugador) : 0;
  const r = jugadorCamina ? abs(paso) * 3 : sin(reloj * 1.9) * 0.8;  // rebote del cuerpo
  const tieneFoto = p.imagen && p.imagen.complete && p.imagen.naturalWidth > 0;
  push();
  translate(jugadorX, jugadorY);
  scale(escalaPorProfundidad(jugadorY));  // más pequeño al fondo, más grande adelante
  sombraSuave(2, 3, 42, 11, 0.55);

  push();
  scale(jugadorMiraA, 1);  // mira a la izquierda o a la derecha
  // Piernas y zapatos
  trazo([[-9, -24], [-11 + paso * 7, -2]], p.pantalon, 10);
  trazo([[9, -24], [11 - paso * 7, -2]], p.sombraPantalon, 10);
  ovalo(-13 + paso * 7, 2, 12, 5, p.zapatos, p.suela);
  ovalo(12 - paso * 7, 2, 12, 5, p.zapatos, p.suela);
  // Mochila de guardián
  rectanguloConVolumen(-31, -82 + r, 20, 50, 8, ['#ebc27a', '#c9964a', '#8f6a3a'], '#705e40');
  rectanguloConVolumen(-27, -48 + r, 15, 19, 5, ['#b8884f', '#8f6a3a']);
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
  rectanguloConVolumen(-19, -83 + r, 38, 61, 13, [p.camisa, p.camisa, p.sombraCamisa], p.sombraCamisa);
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

// ----- Ayudas para que el dibujo se vea más real -----

// Perspectiva: las líneas del piso se juntan en un punto de fuga lejano, como en una foto.
const PISO_Y = 250;                    // donde la pared toca el piso
const FUGA = { x: 520, y: -380 };      // punto de fuga (fuera de la pantalla, arriba)

// Dónde queda, a la altura y, una línea que en la pared empieza en xEnLaPared.
function xEnPerspectiva(xEnLaPared, y) {
  return FUGA.x + ((xEnLaPared - FUGA.x) * (y - FUGA.y)) / (PISO_Y - FUGA.y);
}

// Filas del piso: cada fila es un poco más alta que la anterior (más cerca = más grande).
function filasDelPiso(altoInicial) {
  const filas = [];
  for (let y = PISO_Y, alto = altoInicial; y < ALTO; y += alto, alto *= 1.14) filas.push(y);
  filas.push(ALTO);
  return filas;
}

// Lo que está al fondo se ve más pequeño y lo que está adelante, más grande.
function escalaPorProfundidad(y) {
  return constrain(0.86 + ((y - LIMITES.arriba) / (LIMITES.abajo - LIMITES.arriba)) * 0.26, 0.86, 1.12);
}

function dibujarPisoDeBaldosas(g, ancho, colores, colorJunta, altoInicial = 30) {
  const filas = filasDelPiso(altoInicial);
  conContexto(g, c => {
    for (let f = 0; f < filas.length - 1; f++) {
      const y0 = filas[f];
      const y1 = filas[f + 1];
      for (let x = -900; x < ANCHO + 900; x += ancho) {
        const k = Math.round((x + 900) / ancho);
        c.fillStyle = colores[(f + k) % 2];
        c.globalAlpha = 0.9 + azar(f * 31 + k) * 0.1;  // cada baldosa con un tono un poco distinto
        c.beginPath();
        c.moveTo(xEnPerspectiva(x, y0), y0);
        c.lineTo(xEnPerspectiva(x + ancho, y0), y0);
        c.lineTo(xEnPerspectiva(x + ancho, y1), y1);
        c.lineTo(xEnPerspectiva(x, y1), y1);
        c.closePath();
        c.fill();
      }
    }
    c.globalAlpha = 1;
    c.strokeStyle = colorJunta;
    c.lineWidth = 1.2;
    for (const y of filas) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(ANCHO, y);
      c.stroke();
    }
    for (let x = -900; x < ANCHO + 900; x += ancho) {
      c.beginPath();
      c.moveTo(xEnPerspectiva(x, PISO_Y), PISO_Y);
      c.lineTo(xEnPerspectiva(x, ALTO), ALTO);
      c.stroke();
    }
  });
}

// Textura: puntitos claros y oscuros que imitan pintura, cemento o corcho.
function textura(g, x, y, ancho, alto, cantidad, claro, oscuro, semilla = 1) {
  g.noStroke();
  for (let i = 0; i < cantidad; i++) {
    g.fill(i % 2 ? claro : oscuro);
    g.rect(x + azar(i * 1.37 + semilla) * ancho, y + azar(i * 2.71 + semilla) * alto,
      1 + azar(i * 3.1 + semilla) * 2, 1 + azar(i * 4.3 + semilla) * 2);
  }
}

// Manchas suaves (humedad, desgaste, mugre).
function manchas(g, x, y, ancho, alto, cantidad, color, semilla = 1) {
  for (let i = 0; i < cantidad; i++) {
    ovalo(x + azar(i * 5.1 + semilla) * ancho, y + azar(i * 6.7 + semilla) * alto,
      10 + azar(i * 7.3 + semilla) * 40, 5 + azar(i * 8.9 + semilla) * 18, color, null, g);
  }
}

// Sombra difuminada en el piso (oscura en el centro y transparente en el borde).
function sombraSuave(x, y, radioX, radioY, opacidad = 0.35, g = pantalla) {
  conContexto(g, c => {
    c.translate(x, y);
    c.scale(1, radioY / radioX);
    const d = c.createRadialGradient(0, 0, 0, 0, 0, radioX);
    d.addColorStop(0, `rgba(25,22,15,${opacidad})`);
    d.addColorStop(1, 'rgba(25,22,15,0)');
    c.fillStyle = d;
    c.beginPath();
    c.arc(0, 0, radioX, 0, Math.PI * 2);
    c.fill();
  });
}

// Mancha de luz que entra por una ventana (más fuerte arriba, se desvanece abajo).
function luzEnElPiso(g, puntos, opacidad) {
  const ys = puntos.map(p => p[1]);
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, Math.min(...ys), 0, Math.max(...ys),
      [`rgba(255,246,214,${opacidad})`, 'rgba(255,246,214,0)']);
    trazarPoligono(c, puntos);
    c.fill();
  });
}

// Sombra donde la pared toca el piso.
function sombraDeLaPared(g, opacidad = 0.28) {
  conContexto(g, c => {
    c.fillStyle = degradadoLineal(c, 0, PISO_Y, 0, PISO_Y + 45, [`rgba(60,45,25,${opacidad})`, 'rgba(60,45,25,0)']);
    c.fillRect(0, PISO_Y, ANCHO, 45);
  });
}

function trazarPoligono(c, puntos) {
  c.beginPath();
  puntos.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
}

function caminoRedondeado(c, x, y, ancho, alto, radio) {
  const r = Math.min(radio, ancho / 2, alto / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + ancho, y, x + ancho, y + alto, r);
  c.arcTo(x + ancho, y + alto, x, y + alto, r);
  c.arcTo(x, y + alto, x, y, r);
  c.arcTo(x, y, x + ancho, y, r);
  c.closePath();
}

// Rectángulo con volumen: degradado de la luz (izquierda) a la sombra (derecha).
function rectanguloConVolumen(x, y, ancho, alto, radio, colores, borde = null, g = pantalla) {
  conContexto(g, c => {
    caminoRedondeado(c, x, y, ancho, alto, radio);
    c.fillStyle = degradadoLineal(c, x, 0, x + ancho, 0, colores);
    c.fill();
    if (borde) {
      c.strokeStyle = borde;
      c.lineWidth = 1.5;
      c.stroke();
    }
  });
}

// Polígono con volumen. Si vertical es true, la luz va de arriba hacia abajo.
function poligonoConVolumen(puntos, colores, borde = null, g = pantalla, vertical = false) {
  const xs = puntos.map(p => p[0]);
  const ys = puntos.map(p => p[1]);
  conContexto(g, c => {
    trazarPoligono(c, puntos);
    c.fillStyle = vertical
      ? degradadoLineal(c, 0, Math.min(...ys), 0, Math.max(...ys), colores)
      : degradadoLineal(c, Math.min(...xs), 0, Math.max(...xs), 0, colores);
    c.fill();
    if (borde) {
      c.strokeStyle = borde;
      c.lineWidth = 1.5;
      c.stroke();
    }
  });
}

// Óvalo con brillo arriba a la izquierda (se ve redondo, como una esfera).
function ovaloConVolumen(x, y, radioX, radioY, claro, oscuro, g = pantalla) {
  conContexto(g, c => ovaloDegradado(c, x, y, radioX, radioY, claro, oscuro));
}

// Texto escrito con tiza: dos capas un poco corridas para que se vea gastado.
function tiza(g, texto, x, y, tamano, color) {
  escribir(texto, x + 0.8, y + 0.6, tamano, color + '55', CENTER, g);
  escribir(texto, x, y, tamano, color + 'dd', CENTER, g);
}

// Viñeta: oscurece un poco los bordes de la pantalla, como en una cámara.
function dibujarLuz() {
  conContexto(pantalla, c => {
    const v = c.createRadialGradient(ANCHO / 2, ALTO * 0.55, 260, ANCHO / 2, ALTO * 0.55, 720);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(10,14,12,0.38)');
    c.fillStyle = v;
    c.fillRect(0, 0, ANCHO, ALTO);
  });
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

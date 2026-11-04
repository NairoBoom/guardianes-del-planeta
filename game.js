/* =========================================================================
   GUARDIANES DEL PLANETA · Videojuego educativo 3D (Proyecto STEAM, grado 11)
   Autores: Cristian López y Juan Noriega

   Tecnología (sección 16 del documento):
     - HTML (index.html): estructura de las pantallas.
     - CSS (style.css): colores, botones y diseño.
     - JavaScript (este archivo): reglas, puntuación, niveles y controles.
     - Librería Three.js (escena3d.js): dibuja el colegio en 3D con luces y sombras.
   Three.js está guardado en libreria/ para que el juego funcione sin internet.

   Este archivo NO dibuja: guarda el estado del juego (puntos, tiempo, posición
   del jugador…) y escena3d.js lo convierte en imágenes 3D en cada cuadro.

   Contenido de este archivo:
      1. Reglas del juego (y extras)
      2. Niveles, canecas, residuos, preguntas y personajes
      3. Variables del juego
      4. Inicio y ciclo del juego
      5. Lógica: niveles, movimiento, recoger y clasificar
      6. Fin del juego y medallas
      7. Marcador y pantallas (HTML)
      8. Sonidos
      9. Controles: teclado, ratón, pantalla táctil y botones
     10. Funciones de ayuda
   ========================================================================= */


/* ===== 1. REGLAS DEL JUEGO (sección 7 del documento) ===== */

const PUNTOS_INICIALES = 0;     // Regla 1: el jugador comienza con cero puntos.
const PUNTOS_POR_ACIERTO = 10;  // Regla 2: cada residuo correcto vale 10 puntos.
const PUNTOS_POR_ERROR = 5;     // Regla 3: cada residuo mal clasificado resta 5 puntos.
const TIEMPO_TOTAL = 60;        // Regla 4: 60 segundos para completar el reto.
const META_PUNTOS = 100;        // Regla 5: gana al alcanzar 100 puntos antes de que termine el tiempo.

// Mapa del juego: la lógica usa un plano de 1040 × 585 (como una hoja vista desde arriba).
// escena3d.js convierte estas medidas a metros para el mundo 3D (50 unidades = 1 metro).
const ANCHO = 1040;
const ALTO = 585;
const VELOCIDAD_JUGADOR = 300;                 // unidades por segundo (6 metros por segundo)
const INICIO_JUGADOR = { x: 535, y: 330 };
const LIMITES = { izquierda: 30, derecha: 1012, arriba: 240, abajo: 552 };  // zona por donde camina el personaje
const DISTANCIA_PARA_RECOGER = 75;
const DISTANCIA_PARA_DEPOSITAR = 95;
const Y_DEPOSITO = 240;                        // donde se para el personaje frente a las canecas
const Y_CANECAS = 192;                         // donde están las canecas del punto ecológico

// Extras: mejoras que agregamos además de lo que pide el documento.
const RACHA_PARA_BONO = 3;          // cada 3 aciertos seguidos sin errores...
const PUNTOS_BONO_RACHA = 5;        // ...dan 5 puntos extra
const SEGUNDOS_BONO_PREGUNTA = 5;   // acertar la pregunta rápida entre niveles regala 5 segundos


/* ===== 2. NIVELES, CANECAS Y RESIDUOS =====
   El juego pasa en nuestro colegio, la I.E. Ángela María Torres Suárez, durante la semana ambiental.
   Cada nivel es un lugar del colegio con la basura que de verdad se encuentra allí. */

// Tres niveles: fácil, intermedio y difícil (sección 15 del documento).
// "ocupado" son los muebles: [x, y, ancho, alto]. No se ponen residuos ahí y el personaje no los atraviesa.
const NIVELES = [
  {
    nombre: 'Fácil', zona: 'El salón', momento: 'después de clase', cantidad: 4, exterior: false,
    canecaIlumina: true, nombresVisibles: true, viento: false,
    ocupado: [[44, 246, 296, 66], [40, 478, 120, 70], [882, 478, 120, 70]],  // escritorio y pupitres
    tituloLimpio: '¡El salón quedó impecable!',
    textoLimpio: 'Sonó la campana del descanso… y la tienda escolar se llenó de empaques.'
  },
  {
    nombre: 'Intermedio', zona: 'La tienda escolar', momento: 'en el descanso', cantidad: 5, exterior: true,
    canecaIlumina: false, nombresVisibles: true, viento: false,
    ocupado: [[36, 236, 310, 90]],  // mostrador de la tienda
    novedad: '5 residuos del descanso y las canecas ya no se iluminan. ¡Ojo con los empaques brillantes!',
    tituloLimpio: '¡La tienda escolar quedó limpia!',
    textoLimpio: 'Terminó el partido del descanso y la cancha quedó llena de basura.'
  },
  {
    nombre: 'Difícil', zona: 'La cancha', momento: 'después del partido', cantidad: 6, exterior: true,
    canecaIlumina: false, nombresVisibles: false, viento: true,
    ocupado: [[24, 296, 60, 100]],  // arco de microfútbol
    novedad: '6 residuos que confunden: el mismo material cambia de caneca si está sucio o mojado. El viento los mueve y el nombre solo aparece al acercarte.'
  }
];
const TOTAL_RESIDUOS = NIVELES.reduce((suma, n) => suma + n.cantidad, 0);  // 15

// Canecas del punto ecológico con el código de colores de Colombia (Resolución 2184 de 2019).
const CANECAS = [
  { tipo: 'aprovechable',   nombre: 'BLANCA', x: 696, color: '#e8ecea' },
  { tipo: 'organico',       nombre: 'VERDE',  x: 825, color: '#2f9e55' },
  { tipo: 'noAprovechable', nombre: 'NEGRA',  x: 954, color: '#2a3034' }
];

// Cada residuo tiene: nombre, tipo (su caneca), dibujo (su modelo 3D), nivel en el que aparece
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

// Extra: personajes que se pueden elegir. Cristian y Juan llevan la foto de su cara (assets/personajes/caras.js);
// Eco es el personaje del documento (sección 9) y su cabeza se arma en 3D.
const PERSONAJES = [
  {
    id: 'cristian', nombre: 'Cristian', nombreCompleto: 'Cristian López', descripcion: 'Estudiante guardián',
    retrato: 'assets/personajes/cristian-retrato.jpg', cara: CARAS.cristian, estilo: 'polo',
    piel: '#a8724e', camisa: '#f5f7f4', detalle: '#f5f7f4', pantalon: '#6f96c8', zapatos: '#1d2124'
  },
  {
    id: 'juan', nombre: 'Juan', nombreCompleto: 'Juan Noriega', descripcion: 'Estudiante guardián',
    retrato: 'assets/personajes/juan-retrato.jpg', cara: CARAS.juan, estilo: 'uniforme',
    piel: '#c89068', camisa: '#eef1f6', detalle: '#1f2a44', pantalon: '#1f2a44', zapatos: '#22252a'
  },
  {
    id: 'eco', nombre: 'Eco', nombreCompleto: 'Eco', descripcion: 'Personaje del documento',
    retrato: 'assets/personajes/eco-retrato.jpg', cara: null, estilo: 'chaqueta',
    piel: '#e7ad88', camisa: '#e99e45', detalle: '#3d9a75', pantalon: '#243e43', zapatos: '#f3e3c3'
  }
];


/* ===== 3. VARIABLES DEL JUEGO (sección 19 del documento) ===== */

let puntos = PUNTOS_INICIALES;  // guarda el puntaje
let tiempo = TIEMPO_TOTAL;      // segundos que quedan
let jugadorX = INICIO_JUGADOR.x;    // posición horizontal del personaje
let jugadorY = INICIO_JUGADOR.y;    // posición del personaje hacia el fondo o hacia adelante

let nivel = 1;                  // nivel actual: 1, 2 o 3
let estado = 'inicio';          // 'inicio', 'jugando', 'pausa', 'entreNiveles', 'celebrando' o 'final'
let residuos = [];              // residuos que siguen en el suelo
let residuoCargado = null;      // residuo que el personaje lleva en la mano
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
let pasoJugador = 0;            // avance de la animación de caminar
let residuoSenalado = null;     // residuo que está bajo el puntero del ratón
const teclasPresionadas = new Set();
const flechasTactiles = new Set();  // flechas presionadas en los controles táctiles

let reloj = 0;                  // segundos desde que se abrió la página (para animaciones)
let ultimoCuadro = null;
let esPantallaTactil = false;
let sonidoActivo = true;
let contextoAudio = null;
let origenInstrucciones = 'inicio';
let temporizadorAviso = null;
let temporizadorCelebracion = null;
let tiempoMostrado = '';
let esperaPaso = 0;
let esperaPajaro = 0;


/* ===== 4. INICIO Y CICLO DEL JUEGO ===== */

window.addEventListener('DOMContentLoaded', iniciar);

function iniciar() {
  esPantallaTactil = window.matchMedia('(pointer: coarse)').matches;
  if (!PERSONAJES.some(p => p.id === personajeElegido)) personajeElegido = 'cristian';

  // escena3d.js crea el mundo 3D. Si el navegador no tiene WebGL, se avisa y no se sigue.
  if (!iniciarEscena3D(el('contenedorJuego'))) {
    el('contenedorJuego').insertAdjacentHTML('afterbegin',
      '<p class="sin-js">Este navegador no puede mostrar gráficos 3D (WebGL). Prueba con Chrome, Edge o Firefox actualizados.</p>');
    return;
  }
  prepararNivel(1);
  crearTarjetasPersonajes();
  conectarControles();
  mostrarRecord();
  actualizarMarcador();
  requestAnimationFrame(cicloDelJuego);
}

// Se ejecuta unas 60 veces por segundo: actualiza el juego y dibuja la escena.
function cicloDelJuego(ahora) {
  if (ultimoCuadro === null) ultimoCuadro = ahora;
  const dt = Math.min((ahora - ultimoCuadro) / 1000, 0.1);  // segundos desde el cuadro anterior (máximo 0.1)
  ultimoCuadro = ahora;
  reloj += dt;
  if (estado === 'jugando') actualizarJuego(dt);
  dibujarCuadro(dt);  // escena3d.js
  requestAnimationFrame(cicloDelJuego);
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
  racha = 0;
  preguntas = mezclar(PREGUNTAS);

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
  construirNivel3D(numero);  // escena3d.js: arma el lugar del colegio y pone los residuos
}

// Elige al azar los residuos del nivel (al menos uno de cada tipo) y los ubica en el escenario.
function elegirResiduos(numero) {
  const posibles = mezclar(RESIDUOS.filter(r => r.nivel === numero));
  const elegidos = CANECAS.map(caneca => posibles.find(r => r.tipo === caneca.tipo));
  for (const r of posibles) {
    if (elegidos.length < NIVELES[numero - 1].cantidad && !elegidos.includes(r)) elegidos.push(r);
  }
  const ocupados = [];
  return elegidos.map(r => {
    const lugar = buscarLugarLibre(ocupados, numero);
    ocupados.push(lugar);
    return { ...r, x: lugar.x, y: lugar.y, xInicial: lugar.x, semilla: aleatorio(0, 100) };
  });
}

// Busca un lugar en el piso que no tape las canecas, los muebles ni otro residuo.
function buscarLugarLibre(ocupados, numero) {
  const muebles = NIVELES[numero - 1].ocupado;
  for (let intento = 0; intento < 400; intento++) {
    const x = aleatorio(80, 980);
    const y = aleatorio(290, 512);
    const libre =
      !(x > 600 && y < 335) &&                              // frente al punto ecológico
      !muebles.some(([mx, my, ancho, alto]) => x > mx - 40 && x < mx + ancho + 40 && y > my - 40 && y < my + alto + 45) &&
      distancia(x, y, INICIO_JUGADOR.x, INICIO_JUGADOR.y) > 110 &&
      ocupados.every(o => distancia(x, y, o.x, o.y) > 125);
    if (libre) return { x, y };
  }
  return { x: 470 + ocupados.length * 90, y: 500 };  // plan B (casi nunca se usa)
}

function actualizarJuego(dt) {
  tiempo = Math.max(0, tiempo - dt);
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
    const falta = distancia(jugadorX, jugadorY, destino.x, destino.y);
    if (falta <= VELOCIDAD_JUGADOR * dt + 1) {
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
  const nuevoX = limitar(jugadorX + (dx / largo) * VELOCIDAD_JUGADOR * dt, LIMITES.izquierda, LIMITES.derecha);
  const nuevoY = limitar(jugadorY + (dy / largo) * VELOCIDAD_JUGADOR * dt, LIMITES.arriba, LIMITES.abajo);
  // Los muebles son sólidos: se avanza en cada eje solo si no hay un mueble.
  const puedeX = !chocaConMuebles(nuevoX, jugadorY);
  const puedeY = !chocaConMuebles(jugadorX, nuevoY);
  if (puedeX) jugadorX = nuevoX;
  if (puedeY) jugadorY = nuevoY;
  if (!puedeX && !puedeY) destino = null;  // quedó atascado contra un mueble
  pasoJugador += dt * 11;
}

function chocaConMuebles(x, y) {
  return NIVELES[nivel - 1].ocupado.some(([mx, my, ancho, alto]) =>
    x > mx - 14 && x < mx + ancho + 14 && y > my - 6 && y < my + alto + 10);
}

// Nivel difícil: el viento mueve los residuos de un lado a otro.
function moverConElViento() {
  for (const r of residuos) {
    r.x = limitar(r.xInicial + Math.sin(reloj * 0.7 + r.semilla) * 28, LIMITES.izquierda + 20, LIMITES.derecha - 20);
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
    const d = distancia(jugadorX, jugadorY, r.x, r.y);
    if (d < menor) { menor = d; elegido = r; }
  }
  return elegido;
}

function canecaMasCercana() {
  let elegida = null;
  let menor = DISTANCIA_PARA_DEPOSITAR;
  for (const c of CANECAS) {
    const d = distancia(jugadorX, jugadorY, c.x, Y_DEPOSITO);
    if (d < menor) { menor = d; elegida = c; }
  }
  return elegida;
}

function recoger(residuo) {
  if (estado !== 'jugando' || residuoCargado || !residuos.includes(residuo)) return;
  if (distancia(jugadorX, jugadorY, residuo.x, residuo.y) > DISTANCIA_PARA_RECOGER) return;
  residuoCargado = residuo;
  residuos = residuos.filter(r => r !== residuo);
  const pista = NIVELES[nivel - 1].canecaIlumina ? ' La caneca correcta se ilumina.' : '';
  avisar(`🎒 Recogiste: ${residuo.nombre}. Llévalo al punto ecológico.${pista}`);
  lanzarParticulas(residuo.x, residuo.y, 0.3, 8, 'hoja');
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
    // Acierto: suma puntos y el residuo entra en la caneca.
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
    lanzarParticulas(caneca.x, Y_CANECAS, 1.4, 28, 'estrella');
    sonar(660, 0.09);
    setTimeout(() => sonar(840, 0.11), 100);
    actualizarMarcador();
    if (residuos.length === 0) completarNivel();
  } else {
    // Error: resta puntos y el residuo sigue en la mano para intentarlo otra vez.
    puntos -= PUNTOS_POR_ERROR;
    errores++;
    racha = 0;
    const correcta = CANECAS.find(c => c.tipo === residuo.tipo);
    if (!paraRepasar.some(p => p.nombre === residuo.nombre)) {
      paraRepasar.push({ nombre: residuo.nombre, caneca: correcta.nombre.toLowerCase() });
    }
    avisar(`❌ −${PUNTOS_POR_ERROR} puntos. No va en la ${caneca.nombre.toLowerCase()}. ${residuo.dato}`, true);
    lanzarParticulas(caneca.x, Y_CANECAS, 1.2, 12, 'hoja');
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
  teclasPresionadas.clear();
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


/* ===== 8. SONIDOS ===== */

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


/* ===== 9. CONTROLES: TECLADO, RATÓN, PANTALLA TÁCTIL Y BOTONES ===== */

// Teclas de cada dirección: flechas y letras W A S D.
const TECLAS = {
  izquierda: ['arrowleft', 'a'], derecha: ['arrowright', 'd'],
  arriba: ['arrowup', 'w'], abajo: ['arrowdown', 's']
};

function direccionPresionada(direccion) {
  return flechasTactiles.has(direccion) || TECLAS[direccion].some(tecla => teclasPresionadas.has(tecla));
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
  document.addEventListener('keyup', evento => teclasPresionadas.delete(evento.key.toLowerCase()));

  // Ratón o dedo sobre la escena 3D
  const lienzo = obtenerLienzo3D();
  lienzo.addEventListener('pointerdown', alTocarEscena);
  lienzo.addEventListener('pointermove', alMoverPuntero);
  lienzo.addEventListener('pointerleave', () => { residuoSenalado = null; });

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
  if (estado === 'jugando') teclasPresionadas.add(tecla);
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

// Al tocar la escena: si es un residuo, el personaje va a recogerlo; si es una caneca, va a depositar;
// si es el piso, camina hasta allí. escena3d.js averigua qué hay debajo del dedo o del ratón.
function alTocarEscena(evento) {
  if (estado !== 'jugando') return;
  evento.preventDefault();
  const toque = queHayEn(evento);
  if (!toque) return;
  if (toque.residuo && !residuoCargado) {
    destino = { x: toque.residuo.x, y: toque.residuo.y, residuo: toque.residuo };
    return;
  }
  if (toque.caneca) {
    if (!residuoCargado) avisar('🎒 Primero recoge un residuo.');
    else destino = { x: toque.caneca.x, y: Y_DEPOSITO, caneca: toque.caneca };
    return;
  }
  destino = {
    x: limitar(toque.x, LIMITES.izquierda, LIMITES.derecha),
    y: limitar(toque.y, LIMITES.arriba, LIMITES.abajo)
  };
}

function alMoverPuntero(evento) {
  const toque = queHayEn(evento);
  residuoSenalado = toque && toque.residuo ? toque.residuo : null;
  obtenerLienzo3D().style.cursor = estado === 'jugando' ? 'pointer' : 'default';
}


/* ===== 10. FUNCIONES DE AYUDA ===== */

function el(id) {
  return document.getElementById(id);
}

function aleatorio(minimo, maximo) {
  return minimo + Math.random() * (maximo - minimo);
}

// Devuelve una copia de la lista en orden aleatorio.
function mezclar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function distancia(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
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

// Guarda y lee datos en este navegador (personaje elegido y récord).
// Si el navegador no lo permite, el juego sigue funcionando sin guardar.
function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (error) { /* sin almacenamiento */ }
}

function leerGuardado(clave) {
  try { return JSON.parse(localStorage.getItem(clave)); } catch (error) { return null; }
}

// Solo lectura: permite revisar el estado del juego desde la consola del navegador (F12).
window.GuardianesDelPlaneta = Object.freeze({
  estado: () => ({
    estado, nivel, puntos, tiempo, aciertos, errores, metaAlcanzada, colegioRecuperado,
    jugadorX, jugadorY, racha,
    personaje: personajeElegido,
    pregunta: preguntaActual ? preguntaActual.tipo : null,
    residuoCargado: residuoCargado ? residuoCargado.nombre : null,
    destino: destino ? { x: destino.x, y: destino.y, caneca: destino.caneca ? destino.caneca.nombre : null } : null,
    residuos: residuos.map(r => ({ nombre: r.nombre, tipo: r.tipo, x: r.x, y: r.y }))
  })
});

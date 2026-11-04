// Guardianes del Planeta
// Proyecto STEAM grado 11 - Cristian López y Juan Noriega
// Juego hecho con p5.js

// ----- Reglas -----
const TIEMPO_TOTAL = 60;
const META = 100;
const PUNTOS_ACIERTO = 10;
const PUNTOS_ERROR = 5;
const VELOCIDAD = 4;

// ----- Datos del juego -----
const niveles = [
  { nombre: 'Fácil', lugar: 'El salón', cantidad: 4, pista: true, verNombres: true },
  { nombre: 'Intermedio', lugar: 'La tienda escolar', cantidad: 5, pista: false, verNombres: true },
  { nombre: 'Difícil', lugar: 'La cancha', cantidad: 6, pista: false, verNombres: false }
];

// Código de colores de Colombia (Resolución 2184 de 2019)
const canecas = [
  { tipo: 'blanca', nombre: 'BLANCA', x: 560, color: '#f2f2f2', letra: '#333333' },
  { tipo: 'verde', nombre: 'VERDE', x: 680, color: '#3c9a4f', letra: '#ffffff' },
  { tipo: 'negra', nombre: 'NEGRA', x: 800, color: '#333333', letra: '#ffffff' }
];

const residuos = [
  // nivel 1: el salón
  { nombre: 'Hoja de cuaderno', tipo: 'blanca', nivel: 1, forma: 'papel', color: '#ffffff', dato: 'El papel limpio y seco va en la blanca.' },
  { nombre: 'Fotocopias', tipo: 'blanca', nivel: 1, forma: 'papel', color: '#e8e8e8', dato: 'Las fotocopias son papel aprovechable, van en la blanca.' },
  { nombre: 'Botella de agua', tipo: 'blanca', nivel: 1, forma: 'botella', color: '#bfe6f0', dato: 'Las botellas plásticas vacías van en la blanca.' },
  { nombre: 'Cáscara de banano', tipo: 'verde', nivel: 1, forma: 'cascara', color: '#f2d14a', dato: 'Las cáscaras son orgánicas, van en la verde.' },
  { nombre: 'Cáscara de mandarina', tipo: 'verde', nivel: 1, forma: 'cascara', color: '#f39a2e', dato: 'Los restos de fruta van en la verde.' },
  { nombre: 'Pañuelo usado', tipo: 'negra', nivel: 1, forma: 'bolsa', color: '#f4f4f0', dato: 'Los pañuelos usados no se aprovechan, van en la negra.' },
  // nivel 2: la tienda escolar
  { nombre: 'Lata de gaseosa', tipo: 'blanca', nivel: 2, forma: 'lata', color: '#d23a3a', dato: 'Las latas vacías son aprovechables, van en la blanca.' },
  { nombre: 'Caja de jugo', tipo: 'blanca', nivel: 2, forma: 'caja', color: '#ffd166', dato: 'La caja de jugo vacía es aprovechable, va en la blanca.' },
  { nombre: 'Paquete de papas', tipo: 'negra', nivel: 2, forma: 'bolsa', color: '#f2c230', dato: 'Los empaques metalizados no se aprovechan, van en la negra.' },
  { nombre: 'Envoltura de chocolatina', tipo: 'negra', nivel: 2, forma: 'bolsa', color: '#6b3e26', dato: 'Las envolturas brillantes van en la negra.' },
  { nombre: 'Servilleta con grasa', tipo: 'negra', nivel: 2, forma: 'papel', color: '#e8d9b8', dato: 'El papel sucio de comida no se recicla, va en la negra.' },
  { nombre: 'Corazón de manzana', tipo: 'verde', nivel: 2, forma: 'cascara', color: '#d8473f', dato: 'Los restos de fruta van en la verde.' },
  // nivel 3: la cancha
  { nombre: 'Botella de hidratante', tipo: 'blanca', nivel: 3, forma: 'botella', color: '#62c4ef', dato: 'Vacía la botella y va en la blanca.' },
  { nombre: 'Caja de cartón limpia', tipo: 'blanca', nivel: 3, forma: 'caja', color: '#c99460', dato: 'El cartón limpio y seco va en la blanca.' },
  { nombre: 'Caja de pizza con grasa', tipo: 'negra', nivel: 3, forma: 'caja', color: '#a8743f', dato: 'Si el cartón tiene grasa ya no se recicla, va en la negra.' },
  { nombre: 'Periódico mojado', tipo: 'negra', nivel: 3, forma: 'papel', color: '#b9c4cc', dato: 'El papel mojado no se puede reciclar, va en la negra.' },
  { nombre: 'Cáscara de naranja', tipo: 'verde', nivel: 3, forma: 'cascara', color: '#f39a2e', dato: 'Las cáscaras de naranja van en la verde.' },
  { nombre: 'Restos de arroz', tipo: 'verde', nivel: 3, forma: 'cascara', color: '#f7f3e6', dato: 'Los restos de comida van en la verde.' }
];

const personajes = {
  cristian: { nombre: 'Cristian', camisa: '#f5f5f5', pantalon: '#6f96c8' },
  juan: { nombre: 'Juan', camisa: '#eef1f6', pantalon: '#1f2a44' }
};

// ----- Variables -----
let puntos = 0;
let tiempo = TIEMPO_TOTAL;
let jugadorX = 300;
let jugadorY = 400;
let nivel = 1;
let estado = 'inicio';   // inicio, jugando, entreNiveles, final
let enElPiso = [];       // residuos que faltan por recoger
let enLaMano = null;     // residuo que lleva el jugador
let aciertos = 0;
let errores = 0;
let equivocados = [];
let personaje = 'cristian';
let caras = {};
let botones = { izquierda: false, derecha: false, arriba: false, abajo: false };

function preload() {
  caras.cristian = loadImage(CARAS.cristian);
  caras.juan = loadImage(CARAS.juan);
}

function setup() {
  let lienzo = createCanvas(900, 500);
  lienzo.parent('juego');
  textFont('Arial');
  conectarBotones();
}

function draw() {
  dibujarFondo();
  dibujarPuntoEcologico();
  dibujarResiduos();
  dibujarJugador();

  if (estado === 'jugando') {
    moverJugador();
    tiempo = tiempo - deltaTime / 1000;
    if (tiempo <= 0) {
      tiempo = 0;
      terminarJuego();
    }
  }
  actualizarMarcador();
}

// ----- Juego -----
function empezar(quien) {
  personaje = quien;
  puntos = 0;
  tiempo = TIEMPO_TOTAL;
  aciertos = 0;
  errores = 0;
  equivocados = [];
  iniciarNivel(1);
  estado = 'jugando';
  mostrarPantalla(null);
  mostrarMensaje('Nivel 1: el salón. Recoge un residuo y llévalo al punto ecológico.');
}

function iniciarNivel(n) {
  nivel = n;
  enLaMano = null;
  jugadorX = 300;
  jugadorY = 400;
  enElPiso = [];

  let lista = shuffle(residuos.filter(r => r.nivel === n));
  lista = lista.slice(0, niveles[n - 1].cantidad);

  for (let r of lista) {
    let x = random(80, 820);
    let y = random(350, 445);
    let intentos = 0;
    while (lugarOcupado(x, y) && intentos < 300) {
      x = random(80, 820);
      y = random(350, 445);
      intentos++;
    }
    enElPiso.push({ ...r, x: x, y: y });
  }
}

// No dejar residuos encima de otros, frente a las canecas o donde empieza el jugador
function lugarOcupado(x, y) {
  if (x > 500 && y < 380) return true;
  if (dist(x, y, 300, 400) < 70) return true;
  for (let r of enElPiso) {
    if (abs(x - r.x) < 150 && abs(y - r.y) < 50) return true;  // que los nombres no se tapen
    if (dist(x, y, r.x, r.y) < 90) return true;
  }
  return false;
}

function moverJugador() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65) || botones.izquierda) jugadorX -= VELOCIDAD;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68) || botones.derecha) jugadorX += VELOCIDAD;
  if (keyIsDown(UP_ARROW) || keyIsDown(87) || botones.arriba) jugadorY -= VELOCIDAD;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83) || botones.abajo) jugadorY += VELOCIDAD;
  jugadorX = constrain(jugadorX, 30, 870);
  jugadorY = constrain(jugadorY, 310, 485);
}

// Tecla E, espacio o el botón "Recoger / Dejar"
function interactuar() {
  if (estado !== 'jugando') return;

  if (enLaMano === null) {
    for (let r of enElPiso) {
      if (dist(jugadorX, jugadorY, r.x, r.y) < 55) {
        enLaMano = r;
        enElPiso.splice(enElPiso.indexOf(r), 1);
        mostrarMensaje('Recogiste: ' + r.nombre + '. Llévalo al punto ecológico.');
        return;
      }
    }
    mostrarMensaje('Acércate más a un residuo para recogerlo.');
  } else {
    for (let c of canecas) {
      if (abs(jugadorX - c.x) < 55 && jugadorY < 345) {
        depositar(c);
        return;
      }
    }
    mostrarMensaje('Acércate a una de las canecas del punto ecológico.');
  }
}

function depositar(caneca) {
  if (enLaMano.tipo === caneca.tipo) {
    puntos += PUNTOS_ACIERTO;
    aciertos++;
    mostrarMensaje('Correcto, +10 puntos. ' + enLaMano.dato);
    enLaMano = null;
    if (enElPiso.length === 0) terminarNivel();
  } else {
    puntos -= PUNTOS_ERROR;
    errores++;
    if (!equivocados.includes(enLaMano)) equivocados.push(enLaMano);
    mostrarMensaje('Incorrecto, -5 puntos. ' + enLaMano.dato);
  }
}

function terminarNivel() {
  if (nivel < 3) {
    estado = 'entreNiveles';
    document.getElementById('textoNivel').textContent =
      'Terminaste el nivel ' + nivel + '. Llevas ' + puntos + ' puntos y te quedan ' + ceil(tiempo) + ' segundos. ' +
      'Sigue: ' + niveles[nivel].lugar.toLowerCase() + ' (' + niveles[nivel].nombre + ').';
    mostrarPantalla('pantallaNivel');
  } else {
    terminarJuego();
  }
}

function siguienteNivel() {
  iniciarNivel(nivel + 1);
  estado = 'jugando';
  mostrarPantalla(null);
  mostrarMensaje('Nivel ' + nivel + ': ' + niveles[nivel - 1].lugar.toLowerCase() + '.');
}

function terminarJuego() {
  estado = 'final';
  let gano = puntos >= META;
  let todoLimpio = aciertos === 15;

  let titulo = 'Se acabó el tiempo';
  if (gano) titulo = 'Ganaste, ' + personajes[personaje].nombre;
  else if (todoLimpio) titulo = 'El colegio quedó limpio, pero te faltaron puntos';

  let medalla = 'Sin medalla. Inténtalo otra vez.';
  if (gano && todoLimpio && errores === 0) medalla = 'Medalla de oro: reciclaje perfecto';
  else if (gano && todoLimpio) medalla = 'Medalla de plata: colegio limpio';
  else if (gano) medalla = 'Medalla de bronce: llegaste a 100 puntos';

  document.getElementById('tituloFinal').textContent = titulo;
  document.getElementById('datosFinal').textContent =
    'Puntos: ' + puntos + ' - Residuos: ' + aciertos + ' de 15 - Errores: ' + errores;
  document.getElementById('medalla').textContent = medalla;

  let lista = document.getElementById('repaso');
  lista.innerHTML = '';
  for (let r of equivocados) {
    let item = document.createElement('li');
    item.textContent = r.nombre + ' va en la caneca ' + r.tipo + '.';
    lista.appendChild(item);
  }
  mostrarPantalla('pantallaFinal');
}

// ----- Dibujo -----
function dibujarFondo() {
  noStroke();
  if (nivel === 1) {
    // salón
    background('#e8dcc0');
    fill('#cfc6b3');
    rect(0, 290, width, 210);
    stroke('#b8ae99');
    for (let x = 0; x < width; x += 60) line(x, 290, x, height);
    for (let y = 290; y < height; y += 50) line(0, y, width, y);
    noStroke();
    fill('#6b4e31');
    rect(40, 50, 380, 160);
    fill('#2f5d4a');
    rect(50, 60, 360, 140);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(26);
    text('SEMANA AMBIENTAL', 230, 110);
    textSize(18);
    text('Separa en la fuente', 230, 150);
    fill('#8b5a2b');
    rect(60, 250, 200, 40);
  } else if (nivel === 2) {
    // tienda escolar
    background('#f0d9a0');
    fill('#c8c8c0');
    rect(0, 290, width, 210);
    stroke('#b0b0a8');
    for (let x = 0; x < width; x += 100) line(x, 290, x, height);
    noStroke();
    fill('#ffffff');
    rect(40, 90, 300, 170);
    for (let i = 0; i < 10; i++) {
      fill(i % 2 === 0 ? '#d9443a' : '#ffffff');
      rect(40 + i * 30, 70, 30, 25);
    }
    fill('#2f6b4f');
    rect(40, 230, 300, 60);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(18);
    text('TIENDA ESCOLAR', 190, 260);
    for (let i = 0; i < 8; i++) {
      fill(i % 2 === 0 ? '#f2c230' : '#3f8fd2');
      rect(60 + i * 34, 120, 24, 30);
    }
  } else {
    // cancha
    background('#9fd3ea');
    stroke('#7d8a85');
    for (let x = 0; x < width; x += 20) line(x, 120, x, 270);
    for (let y = 120; y < 270; y += 20) line(0, y, width, y);
    noStroke();
    fill('#c4673f');
    rect(0, 270, width, 230);
    fill('#3f8f6f');
    rect(20, 290, width - 40, 200);
    noFill();
    stroke(255);
    strokeWeight(3);
    rect(40, 300, width - 80, 180);
    line(450, 300, 450, 480);
    ellipse(450, 390, 100, 100);
    strokeWeight(1);
  }
}

function dibujarPuntoEcologico() {
  noStroke();
  fill('#2f6b55');
  rect(500, 110, 380, 180);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text('PUNTO ECOLÓGICO', 690, 135);

  for (let c of canecas) {
    stroke(0);
    strokeWeight(1);
    // en el nivel fácil la caneca correcta se marca en amarillo
    if (niveles[nivel - 1].pista && enLaMano !== null && enLaMano.tipo === c.tipo) {
      stroke('#ffd700');
      strokeWeight(5);
    }
    fill(c.color);
    rect(c.x - 40, 175, 80, 100, 5);
    rect(c.x - 45, 162, 90, 14, 3);
    noStroke();
    fill(c.letra);
    textSize(14);
    text(c.nombre, c.x, 225);
  }
}

function dibujarResiduos() {
  for (let r of enElPiso) {
    dibujarResiduo(r, r.x, r.y);
    let cerca = dist(jugadorX, jugadorY, r.x, r.y) < 55;
    if (niveles[nivel - 1].verNombres || cerca) {
      noStroke();
      textSize(12);
      let ancho = textWidth(r.nombre) + 14;
      fill(255, 255, 255, 220);
      rect(r.x - ancho / 2, r.y + 24, ancho, 20, 5);
      fill(30);
      textAlign(CENTER, CENTER);
      text(r.nombre, r.x, r.y + 34);
    }
  }
}

function dibujarResiduo(r, x, y) {
  stroke(60);
  strokeWeight(1);
  fill(r.color);
  if (r.forma === 'papel') {
    rect(x - 15, y - 18, 30, 36);
  } else if (r.forma === 'botella') {
    rect(x - 9, y - 20, 18, 40, 5);
    rect(x - 5, y - 27, 10, 8);
  } else if (r.forma === 'lata') {
    rect(x - 10, y - 15, 20, 30, 3);
  } else if (r.forma === 'caja') {
    rect(x - 18, y - 14, 36, 28);
  } else if (r.forma === 'bolsa') {
    rect(x - 16, y - 20, 32, 40, 8);
  } else {
    ellipse(x, y, 34, 24);
  }
}

function dibujarJugador() {
  let p = personajes[personaje];
  noStroke();
  fill(0, 0, 0, 40);
  ellipse(jugadorX, jugadorY, 50, 14);
  fill(p.pantalon);
  rect(jugadorX - 14, jugadorY - 40, 11, 40);
  rect(jugadorX + 3, jugadorY - 40, 11, 40);
  fill(p.camisa);
  stroke(150);
  rect(jugadorX - 20, jugadorY - 90, 40, 52, 8);
  imageMode(CENTER);
  image(caras[personaje], jugadorX, jugadorY - 112, 50, 50);
  if (enLaMano !== null) dibujarResiduo(enLaMano, jugadorX + 30, jugadorY - 60);
}

// ----- Pantallas y controles -----
function actualizarMarcador() {
  document.getElementById('puntos').textContent = puntos;
  document.getElementById('tiempo').textContent = ceil(tiempo);
  document.getElementById('nivel').textContent = nivel + ' (' + niveles[nivel - 1].nombre + ')';
  document.getElementById('mano').textContent = enLaMano ? enLaMano.nombre : 'nada';
}

function mostrarPantalla(id) {
  for (let pantalla of document.querySelectorAll('.pantalla')) pantalla.style.display = 'none';
  if (id !== null) document.getElementById(id).style.display = 'block';
}

function mostrarMensaje(texto) {
  document.getElementById('mensaje').textContent = texto;
}

function keyPressed() {
  if (key === 'e' || key === 'E' || key === ' ') {
    interactuar();
    return false;
  }
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    return false;  // para que la página no se mueva con las flechas
  }
}

function conectarBotones() {
  document.getElementById('jugarCristian').onclick = () => empezar('cristian');
  document.getElementById('jugarJuan').onclick = () => empezar('juan');
  document.getElementById('verInstrucciones').onclick = () => mostrarPantalla('pantallaInstrucciones');
  document.getElementById('volver').onclick = () => mostrarPantalla('pantallaInicio');
  document.getElementById('siguiente').onclick = siguienteNivel;
  document.getElementById('otraVez').onclick = () => mostrarPantalla('pantallaInicio');
  document.getElementById('accion').onclick = interactuar;

  // botones de flechas para celular: se mueve mientras el dedo está encima
  for (let direccion of ['izquierda', 'derecha', 'arriba', 'abajo']) {
    let boton = document.getElementById(direccion);
    boton.onpointerdown = () => { botones[direccion] = true; };
    boton.onpointerup = () => { botones[direccion] = false; };
    boton.onpointerleave = () => { botones[direccion] = false; };
  }
}

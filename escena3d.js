/* =========================================================================
   GUARDIANES DEL PLANETA · Escena 3D con Three.js
   Este archivo solo DIBUJA. Arma el colegio en 3D (piso, paredes, muebles, luces
   y sombras), los personajes, los residuos y las canecas, y en cada cuadro los
   acomoda según las variables de game.js (jugadorX, residuos, puntos…).

   Contenido:
      1. Conversión de coordenadas (mapa del juego → mundo 3D en metros)
      2. Motor: renderizador, cámara y luces
      3. Texturas pintadas con canvas
      4. Materiales y piezas básicas
      5. Escenarios: salón, tienda escolar y cancha
      6. Punto ecológico y canecas
      7. Residuos en 3D
      8. Personajes en 3D
      9. Efectos: partículas, papelitos, confeti y arcoíris
     10. Etiquetas HTML sobre la escena
     11. Dibujar cada cuadro
     12. ¿Qué tocó el jugador? (raycaster)
   ========================================================================= */


/* ===== 1. CONVERSIÓN DE COORDENADAS =====
   game.js trabaja en un mapa de 1040 × 585 visto desde arriba. Aquí 50 unidades
   del mapa son 1 metro: x del mapa → x del mundo, y del mapa → z del mundo (profundidad). */

const ESCALA_MUNDO = 50;

function aMundoX(x) { return (x - ANCHO / 2) / ESCALA_MUNDO; }
function aMundoZ(y) { return (y - 300) / ESCALA_MUNDO; }
function aJuegoX(mundoX) { return mundoX * ESCALA_MUNDO + ANCHO / 2; }
function aJuegoY(mundoZ) { return mundoZ * ESCALA_MUNDO + 300; }


/* ===== 2. MOTOR: RENDERIZADOR, CÁMARA Y LUCES ===== */

let renderizador = null;   // dibuja la escena en el canvas usando la tarjeta de video (WebGL)
let escena3d = null;       // contiene todo lo que se ve
let camara = null;
let luzCielo = null;       // luz suave que viene de todas partes
let luzSol = null;         // luz fuerte que hace las sombras
let mundo = null;          // grupo con el lugar del colegio del nivel actual

const raycaster = new THREE.Raycaster();
const puntero = new THREE.Vector2();
const planoDelPiso = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const vectorAuxiliar = new THREE.Vector3();

function iniciarEscena3D(contenedor) {
  try {
    renderizador = new THREE.WebGLRenderer({ antialias: true });
  } catch (error) {
    return false;  // el navegador no tiene WebGL
  }
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFSoftShadowMap;    // sombras suaves
  renderizador.outputColorSpace = THREE.SRGBColorSpace;
  renderizador.toneMapping = THREE.ACESFilmicToneMapping;  // colores como de cámara de cine
  const lienzo = renderizador.domElement;
  lienzo.setAttribute('aria-label', 'Escena 3D del colegio. Muévete con las flechas o W A S D, o toca el piso. E o espacio recoge y deposita.');
  contenedor.prepend(lienzo);

  escena3d = new THREE.Scene();
  // Cámara fija que ve todo el escenario: así el jugador siempre sabe dónde está cada residuo.
  camara = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 160);
  camara.position.set(0, 11, 10.8);
  camara.lookAt(0, 0.6, 1.3);

  luzCielo = new THREE.HemisphereLight('#ffffff', '#8a7a60', 1.1);
  luzSol = new THREE.DirectionalLight('#fff1d6', 2.4);
  luzSol.castShadow = true;
  luzSol.shadow.mapSize.set(2048, 2048);
  Object.assign(luzSol.shadow.camera, { left: -15, right: 15, top: 13, bottom: -13, near: 1, far: 60 });
  luzSol.shadow.bias = -0.0005;
  luzSol.shadow.normalBias = 0.03;
  luzSol.target.position.set(0, 0, 1);
  escena3d.add(luzCielo, luzSol, luzSol.target);

  marcaDestino3d = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 32),
    new THREE.MeshBasicMaterial({ color: '#fffbd0', transparent: true, opacity: 0.85 }));
  marcaDestino3d.rotation.x = -Math.PI / 2;
  marcaDestino3d.position.y = 0.03;
  escena3d.add(marcaDestino3d);

  // Capa para los nombres de los residuos y de las canecas (texto HTML encima del 3D)
  capaEtiquetas = document.createElement('div');
  capaEtiquetas.className = 'etiquetas-3d';
  contenedor.appendChild(capaEtiquetas);
  burbuja3d = crearEtiqueta('burbuja-3d');
  etiquetasCanecas = CANECAS.map(caneca => {
    const etiqueta = crearEtiqueta('nombre-caneca');
    etiqueta.textContent = caneca.nombre;
    return etiqueta;
  });

  new ResizeObserver(ajustarTamano).observe(contenedor);
  ajustarTamano();
  return true;
}

// El canvas ocupa todo el ancho y mantiene la proporción 16:9.
function ajustarTamano() {
  const ancho = renderizador.domElement.parentElement.clientWidth;
  if (ancho > 0) renderizador.setSize(ancho, Math.round((ancho * 9) / 16), false);
}

function obtenerLienzo3D() {
  return renderizador.domElement;
}

function configurarLuz(exterior) {
  if (exterior) {
    escena3d.background = textura('cielo');
    escena3d.fog = new THREE.Fog('#d4ebf0', 32, 85);  // lo lejano se ve más claro, como en la realidad
    luzCielo.color.set('#e2f2ff');
    luzCielo.groundColor.set('#7d7a5a');
    luzCielo.intensity = 1.15;
    luzSol.color.set('#fff0d0');
    luzSol.intensity = 2.7;
    luzSol.position.set(-9, 16, 10);
  } else {
    escena3d.background = new THREE.Color('#3a352c');
    escena3d.fog = null;
    luzCielo.color.set('#fff6e6');
    luzCielo.groundColor.set('#8a7a60');
    luzCielo.intensity = 1.3;
    luzSol.color.set('#ffe6c0');
    luzSol.intensity = 2.0;
    luzSol.position.set(-13, 10, 7);  // entra por las ventanas de la izquierda
  }
}


/* ===== 3. TEXTURAS PINTADAS CON CANVAS =====
   Cada textura se pinta una sola vez en un canvas 2D y se reutiliza.
   [ancho, alto, repeticiones en x, repeticiones en y, función que la pinta] */

const TEXTURAS = {};

const PINTORES = {
  baldosa:   [256, 256, 28, 17, pintarBaldosa],
  cemento:   [256, 256, 17, 10, pintarCemento],
  pared:     [256, 256, 10, 3, (c, w, h) => pintarPintura(c, w, h, '#f1e7cb', '#e0d3b1')],
  fachada:   [256, 256, 10, 2, (c, w, h) => pintarPintura(c, w, h, '#f3e0ab', '#e1c88e')],
  concreto:  [256, 128, 12, 1, (c, w, h) => pintarPintura(c, w, h, '#d8d1bd', '#bdb59f')],
  ladrillo:  [256, 128, 2, 1, pintarLadrillo],
  tejado:    [128, 64, 60, 1, pintarTejado],
  madera:    [256, 256, 1, 1, pintarMadera],
  cancha:    [1024, 512, 1, 1, pintarCancha],
  malla:     [128, 128, 70, 4, pintarMalla],
  red:       [64, 64, 4, 3, pintarRed],
  tablero:   [1024, 320, 1, 1, pintarTablero],
  cartelera: [256, 256, 1, 1, pintarCartelera],
  ventana:   [256, 220, 1, 1, pintarVentana],
  reloj:     [128, 128, 1, 1, pintarReloj],
  globo:     [128, 64, 1, 1, pintarGlobo],
  nevera:    [128, 256, 1, 1, pintarNevera],
  toldo:     [128, 64, 10, 1, pintarToldo],
  precios:   [256, 128, 1, 1, pintarPrecios],
  cielo:     [16, 256, 1, 1, pintarCielo],
  balon:     [256, 128, 1, 1, pintarBalon],
  letreroEco:    [512, 96, 1, 1, (c, w, h) => pintarLetrero(c, w, h, '♻ PUNTO ECOLÓGICO', '#ffffff', '#1f5a44')],
  letreroTienda: [512, 96, 1, 1, (c, w, h) => pintarLetrero(c, w, h, 'TIENDA ESCOLAR', '#2f6b4f', '#ffffff')],
  'simbolo-aprovechable':   [128, 128, 1, 1, (c, w, h) => pintarSimbolo(c, w, h, 'aprovechable')],
  'simbolo-organico':       [128, 128, 1, 1, (c, w, h) => pintarSimbolo(c, w, h, 'organico')],
  'simbolo-noAprovechable': [128, 128, 1, 1, (c, w, h) => pintarSimbolo(c, w, h, 'noAprovechable')],
  hoja:            [128, 160, 1, 1, pintarHoja],
  fotocopia:       [128, 160, 1, 1, pintarFotocopia],
  periodicoMojado: [160, 128, 1, 1, pintarPeriodicoMojado],
  cajaJugo:        [128, 128, 1, 1, pintarCajaJugo],
  papas:           [128, 160, 1, 1, pintarPapas],
  chocolatina:     [160, 64, 1, 1, pintarChocolatina],
  servilletaGrasa: [128, 128, 1, 1, pintarServilletaGrasa],
  pizza:           [128, 128, 1, 1, pintarPizza],
  carton:          [128, 128, 1, 1, pintarCarton]
};

function textura(nombre) {
  if (!TEXTURAS[nombre]) {
    const [ancho, alto, repetirX, repetirY, pintar] = PINTORES[nombre];
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    pintar(lienzo.getContext('2d'), ancho, alto);
    const t = new THREE.CanvasTexture(lienzo);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repetirX, repetirY);
    t.anisotropy = renderizador.capabilities.getMaxAnisotropy();  // nítida aunque se vea inclinada
    TEXTURAS[nombre] = t;
  }
  return TEXTURAS[nombre];
}

// Puntitos claros y oscuros: dan la sensación de material real (pintura, cemento, papel).
function pintarRuido(c, ancho, alto, cantidad, claro, oscuro) {
  for (let i = 0; i < cantidad; i++) {
    c.fillStyle = i % 2 ? claro : oscuro;
    c.fillRect(azar(i * 1.37) * ancho, azar(i * 2.71) * alto, 1 + azar(i * 3.1) * 2, 1 + azar(i * 4.3) * 2);
  }
}

function degradado(c, x0, y0, x1, y1, colores) {
  const d = c.createLinearGradient(x0, y0, x1, y1);
  colores.forEach((color, i) => d.addColorStop(i / (colores.length - 1), color));
  return d;
}

function pintarBaldosa(c, w, h) {
  c.fillStyle = '#b3aa96';
  c.fillRect(0, 0, w, h);
  [[0, 0, '#e2dac9'], [128, 0, '#d1c8b4'], [0, 128, '#d1c8b4'], [128, 128, '#e2dac9']].forEach(([x, y, color]) => {
    c.fillStyle = color;
    c.fillRect(x + 2, y + 2, 124, 124);
  });
  pintarRuido(c, w, h, 1800, 'rgba(255,255,255,0.18)', 'rgba(90,70,40,0.10)');
}

function pintarCemento(c, w, h) {
  c.fillStyle = degradado(c, 0, 0, w, h, ['#d0d3cb', '#c3c6be']);
  c.fillRect(0, 0, w, h);
  pintarRuido(c, w, h, 4000, 'rgba(255,255,255,0.2)', 'rgba(60,60,50,0.12)');
  for (let i = 0; i < 6; i++) {
    c.fillStyle = 'rgba(90,85,70,0.05)';
    c.beginPath();
    c.ellipse(azar(i * 5) * w, azar(i * 7) * h, 20 + azar(i) * 40, 10 + azar(i * 2) * 20, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.strokeStyle = 'rgba(90,90,80,0.55)';
  c.lineWidth = 3;
  c.strokeRect(0, 0, w, h);  // junta entre placas
}

function pintarPintura(c, w, h, arriba, abajo) {
  c.fillStyle = degradado(c, 0, 0, 0, h, [arriba, abajo]);
  c.fillRect(0, 0, w, h);
  pintarRuido(c, w, h, 2500, 'rgba(255,255,255,0.16)', 'rgba(90,75,45,0.09)');
}

function pintarLadrillo(c, w, h) {
  c.fillStyle = '#c9b8a2';
  c.fillRect(0, 0, w, h);
  for (let fila = 0; fila < 4; fila++) {
    for (let col = -1; col < 5; col++) {
      c.fillStyle = (fila + col) % 2 ? '#b4553e' : '#a24a35';
      c.fillRect(col * 64 + (fila % 2) * 32 + 2, fila * 32 + 2, 60, 28);
    }
  }
  pintarRuido(c, w, h, 1200, 'rgba(255,255,255,0.12)', 'rgba(40,10,0,0.15)');
}

function pintarTejado(c, w, h) {
  for (let x = 0; x < w; x += 32) {
    c.fillStyle = degradado(c, x, 0, x + 32, 0, ['#e3926a', '#b4553e', '#7f3324']);
    c.fillRect(x, 0, 32, h);
  }
  c.fillStyle = 'rgba(40,10,0,0.35)';
  c.fillRect(0, h - 6, w, 6);
}

function pintarMadera(c, w, h) {
  c.fillStyle = '#a8763f';
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < 46; i++) {
    c.strokeStyle = i % 3 ? 'rgba(110,70,30,0.35)' : 'rgba(230,190,130,0.25)';
    c.lineWidth = 1 + azar(i) * 2;
    c.beginPath();
    const y = azar(i * 3.3) * h;
    for (let x = 0; x <= w; x += 16) c.lineTo(x, y + Math.sin(x * 0.03 + i) * 4);
    c.stroke();
  }
}

function pintarCancha(c, w, h) {
  c.fillStyle = '#c4673f';
  c.fillRect(0, 0, w, h);
  c.fillStyle = degradado(c, 0, 0, 0, h, ['#3f8a70', '#4a9a80']);
  c.fillRect(36, 36, w - 72, h - 72);
  pintarRuido(c, w, h, 9000, 'rgba(255,255,255,0.10)', 'rgba(10,40,30,0.10)');
  c.strokeStyle = 'rgba(245,248,240,0.92)';
  c.lineWidth = 7;
  c.strokeRect(64, 64, w - 128, h - 128);
  c.beginPath();
  c.moveTo(w / 2, 64);
  c.lineTo(w / 2, h - 64);
  c.stroke();
  c.beginPath();
  c.arc(w / 2, h / 2, 70, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.arc(64, h / 2, 120, -Math.PI / 2, Math.PI / 2);
  c.stroke();
  c.beginPath();
  c.arc(w - 64, h / 2, 120, Math.PI / 2, Math.PI * 1.5);
  c.stroke();
}

function pintarMalla(c, w, h) {
  c.clearRect(0, 0, w, h);
  c.strokeStyle = 'rgba(110,122,117,0.95)';
  c.lineWidth = 4;
  for (const dx of [-w, 0, w]) {
    c.beginPath();
    c.moveTo(dx, 0);
    c.lineTo(dx + w, h);
    c.moveTo(dx + w, 0);
    c.lineTo(dx, h);
    c.stroke();
  }
}

function pintarRed(c, w, h) {
  c.clearRect(0, 0, w, h);
  c.strokeStyle = 'rgba(255,255,255,0.9)';
  c.lineWidth = 3;
  c.strokeRect(0, 0, w, h);
  c.beginPath();
  c.moveTo(w / 2, 0);
  c.lineTo(w / 2, h);
  c.moveTo(0, h / 2);
  c.lineTo(w, h / 2);
  c.stroke();
}

function pintarTablero(c, w, h) {
  c.fillStyle = degradado(c, 0, 0, 0, h, ['#33664f', '#264c3f']);
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < 24; i++) {  // polvo de tiza de lo que se borró
    c.strokeStyle = `rgba(255,255,255,${0.04 + azar(i) * 0.06})`;
    c.lineWidth = 20 + azar(i * 2) * 30;
    const x = azar(i * 3) * w;
    const y = azar(i * 4) * h;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + 80 + azar(i * 5) * 140, y + (azar(i * 6) - 0.5) * 20);
    c.stroke();
  }
  const tiza = (texto, x, y, tamano, color) => {
    c.font = `bold ${tamano}px sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = 'rgba(255,255,255,0.25)';
    c.fillText(texto, x + 2, y + 2);
    c.fillStyle = color;
    c.fillText(texto, x, y);
  };
  tiza('SEMANA AMBIENTAL', w / 2, 92, 82, 'rgba(242,245,238,0.92)');
  tiza('¡Separa en la fuente!', w / 2, 182, 56, 'rgba(220,234,214,0.9)');
  tiza('Blanca', w / 2 - 230, 262, 50, 'rgba(255,255,255,0.92)');
  tiza('Verde', w / 2, 262, 50, 'rgba(150,227,166,0.95)');
  tiza('Negra', w / 2 + 230, 262, 50, 'rgba(180,190,196,0.92)');
}

function pintarCartelera(c, w, h) {
  c.fillStyle = '#c99a63';
  c.fillRect(0, 0, w, h);
  pintarRuido(c, w, h, 3000, 'rgba(240,200,140,0.45)', 'rgba(110,70,30,0.35)');
  const aviso = (x, y, ancho, alto, angulo, color) => {
    c.save();
    c.translate(x, y);
    c.rotate(angulo);
    c.fillStyle = 'rgba(0,0,0,0.2)';
    c.fillRect(4, 4, ancho, alto);
    c.fillStyle = color;
    c.fillRect(0, 0, ancho, alto);
    c.fillStyle = '#8a8f9a';
    for (let i = 0; i < 4; i++) c.fillRect(10, 18 + i * 14, ancho - 20, 4);
    c.fillStyle = '#d64545';
    c.beginPath();
    c.arc(ancho / 2, 6, 6, 0, Math.PI * 2);
    c.fill();
    c.restore();
  };
  aviso(18, 20, 100, 84, -0.06, '#fffdf3');
  aviso(140, 26, 92, 70, 0.07, '#fff1a8');
  aviso(138, 128, 96, 106, -0.04, '#d8f0ff');
  // Bandera de Colombia en papel
  c.save();
  c.translate(22, 140);
  c.rotate(0.05);
  c.fillStyle = '#fcd116';
  c.fillRect(0, 0, 98, 34);
  c.fillStyle = '#003893';
  c.fillRect(0, 34, 98, 17);
  c.fillStyle = '#ce1126';
  c.fillRect(0, 51, 98, 17);
  c.restore();
}

function pintarVentana(c, w, h) {
  c.fillStyle = '#f4f1e6';
  c.fillRect(0, 0, w, h);
  c.fillStyle = degradado(c, 0, 0, w, h, ['#cfeaf6', '#86bcd4', '#b7dceb']);
  c.fillRect(14, 14, w - 28, h - 28);
  c.fillStyle = 'rgba(255,255,255,0.4)';
  c.beginPath();
  c.moveTo(40, 14);
  c.lineTo(100, 14);
  c.lineTo(40, 120);
  c.fill();
  c.fillStyle = '#3a3f44';  // reja
  for (let x = 14 + 26; x < w - 14; x += 26) c.fillRect(x - 2, 14, 5, h - 28);
  c.fillRect(14, h / 2 - 3, w - 28, 6);
}

function pintarReloj(c, w, h) {
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, w, h);
  c.strokeStyle = '#2d3a35';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    c.lineWidth = i % 3 ? 3 : 6;
    c.beginPath();
    c.moveTo(64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46);
    c.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56);
    c.stroke();
  }
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(64, 64);
  c.lineTo(64, 24);
  c.moveTo(64, 64);
  c.lineTo(92, 76);
  c.stroke();
}

function pintarGlobo(c, w, h) {
  c.fillStyle = '#3f8fd2';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#6cc070';
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.ellipse(azar(i * 4) * w, azar(i * 7) * h, 8 + azar(i) * 16, 5 + azar(i * 2) * 10, azar(i * 3), 0, Math.PI * 2);
    c.fill();
  }
}

function pintarNevera(c, w, h) {
  c.fillStyle = '#d6edf5';
  c.fillRect(0, 0, w, h);
  const colores = ['#e04848', '#3fb35f', '#f2b632', '#3f8fd2'];
  for (let fila = 0; fila < 3; fila++) {
    c.fillStyle = '#a9b8bd';
    c.fillRect(0, 76 + fila * 80, w, 4);
    for (let i = 0; i < 5; i++) {
      c.fillStyle = colores[(i + fila) % 4];
      c.fillRect(8 + i * 24, 20 + fila * 80, 16, 56);
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.fillRect(10 + i * 24, 24 + fila * 80, 4, 48);
    }
  }
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(50, 0);
  c.lineTo(0, 120);
  c.fill();
}

function pintarToldo(c, w, h) {
  c.fillStyle = degradado(c, 0, 0, 0, h, ['#ee5b50', '#b8322a']);
  c.fillRect(0, 0, w / 2, h);
  c.fillStyle = degradado(c, 0, 0, 0, h, ['#ffffff', '#dcdcd4']);
  c.fillRect(w / 2, 0, w / 2, h);
}

function pintarPrecios(c, w, h) {
  c.fillStyle = '#fbf6e6';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#4a3b28';
  c.font = 'bold 22px sans-serif';
  c.textBaseline = 'middle';
  [['Empanada', '$2.000'], ['Jugo', '$1.500'], ['Papas', '$2.500']].forEach(([producto, precio], i) => {
    c.textAlign = 'left';
    c.fillText(producto, 18, 30 + i * 34);
    c.textAlign = 'right';
    c.fillText(precio, w - 18, 30 + i * 34);
  });
}

function pintarCielo(c, w, h) {
  c.fillStyle = degradado(c, 0, 0, 0, h, ['#5aa7cf', '#9fd0e4', '#e2f2f4']);
  c.fillRect(0, 0, w, h);
}

function pintarBalon(c, w, h) {
  c.fillStyle = '#f7f7f7';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#2b2f33';
  for (let fila = 0; fila < 3; fila++) {
    for (let col = 0; col < 6; col++) {
      c.beginPath();
      c.arc(col * 44 + (fila % 2) * 22 + 12, 18 + fila * 44, 12, 0, Math.PI * 2);
      c.fill();
    }
  }
}

function pintarLetrero(c, w, h, texto, fondo, color) {
  c.fillStyle = fondo;
  c.beginPath();
  c.roundRect ? c.roundRect(4, 4, w - 8, h - 8, 24) : c.rect(4, 4, w - 8, h - 8);
  c.fill();
  c.lineWidth = 6;
  c.strokeStyle = color;
  c.stroke();
  c.fillStyle = color;
  c.font = 'bold 42px sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(texto, w / 2, h / 2 + 2, w - 40);
}

function pintarSimbolo(c, w, h, tipo) {
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, w, h);
  c.strokeStyle = '#c9cfcc';
  c.lineWidth = 6;
  c.strokeRect(3, 3, w - 6, h - 6);
  if (tipo === 'aprovechable') {
    c.fillStyle = '#4f6f66';
    c.font = 'bold 92px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('♻', w / 2, h / 2 + 4);
  } else if (tipo === 'organico') {
    c.fillStyle = '#468a55';
    c.beginPath();
    c.ellipse(52, 68, 26, 16, -0.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#6daf6a';
    c.beginPath();
    c.ellipse(78, 52, 24, 14, -0.5, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#2a7643';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(40, 92);
    c.lineTo(92, 40);
    c.stroke();
  } else {
    c.fillStyle = '#2f363b';  // bolsa de basura
    c.beginPath();
    c.arc(64, 76, 30, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(48, 50);
    c.lineTo(64, 24);
    c.lineTo(80, 50);
    c.fill();
  }
}

function pintarHoja(c, w, h) {
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#9cc4d6';
  for (let y = 24; y < h; y += 12) c.fillRect(0, y, w, 2);
  c.fillStyle = '#e8a0a0';
  c.fillRect(20, 0, 2, h);
  pintarRuido(c, w, h, 300, 'rgba(255,255,255,0.4)', 'rgba(0,0,0,0.04)');
}

function pintarFotocopia(c, w, h) {
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#7d868c';
  for (let y = 22; y < h - 14; y += 9) c.fillRect(12, y, 70 + azar(y) * 34, 4);
  c.fillStyle = '#9aa3a8';
  c.fillRect(8, 6, 16, 3);  // gancho de cosedora
}

function pintarPeriodicoMojado(c, w, h) {
  c.fillStyle = '#d8d4c7';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#4f565f';
  c.fillRect(10, 10, w - 20, 16);
  c.fillStyle = '#9a978c';
  for (let col = 0; col < 3; col++) {
    for (let y = 34; y < h - 8; y += 7) c.fillRect(10 + col * 48, y, 40, 3);
  }
  for (let i = 0; i < 4; i++) {  // manchas de agua
    const d = c.createRadialGradient(30 + azar(i) * 100, 40 + azar(i * 2) * 60, 0, 30 + azar(i) * 100, 40 + azar(i * 2) * 60, 40);
    d.addColorStop(0, 'rgba(70,110,150,0.45)');
    d.addColorStop(1, 'rgba(70,110,150,0)');
    c.fillStyle = d;
    c.fillRect(0, 0, w, h);
  }
}

function pintarCajaJugo(c, w, h) {
  c.fillStyle = '#ffd166';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#ffffff';
  c.fillRect(0, 0, w, 26);
  c.fillStyle = '#ef8a3c';
  c.beginPath();
  c.arc(64, 74, 26, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#4caf68';
  c.beginPath();
  c.ellipse(80, 48, 12, 6, -0.6, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#b8601e';
  c.font = 'bold 22px sans-serif';
  c.textAlign = 'center';
  c.fillText('JUGO', 64, 122);
}

function pintarPapas(c, w, h) {
  c.fillStyle = degradado(c, 0, 0, w, 0, ['#ffe680', '#f2c230', '#c79a12', '#f7d35c']);
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#d64545';
  c.fillRect(0, 22, w, 30);
  c.fillStyle = '#ffffff';
  c.font = 'bold 26px sans-serif';
  c.textAlign = 'center';
  c.fillText('PAPAS', 64, 46);
  c.fillStyle = '#e8a23a';
  c.beginPath();
  c.ellipse(64, 104, 30, 22, 0, 0, Math.PI * 2);
  c.fill();
}

function pintarChocolatina(c, w, h) {
  c.fillStyle = degradado(c, 0, 0, 0, h, ['#8a5236', '#5a321e']);
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#e8c35a';
  c.font = 'bold 26px sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('CHOCO', w / 2, h / 2);
}

function pintarServilletaGrasa(c, w, h) {
  c.fillStyle = '#f4f0e6';
  c.fillRect(0, 0, w, h);
  for (let i = 0; i < 5; i++) {
    const x = 20 + azar(i) * 90;
    const y = 20 + azar(i * 2) * 90;
    const d = c.createRadialGradient(x, y, 0, x, y, 26);
    d.addColorStop(0, 'rgba(170,120,60,0.6)');
    d.addColorStop(1, 'rgba(170,120,60,0)');
    c.fillStyle = d;
    c.fillRect(0, 0, w, h);
  }
}

function pintarPizza(c, w, h) {
  pintarCarton(c, w, h);
  for (let i = 0; i < 4; i++) {
    const x = 20 + azar(i * 3) * 90;
    const y = 20 + azar(i * 5) * 90;
    const d = c.createRadialGradient(x, y, 0, x, y, 30);
    d.addColorStop(0, 'rgba(110,70,20,0.65)');
    d.addColorStop(1, 'rgba(110,70,20,0)');
    c.fillStyle = d;
    c.fillRect(0, 0, w, h);
  }
  c.strokeStyle = '#c0392b';
  c.lineWidth = 5;
  c.beginPath();
  c.arc(64, 64, 26, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = '#c0392b';
  c.font = 'bold 18px sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('PIZZA', 64, 64);
}

function pintarCarton(c, w, h) {
  c.fillStyle = '#c99460';
  c.fillRect(0, 0, w, h);
  pintarRuido(c, w, h, 800, 'rgba(255,230,190,0.25)', 'rgba(90,50,10,0.18)');
}


/* ===== 4. MATERIALES Y PIEZAS BÁSICAS ===== */

// MeshStandardMaterial reacciona a la luz como un material real (rugosidad y brillo metálico).
function material(color, opciones = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...opciones });
}

function conTextura(nombre, opciones = {}) {
  return new THREE.MeshStandardMaterial({ map: textura(nombre), roughness: 0.85, metalness: 0, ...opciones });
}

function malla(geometria, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometria, mat);
  m.position.set(x, y, z);
  m.castShadow = true;     // hace sombra
  m.receiveShadow = true;  // recibe sombra
  return m;
}

function caja(ancho, alto, fondo, mat, x, y, z) {
  return malla(new THREE.BoxGeometry(ancho, alto, fondo), mat, x, y, z);
}

function cilindro(radio, alto, mat, x, y, z, lados = 20, radioAbajo = radio) {
  return malla(new THREE.CylinderGeometry(radio, radioAbajo, alto, lados), mat, x, y, z);
}

function esfera(radio, mat, x, y, z, lados = 20) {
  return malla(new THREE.SphereGeometry(radio, lados, Math.max(8, lados / 2)), mat, x, y, z);
}

function plano(ancho, alto, mat, x, y, z) {
  const m = malla(new THREE.PlaneGeometry(ancho, alto), mat, x, y, z);
  m.castShadow = false;
  return m;
}

function girar(objeto, x = 0, y = 0, z = 0) {
  objeto.rotation.set(x, y, z);
  return objeto;
}

function piso(grupo, mat) {
  grupo.add(girar(plano(44, 26, mat, 0, 0, 4), -Math.PI / 2));
}

// Libera la memoria de la tarjeta de video al cambiar de nivel (las texturas se reutilizan).
function liberar(objeto) {
  objeto.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) [].concat(o.material).forEach(m => m.dispose());
  });
}


/* ===== 5. ESCENARIOS: SALÓN, TIENDA ESCOLAR Y CANCHA ===== */

function construirNivel3D(numero) {
  if (mundo) {
    escena3d.remove(mundo);
    liberar(mundo);
  }
  mundo = new THREE.Group();
  escena3d.add(mundo);
  configurarLuz(NIVELES[numero - 1].exterior);
  if (numero === 1) construirSalon(mundo);
  if (numero === 2) construirTiendaEscolar(mundo);
  if (numero === 3) construirCancha(mundo);
  construirPuntoEcologico(mundo);
  crearCanecas3D(mundo);
  crearPapelitos(mundo, numero);
  quitarResiduos3D();
  for (const r of residuos) crearResiduo3D(r);
}

// Nivel 1: el salón de clase después de la última hora.
function construirSalon(g) {
  piso(g, conTextura('baldosa', { roughness: 0.32 }));  // baldosa brillante: refleja un poco la luz
  const pared = conTextura('pared');
  g.add(caja(44, 8, 0.3, pared, 0, 4, -3.8));
  for (const x of [-12.2, 12.2]) {  // paredes de los lados (no hacen sombra para que la luz de las ventanas entre)
    const lado = caja(0.3, 8, 18, pared, x, 4, 4);
    lado.castShadow = false;
    g.add(lado);
  }
  g.add(caja(44, 1, 0.34, material('#7fae95', { roughness: 0.6 }), 0, 0.5, -3.66));  // zócalo pintado
  for (const z of [0.4, 4.2]) {  // ventanas de la pared izquierda: por ahí entra la luz
    g.add(girar(plano(2.6, 2.2, conTextura('ventana', { emissive: '#fff6dd', emissiveIntensity: 0.4 }), -12.03, 2.6, z), 0, Math.PI / 2));
  }
  // Tablero con el mensaje de la semana ambiental
  g.add(caja(7.9, 2.62, 0.12, material('#c9cfd2', { metalness: 0.6, roughness: 0.35 }), -3.48, 2.75, -3.6));
  g.add(plano(7.6, 2.34, conTextura('tablero', { roughness: 0.95 }), -3.48, 2.75, -3.53));
  g.add(caja(7.8, 0.07, 0.22, material('#b8bfc2', { metalness: 0.5, roughness: 0.4 }), -3.48, 1.56, -3.45));
  // Cartelera de corcho y reloj
  g.add(caja(2.3, 2.3, 0.08, material('#7a5232'), -8.9, 2.75, -3.6));
  g.add(plano(2.1, 2.1, conTextura('cartelera'), -8.9, 2.75, -3.55));
  g.add(girar(cilindro(0.38, 0.06, conTextura('reloj'), 1.2, 4.05, -3.6, 32), Math.PI / 2));
  construirEscritorio(g, aMundoX(192), aMundoZ(279));
  construirPupitre(g, aMundoX(100), aMundoZ(505));
  construirPupitre(g, aMundoX(942), aMundoZ(505));
}

function construirEscritorio(g, x, z) {
  const madera = conTextura('madera', { roughness: 0.6 });
  g.add(caja(5.9, 0.1, 1.3, madera, x, 0.82, z));
  g.add(caja(5.6, 0.72, 0.06, material('#7a5232'), x, 0.42, z + 0.6));
  g.add(caja(0.08, 0.77, 1.2, material('#6a4628'), x - 2.85, 0.39, z));
  g.add(caja(0.08, 0.77, 1.2, material('#6a4628'), x + 2.85, 0.39, z));
  g.add(caja(0.5, 0.05, 0.03, material('#d9b56a', { metalness: 0.8, roughness: 0.3 }), x, 0.55, z + 0.64));
  // Libros y globo terráqueo
  g.add(caja(0.9, 0.14, 0.6, material('#c0504d'), x - 1.8, 0.94, z));
  g.add(caja(0.8, 0.12, 0.55, material('#3f7fbf'), x - 1.75, 1.07, z - 0.02));
  g.add(cilindro(0.03, 0.3, material('#5d4a36'), x + 1.9, 1.02, z));
  g.add(esfera(0.28, conTextura('globo', { roughness: 0.4 }), x + 1.9, 1.4, z));
}

// Pupitre: tablero de madera, patas metálicas y silla azul.
function construirPupitre(g, x, z) {
  const metal = material('#5c6670', { metalness: 0.6, roughness: 0.4 });
  const plastico = material('#3a72b5', { roughness: 0.45 });
  g.add(caja(1.3, 0.05, 0.62, conTextura('madera', { roughness: 0.6 }), x, 0.76, z - 0.3));
  for (const [dx, dz] of [[-0.58, -0.55], [0.58, -0.55], [-0.58, -0.05], [0.58, -0.05]]) g.add(cilindro(0.025, 0.76, metal, x + dx, 0.38, z + dz, 8));
  g.add(caja(0.55, 0.05, 0.5, plastico, x, 0.46, z + 0.4));
  g.add(caja(0.55, 0.42, 0.05, plastico, x, 0.78, z + 0.67));
  for (const dx of [-0.24, 0.24]) g.add(cilindro(0.02, 0.62, metal, x + dx, 0.31, z + 0.62, 8));
}

// Nivel 2: la tienda escolar y el patio en el descanso.
function construirTiendaEscolar(g) {
  piso(g, conTextura('cemento', { roughness: 0.95 }));
  g.add(caja(44, 4.6, 0.3, conTextura('fachada'), 0, 2.3, -3.8));
  g.add(caja(44, 0.9, 0.34, material('#4f8f6a', { roughness: 0.7 }), 0, 0.45, -3.66));  // zócalo
  g.add(girar(caja(44, 0.18, 1.6, conTextura('tejado'), 0, 4.75, -3.2), 0.32));          // tejado de barro
  for (const x of [-1.84, 0.24]) {  // ventanas con reja
    g.add(caja(1.92, 1.64, 0.08, material('#f2efe4'), x, 2.6, -3.62));
    g.add(plano(1.76, 1.5, conTextura('ventana', { roughness: 0.3 }), x, 2.6, -3.57));
  }
  g.add(caja(4.2, 0.6, 0.6, conTextura('ladrillo'), -0.84, 0.3, -3.3));  // jardinera
  for (let i = 0; i < 7; i++) {
    g.add(malla(new THREE.IcosahedronGeometry(0.34 + azar(i) * 0.12, 1),
      material(i % 2 ? '#5cb36a' : '#3f8f4c', { flatShading: true }), -2.7 + i * 0.62, 0.8, -3.3));
  }
  construirTienda(g, aMundoX(191));
}

function construirTienda(g, x) {
  const blanco = material('#f7f4ea');
  g.add(caja(6.2, 3.2, 0.15, blanco, x, 1.6, -3.55));
  g.add(caja(0.15, 3.2, 2.6, blanco, x - 3.1, 1.6, -2.3));
  g.add(caja(0.15, 3.2, 2.6, blanco, x + 3.1, 1.6, -2.3));
  g.add(caja(6.6, 0.16, 3.0, material('#2f6b4f'), x, 3.28, -2.2));
  // Estantes con mecato
  const colores = ['#f2c230', '#d64545', '#3f8fd2', '#4caf68', '#ef8a3c'];
  [1.35, 2.15].forEach((y, fila) => {
    g.add(caja(4.2, 0.06, 0.5, conTextura('madera'), x - 0.8, y, -3.2));
    for (let k = 0; k < 9; k++) {
      g.add(caja(0.34, 0.46, 0.22, material(colores[(k * 2 + fila) % 5], { roughness: 0.4 }), x - 2.7 + k * 0.47, y + 0.26, -3.2));
    }
  });
  // Nevera con bebidas
  g.add(caja(1, 2.5, 0.8, material('#e9eded', { roughness: 0.3, metalness: 0.2 }), x + 2.3, 1.25, -2.9));
  g.add(plano(0.8, 1.9, conTextura('nevera', { roughness: 0.15, emissive: '#ffffff', emissiveIntensity: 0.15 }), x + 2.3, 1.45, -2.49));
  // Toldo a rayas y letrero
  const toldo = girar(plano(6.6, 1.3, conTextura('toldo', { side: THREE.DoubleSide }), x, 3.05, -0.85), -0.75);
  toldo.castShadow = true;
  g.add(toldo);
  g.add(plano(3.2, 0.6, conTextura('letreroTienda', { emissive: '#ffffff', emissiveIntensity: 0.1 }), x, 3.85, -0.6));
  // Mostrador con tablero de precios y frasco de dulces
  g.add(caja(6.2, 1.05, 0.3, material('#2f6b4f', { roughness: 0.6 }), x, 0.53, 0.3));
  g.add(caja(6.4, 0.1, 1, conTextura('madera', { roughness: 0.5 }), x, 1.1, 0.1));
  g.add(plano(1.4, 0.7, conTextura('precios'), x - 1.6, 0.58, 0.46));
  g.add(esfera(0.22, material('#ffffff', { transparent: true, opacity: 0.35, roughness: 0.05 }), x + 2, 1.38, 0.05));
  for (let i = 0; i < 6; i++) {
    g.add(esfera(0.05, material(['#ff8fa3', '#ffd166', '#8fe0a0'][i % 3]), x + 1.92 + azar(i) * 0.16, 1.24 + azar(i * 2) * 0.12, azar(i * 3) * 0.1, 8));
  }
}

// Nivel 3: la cancha múltiple después del partido del descanso.
function construirCancha(g) {
  g.add(girar(plano(44, 21, material('#c4673f', { roughness: 0.9 }), 0, 0, 6.5), -Math.PI / 2));   // borde de la cancha
  g.add(girar(plano(90, 40, material('#6f9e5a', { roughness: 1 }), 0, -0.01, -24), -Math.PI / 2)); // pasto detrás de la malla
  g.add(girar(plano(23, 11, conTextura('cancha', { roughness: 0.8 }), 0, 0.01, 2.2), -Math.PI / 2));
  // Muro bajo, malla y postes
  g.add(caja(44, 0.8, 0.3, conTextura('concreto'), 0, 0.4, -4));
  g.add(plano(44, 2.6, conTextura('malla', { transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }), 0, 2.1, -4));
  const metal = material('#7d8a85', { metalness: 0.6, roughness: 0.4 });
  for (let x = -21; x <= 21; x += 3.5) g.add(cilindro(0.06, 3.4, metal, x, 1.7, -4, 10));
  g.add(girar(cilindro(0.05, 44, metal, 0, 3.38, -4, 8), 0, 0, Math.PI / 2));
  // Gradería de cemento detrás de la malla
  for (let i = 0; i < 4; i++) g.add(caja(7 - i * 0.4, 0.45 * (i + 1), 0.9, conTextura('concreto'), -6, 0.22 * (i + 1), -5.2 - i * 0.9));
  // Árboles y montañas al fondo
  for (let i = 0; i < 10; i++) {
    const x = -18 + i * 4 + azar(i) * 1.5;
    const z = -9 - azar(i * 2) * 3;
    g.add(cilindro(0.18, 2.2, material('#6b5236'), x, 1.1, z, 8));
    g.add(malla(new THREE.IcosahedronGeometry(1.6 + azar(i * 3) * 0.6, 1),
      material(['#4f9b5a', '#3f8a4c', '#5aa865'][i % 3], { flatShading: true }), x, 3.1, z));
  }
  for (let i = 0; i < 6; i++) {
    const montana = malla(new THREE.ConeGeometry(9 + azar(i) * 5, 6 + azar(i * 2) * 4, 6),
      material('#8fb3a6', { flatShading: true }), -30 + i * 12, 2.5, -38);
    montana.castShadow = false;
    g.add(montana);
  }
  construirArco(g, aMundoX(70), aMundoZ(346));
  g.add(esfera(0.14, conTextura('balon', { roughness: 0.5 }), aMundoX(996), 0.14, aMundoZ(534)));
}

// Arco de microfútbol con su red, de lado y mirando hacia la cancha.
function construirArco(g, x, z) {
  const blanco = material('#ffffff', { roughness: 0.4 });
  const red = conTextura('red', { transparent: true, alphaTest: 0.3, side: THREE.DoubleSide });
  const ancho = 1.8;
  const alto = 1.2;
  const fondo = 0.9;
  for (const dz of [-ancho / 2, ancho / 2]) g.add(cilindro(0.05, alto, blanco, x, alto / 2, z + dz, 10));
  g.add(girar(cilindro(0.05, ancho, blanco, x, alto, z, 10), Math.PI / 2));
  g.add(girar(plano(ancho, alto, red, x - fondo, alto / 2, z), 0, Math.PI / 2));
  g.add(girar(plano(fondo, ancho, red, x - fondo / 2, alto, z), -Math.PI / 2));
  for (const dz of [-ancho / 2, ancho / 2]) g.add(plano(fondo, alto, red, x - fondo / 2, alto / 2, z + dz));
}


/* ===== 6. PUNTO ECOLÓGICO Y CANECAS ===== */

let canecas3d = [];   // { caneca, grupo, cuerpoMat }

// Escenario 2 del documento: el punto ecológico del colegio, con techo y letrero.
function construirPuntoEcologico(g) {
  const cx = aMundoX(825);
  g.add(caja(8.4, 2.7, 0.15, material('#2c6b55', { roughness: 0.8 }), cx, 1.35, -3.15));
  g.add(caja(8.6, 0.06, 2.2, material('#bfc3bb', { roughness: 0.9 }), cx, 0.03, -2.25));
  const metal = material('#9fb3a9', { metalness: 0.6, roughness: 0.35 });
  for (const x of [cx - 4.15, cx - 1.38, cx + 1.38, cx + 4.15]) g.add(cilindro(0.07, 3, metal, x, 1.5, -1.45, 10));
  g.add(girar(caja(9, 0.14, 2.3, material('#2b6a53', { roughness: 0.6 }), cx, 3.05, -2.3), 0.1));
  g.add(caja(9, 0.3, 0.08, material('#1f4f3e'), cx, 2.95, -1.16));
  g.add(plano(3.4, 0.6, conTextura('letreroEco', { emissive: '#ffffff', emissiveIntensity: 0.15 }), cx, 3.5, -1.1));
}

// Caneca: cuerpo un poco más angosto abajo, tapa, agarradera, pedal y etiqueta con el símbolo.
function crearCanecas3D(g) {
  canecas3d = CANECAS.map(caneca => {
    const grupo = new THREE.Group();
    const cuerpoMat = material(caneca.color, { roughness: 0.45 });
    const tapaMat = material(new THREE.Color(caneca.color).multiplyScalar(0.78), { roughness: 0.4 });
    grupo.add(girar(malla(new THREE.CylinderGeometry(0.56, 0.46, 1.1, 4), cuerpoMat, 0, 0.6, 0), 0, Math.PI / 4));
    grupo.add(girar(malla(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 4), tapaMat, 0, 1.2, 0), 0, Math.PI / 4));
    grupo.add(caja(0.3, 0.05, 0.08, material('#222222'), 0, 1.28, 0.3));
    grupo.add(caja(0.3, 0.05, 0.18, material('#3a3f44', { metalness: 0.5 }), 0, 0.05, 0.42));
    grupo.add(girar(plano(0.46, 0.46, conTextura('simbolo-' + caneca.tipo, { roughness: 0.5 }), 0, 0.66, 0.37), -0.065));
    grupo.position.set(aMundoX(caneca.x), 0, aMundoZ(Y_CANECAS));
    grupo.traverse(o => { o.userData.caneca = caneca; });
    g.add(grupo);
    return { caneca, grupo, cuerpoMat };
  });
}

// Nivel fácil: la caneca correcta brilla y salta cuando se lleva un residuo.
function actualizarCanecas3D() {
  const hayPista = NIVELES[nivel - 1].canecaIlumina && residuoCargado && estado === 'jugando';
  canecas3d.forEach((c, i) => {
    const brilla = hayPista && residuoCargado.tipo === c.caneca.tipo;
    c.cuerpoMat.emissive.set(brilla ? '#fff3a0' : '#000000');
    c.cuerpoMat.emissiveIntensity = brilla ? 0.35 + Math.sin(reloj * 6) * 0.2 : 0;
    c.grupo.position.y = brilla ? Math.abs(Math.sin(reloj * 5)) * 0.06 : 0;
    colocarEtiqueta(etiquetasCanecas[i], c.grupo.position.x, 0, c.grupo.position.z + 0.75);
  });
}


/* ===== 7. RESIDUOS EN 3D ===== */

const modelosResiduos = new Map();     // residuo → modelo 3D
const etiquetasResiduos = new Map();   // residuo → nombre en HTML

function crearResiduo3D(residuo) {
  const modelo = crearModeloResiduo(residuo.dibujo);
  modelo.scale.setScalar(1.3);  // un poco más grandes que en la vida real para que se vean bien
  modelo.traverse(o => { o.userData.residuo = residuo; });
  escena3d.add(modelo);
  modelosResiduos.set(residuo, modelo);
  const etiqueta = crearEtiqueta('etiqueta-3d');
  etiqueta.textContent = residuo.nombre;
  etiquetasResiduos.set(residuo, etiqueta);
}

function quitarResiduos3D() {
  for (const modelo of modelosResiduos.values()) {
    escena3d.remove(modelo);
    liberar(modelo);
  }
  for (const etiqueta of etiquetasResiduos.values()) etiqueta.remove();
  modelosResiduos.clear();
  etiquetasResiduos.clear();
}

function actualizarResiduos3D() {
  const cercano = estado === 'jugando' && !residuoCargado ? residuoMasCercano() : null;
  const n = NIVELES[nivel - 1];
  for (const [residuo, modelo] of modelosResiduos) {
    if (!residuos.includes(residuo)) {  // ya lo recogieron
      escena3d.remove(modelo);
      liberar(modelo);
      etiquetasResiduos.get(residuo).remove();
      modelosResiduos.delete(residuo);
      etiquetasResiduos.delete(residuo);
      continue;
    }
    const resaltado = residuo === cercano || residuo === residuoSenalado;
    modelo.position.set(aMundoX(residuo.x), resaltado ? Math.abs(Math.sin(reloj * 4)) * 0.12 : 0, aMundoZ(residuo.y));
    modelo.rotation.y = residuo.semilla + (n.viento ? Math.sin(reloj * 0.7 + residuo.semilla) * 0.3 : 0);
    colocarEtiqueta(etiquetasResiduos.get(residuo), modelo.position.x, 0, modelo.position.z + 0.6, n.nombresVisibles || resaltado);
  }
}

// Cada residuo se arma con piezas simples (cajas, cilindros, esferas) y texturas.
function crearModeloResiduo(dibujo) {
  const g = new THREE.Group();
  const agregar = (...piezas) => piezas.forEach(p => g.add(p));
  switch (dibujo) {
    // ----- Caneca blanca: aprovechables limpios y secos -----
    case 'hoja':
      agregar(girar(caja(0.42, 0.01, 0.54, conTextura('hoja'), 0, 0.01, 0), 0, 0.3));
      break;
    case 'fotocopias':
      agregar(caja(0.4, 0.01, 0.52, conTextura('fotocopia'), 0.04, 0.01, -0.03),
        girar(caja(0.4, 0.01, 0.52, conTextura('fotocopia'), -0.04, 0.022, 0.04), 0, 0.25));
      break;
    case 'botella':
    case 'bebida': {
      const esAgua = dibujo === 'botella';
      const plastico = material(esAgua ? '#c7eef6' : '#62c4ef', { transparent: true, opacity: esAgua ? 0.55 : 0.8, roughness: 0.06 });
      const botella = new THREE.Group();
      botella.add(cilindro(0.1, 0.38, plastico, 0, 0.19, 0));
      botella.add(cilindro(0.045, 0.1, plastico, 0, 0.42, 0, 16, 0.09));
      botella.add(cilindro(0.05, 0.05, material(esAgua ? '#3f8fd2' : '#1b4f99', { roughness: 0.4 }), 0, 0.49, 0));
      botella.add(cilindro(0.103, 0.12, material(esAgua ? '#ffffff' : '#f25c54', { roughness: 0.5 }), 0, 0.2, 0));
      agregar(girar(botella, 0, 0, Math.PI / 2));
      botella.position.y = 0.1;
      break;
    }
    case 'lata': {
      const lata = new THREE.Group();
      lata.add(cilindro(0.075, 0.24, material('#d23a3a', { metalness: 0.7, roughness: 0.3 }), 0, 0.12, 0));
      lata.add(cilindro(0.074, 0.012, material('#d9dee2', { metalness: 0.9, roughness: 0.2 }), 0, 0.245, 0));
      lata.add(cilindro(0.076, 0.05, material('#f2f2f2', { metalness: 0.3, roughness: 0.4 }), 0, 0.12, 0));
      agregar(girar(lata, 0, 0, Math.PI / 2));
      lata.position.y = 0.075;
      break;
    }
    case 'cajaJugo':
      agregar(caja(0.2, 0.3, 0.13, conTextura('cajaJugo'), 0, 0.15, 0),
        girar(cilindro(0.008, 0.14, material('#ffffff'), 0.05, 0.36, 0, 6), 0, 0, -0.3));
      break;
    case 'caja':
      agregar(caja(0.6, 0.36, 0.45, conTextura('carton'), 0, 0.18, 0),
        caja(0.09, 0.362, 0.452, material('#d8c49a', { roughness: 0.5 }), 0, 0.18, 0));
      break;
    // ----- Caneca verde: orgánicos -----
    case 'banano': {
      const cascara = girar(malla(new THREE.TorusGeometry(0.18, 0.05, 10, 24, Math.PI * 0.85), material('#f2cf4a', { roughness: 0.6 }), 0, 0.05, 0), -Math.PI / 2);
      cascara.add(esfera(0.035, material('#5e4a2a'), 0.18, 0, 0, 8));
      agregar(cascara);
      break;
    }
    case 'naranja':
    case 'mandarina': {
      const escala = dibujo === 'mandarina' ? 0.8 : 1;
      const cascara = material(dibujo === 'mandarina' ? '#f7a13a' : '#f39a2e', { roughness: 0.7, side: THREE.DoubleSide });
      agregar(girar(malla(new THREE.SphereGeometry(0.14 * escala, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), cascara, 0, 0.13 * escala, 0), Math.PI));
      agregar(girar(malla(new THREE.SphereGeometry(0.12 * escala, 16, 10, 0, Math.PI * 1.2, 0, Math.PI * 0.4), cascara, 0.2 * escala, 0.1 * escala, 0.05), Math.PI, 0.6));
      if (dibujo === 'mandarina') agregar(girar(plano(0.1, 0.05, material('#5aa05c', { side: THREE.DoubleSide }), -0.05, 0.02, 0.12), -Math.PI / 2));
      break;
    }
    case 'manzana': {
      const roja = material('#d8473f', { roughness: 0.4 });
      agregar(cilindro(0.05, 0.16, material('#fbefc9', { roughness: 0.7 }), 0, 0.1, 0, 12),
        girar(esfera(0.085, roja, 0, 0.19, 0, 16), 0, 0, 0),
        esfera(0.085, roja, 0, 0.02, 0, 16),
        cilindro(0.01, 0.07, material('#6b5a30'), 0, 0.27, 0, 6));
      g.children[1].scale.y = 0.5;
      g.children[2].scale.y = 0.5;
      break;
    }
    case 'arroz':
      for (let i = 0; i < 40; i++) {
        const angulo = azar(i) * Math.PI * 2;
        const radio = Math.sqrt(azar(i * 3)) * 0.16;
        const grano = esfera(0.016, material(i % 4 ? '#fbf8ee' : '#e0d6b8', { roughness: 0.6 }), Math.cos(angulo) * radio, 0.016 + (0.16 - radio) * 0.35 * azar(i * 5), Math.sin(angulo) * radio, 6);
        grano.scale.set(1.8, 0.9, 0.9);
        grano.rotation.y = azar(i * 7) * Math.PI;
        g.add(grano);
      }
      break;
    // ----- Caneca negra: no aprovechables (sucios, mojados o metalizados) -----
    case 'panuelo':
    case 'servilletaGrasa': {
      const papel = dibujo === 'panuelo'
        ? material('#f6f6f2', { flatShading: true, roughness: 0.95 })
        : conTextura('servilletaGrasa', { flatShading: true, roughness: 0.9 });
      const bola = malla(new THREE.DodecahedronGeometry(0.17, 0), papel, 0, 0.09, 0);
      bola.scale.y = 0.55;
      agregar(bola);
      break;
    }
    case 'paquetePapas': {
      const metalizado = { metalness: 0.55, roughness: 0.35 };
      agregar(caja(0.36, 0.07, 0.5, conTextura('papas', metalizado), 0, 0.035, 0),
        caja(0.37, 0.02, 0.04, material('#d4d9de', { metalness: 0.8, roughness: 0.3 }), 0, 0.035, 0.27),
        caja(0.37, 0.02, 0.04, material('#d4d9de', { metalness: 0.8, roughness: 0.3 }), 0, 0.035, -0.27));
      break;
    }
    case 'chocolatina': {
      const dorado = material('#d4b13a', { metalness: 0.8, roughness: 0.3 });
      agregar(caja(0.38, 0.05, 0.13, conTextura('chocolatina', { roughness: 0.4 }), 0, 0.025, 0),
        caja(0.05, 0.03, 0.15, dorado, 0.21, 0.02, 0),
        caja(0.05, 0.03, 0.15, dorado, -0.21, 0.02, 0));
      break;
    }
    case 'cajaPizza':
      agregar(caja(0.65, 0.06, 0.65, conTextura('pizza'), 0, 0.03, 0));
      break;
    case 'periodicoMojado':
      agregar(girar(caja(0.55, 0.015, 0.4, conTextura('periodicoMojado', { roughness: 0.35 }), 0, 0.01, 0), 0, 0.4));
      break;
    default:
      agregar(caja(0.3, 0.3, 0.3, material('#999999'), 0, 0.15, 0));
  }
  return g;
}


/* ===== 8. PERSONAJES EN 3D ===== */

let modeloJugador = null;      // { grupo, piernas, brazos, personajeId }
let objetoEnMano = null;
let residuoEnMano = null;
let anguloJugador = 0;
let anguloObjetivo = 0;
let tiempoQuieto = 0;
let anteriorX = null;
let anteriorZ = null;

// Cuerpo armado con cápsulas y cajas; la cabeza es la foto de la cara (o la de Eco en 3D).
function crearModeloJugador(p) {
  const grupo = new THREE.Group();
  const piel = material(p.piel, { roughness: 0.6 });
  const camisa = material(p.camisa, { roughness: 0.75 });
  const pantalon = material(p.pantalon, { roughness: 0.85 });
  const zapatos = material(p.zapatos, { roughness: 0.5 });
  const detalle = material(p.detalle, { roughness: 0.6 });

  // Piernas: giran desde la cadera al caminar
  const piernas = [-0.12, 0.12].map(x => {
    const pierna = new THREE.Group();
    pierna.position.set(x, 0.86, 0);
    pierna.add(malla(new THREE.CapsuleGeometry(0.085, 0.62, 4, 10), pantalon, 0, -0.4, 0));
    pierna.add(caja(0.16, 0.09, 0.3, zapatos, 0, -0.82, 0.05));
    grupo.add(pierna);
    return pierna;
  });
  // Torso y mochila de guardián
  const torso = malla(new THREE.CapsuleGeometry(0.24, 0.42, 6, 14), camisa, 0, 1.17, 0);
  torso.scale.z = 0.72;
  grupo.add(torso);
  grupo.add(caja(0.4, 0.46, 0.18, material('#c9964a', { roughness: 0.8 }), 0, 1.2, -0.24));
  // Brazos: giran desde el hombro
  const brazos = [-0.33, 0.33].map(x => {
    const brazo = new THREE.Group();
    brazo.position.set(x, 1.42, 0);
    const mangaLarga = p.estilo === 'chaqueta';
    if (!mangaLarga) brazo.add(malla(new THREE.CapsuleGeometry(0.085, 0.16, 4, 10), camisa, 0, -0.1, 0));
    brazo.add(malla(new THREE.CapsuleGeometry(0.065, mangaLarga ? 0.46 : 0.34, 4, 10), mangaLarga ? camisa : piel, 0, -0.33, 0));
    brazo.add(esfera(0.07, piel, 0, -0.6, 0, 10));
    grupo.add(brazo);
    return brazo;
  });
  // Detalles de la ropa
  if (p.estilo === 'polo') {
    grupo.add(caja(0.3, 0.06, 0.22, camisa, 0, 1.5, 0.04));
    for (const y of [1.42, 1.35]) grupo.add(esfera(0.016, material('#aab4af'), 0, y, 0.18, 8));
  } else if (p.estilo === 'uniforme') {
    for (const lado of [-1, 1]) grupo.add(girar(caja(0.14, 0.05, 0.04, detalle, lado * 0.07, 1.48, 0.15), 0, 0, lado * 0.5));
    grupo.add(girar(cilindro(0.045, 0.012, material('#3b5bab'), 0.11, 1.3, 0.175, 16), Math.PI / 2));
    grupo.add(girar(malla(new THREE.TorusGeometry(0.045, 0.008, 6, 20), material('#e0b43c', { metalness: 0.6 }), 0.11, 1.3, 0.18), 0));
  } else {
    grupo.add(caja(0.06, 0.55, 0.02, detalle, 0, 1.17, 0.18));
  }
  grupo.add(cilindro(0.075, 0.12, piel, 0, 1.56, 0, 12));  // cuello
  // Cabeza
  if (p.cara) {
    const cara = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaCara(p) }));
    cara.scale.set(0.62, 0.62, 1);
    cara.position.y = 1.86;
    grupo.add(cara);
  } else {
    grupo.add(esfera(0.25, piel, 0, 1.84, 0, 24));
    grupo.add(cilindro(0.26, 0.12, material('#2a9368', { roughness: 0.6 }), 0, 2.02, 0, 24));
    grupo.add(caja(0.3, 0.03, 0.24, material('#206d55'), 0, 1.98, 0.22));
    for (const lado of [-1, 1]) grupo.add(esfera(0.03, material('#2d4038'), lado * 0.08, 1.87, 0.22, 10));
    grupo.add(girar(malla(new THREE.TorusGeometry(0.07, 0.012, 6, 12, Math.PI), material('#95564a'), 0, 1.79, 0.235), 0, 0, Math.PI));
  }
  return { grupo, piernas, brazos, personajeId: p.id };
}

// La foto de la cara se dibuja dentro de un círculo con borde, como una medalla.
function texturaCara(p) {
  const nombre = 'cara-' + p.id;
  if (TEXTURAS[nombre]) return TEXTURAS[nombre];
  const lienzo = document.createElement('canvas');
  lienzo.width = 256;
  lienzo.height = 256;
  const t = new THREE.CanvasTexture(lienzo);
  t.colorSpace = THREE.SRGBColorSpace;
  TEXTURAS[nombre] = t;
  const imagen = new Image();
  imagen.onload = () => {
    const c = lienzo.getContext('2d');
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(128, 128, 124, 0, Math.PI * 2);
    c.fill();
    c.save();
    c.beginPath();
    c.arc(128, 128, 112, 0, Math.PI * 2);
    c.clip();
    c.drawImage(imagen, 16, 16, 224, 224);
    c.restore();
    c.lineWidth = 8;
    c.strokeStyle = '#0d3b2e';
    c.beginPath();
    c.arc(128, 128, 120, 0, Math.PI * 2);
    c.stroke();
    t.needsUpdate = true;
  };
  imagen.src = p.cara;
  return t;
}

function actualizarJugador3D(dt) {
  if (!modeloJugador || modeloJugador.personajeId !== personajeElegido) {
    if (modeloJugador) {
      escena3d.remove(modeloJugador.grupo);
      liberar(modeloJugador.grupo);
    }
    modeloJugador = crearModeloJugador(personaje());
    modeloJugador.grupo.traverse(o => { if (o.isMesh) o.castShadow = true; });
    escena3d.add(modeloJugador.grupo);
    objetoEnMano = null;
    residuoEnMano = null;
  }
  const g = modeloJugador.grupo;
  const x = aMundoX(jugadorX);
  const z = aMundoZ(jugadorY);

  // Mira hacia donde camina; si se queda quieto un rato, voltea hacia la cámara.
  if (anteriorX !== null && Math.hypot(x - anteriorX, z - anteriorZ) > 0.001) {
    anguloObjetivo = Math.atan2(x - anteriorX, z - anteriorZ);
    tiempoQuieto = 0;
  } else {
    tiempoQuieto += dt;
    if (tiempoQuieto > 1.2) anguloObjetivo = 0;
  }
  anteriorX = x;
  anteriorZ = z;
  const diferencia = Math.atan2(Math.sin(anguloObjetivo - anguloJugador), Math.cos(anguloObjetivo - anguloJugador));
  anguloJugador += diferencia * Math.min(1, dt * 12);
  g.rotation.y = anguloJugador;

  // Caminar: las piernas y los brazos se mueven en sentidos opuestos.
  const paso = jugadorCamina && estado === 'jugando' ? Math.sin(pasoJugador) : 0;
  modeloJugador.piernas[0].rotation.x = paso * 0.6;
  modeloJugador.piernas[1].rotation.x = -paso * 0.6;
  const brazosAdelante = residuoCargado ? -0.9 : 0;  // con un residuo en las manos, los brazos van al frente
  modeloJugador.brazos[0].rotation.x = brazosAdelante - paso * 0.5 * (residuoCargado ? 0.2 : 1);
  modeloJugador.brazos[1].rotation.x = brazosAdelante + paso * 0.5 * (residuoCargado ? 0.2 : 1);
  g.position.set(x, Math.abs(paso) * 0.05, z);

  // Residuo que lleva en las manos
  if (residuoEnMano !== residuoCargado) {
    if (objetoEnMano) {
      g.remove(objetoEnMano);
      liberar(objetoEnMano);
      objetoEnMano = null;
    }
    if (residuoCargado) {
      objetoEnMano = crearModeloResiduo(residuoCargado.dibujo);
      objetoEnMano.scale.setScalar(0.8);
      objetoEnMano.position.set(0, 0.95, 0.45);
      g.add(objetoEnMano);
    }
    residuoEnMano = residuoCargado;
  }

  // Globo de ayuda sobre la cabeza ("E · RECOGER")
  let accion = null;
  if (estado === 'jugando' && !residuoCargado && residuoMasCercano()) accion = 'RECOGER';
  if (estado === 'jugando' && residuoCargado && canecaMasCercana()) accion = 'DEPOSITAR';
  if (accion) burbuja3d.textContent = esPantallaTactil ? `👆 ${accion}` : `E · ${accion}`;
  colocarEtiqueta(burbuja3d, x, 2.45, z, Boolean(accion));
}


/* ===== 9. EFECTOS: PARTÍCULAS, PAPELITOS, CONFETI Y ARCOÍRIS ===== */

let marcaDestino3d = null;
let particulas3d = [];
let papelitos3d = [];
let confeti3d = null;
const geometriaEstrella = new THREE.OctahedronGeometry(0.07);
const geometriaHojita = new THREE.PlaneGeometry(0.14, 0.07);
const geometriaPapelito = new THREE.PlaneGeometry(0.12, 0.08);

// Estrellas al acertar u hojitas al recoger. altura: a cuántos metros del piso salen.
function lanzarParticulas(x, y, altura, cantidad, forma) {
  const colores = ['#fff2ac', '#d8ffbc', '#ffd3a2', '#a8eed8'];
  for (let i = 0; i < cantidad; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: forma === 'estrella' ? colores[i % 4] : '#8fd18f', transparent: true, side: THREE.DoubleSide });
    const m = new THREE.Mesh(forma === 'estrella' ? geometriaEstrella : geometriaHojita, mat);
    m.position.set(aMundoX(x), altura, aMundoZ(y));
    const angulo = (i / cantidad) * Math.PI * 2;
    const rapidez = aleatorio(1.2, 3.2);
    particulas3d.push({ malla: m, vx: Math.cos(angulo) * rapidez, vy: aleatorio(2, 4), vz: Math.sin(angulo) * rapidez * 0.6, vida: aleatorio(0.7, 1.3) });
    escena3d.add(m);
  }
}

function actualizarParticulas3D(dt) {
  for (const p of particulas3d) {
    p.vida -= dt;
    p.vy -= 9 * dt;  // gravedad
    p.malla.position.x += p.vx * dt;
    p.malla.position.y += p.vy * dt;
    p.malla.position.z += p.vz * dt;
    p.malla.rotation.x += dt * 6;
    p.malla.rotation.y += dt * 4;
    p.malla.material.opacity = limitar(p.vida / 0.6, 0, 1);
  }
  particulas3d = particulas3d.filter(p => {
    if (p.vida > 0) return true;
    escena3d.remove(p.malla);
    p.malla.material.dispose();
    return false;
  });
}

// Papelitos y migas en el piso: desaparecen poco a poco a medida que se limpia.
function crearPapelitos(g, numero) {
  const colores = ['#f4f1e6', '#e9d48a', '#d98b6a', '#b9c4c9', '#9fd0a8'].map(color => material(color));
  papelitos3d = [];
  for (let i = 0; i < 45; i++) {
    const m = new THREE.Mesh(geometriaPapelito, colores[i % 5]);
    m.rotation.set(-Math.PI / 2, 0, azar(i * 9.1 + numero) * Math.PI);
    m.position.set(aMundoX(20 + azar(i * 6.13 + numero) * 1000), 0.015, aMundoZ(262 + azar(i * 3.7 + numero) * 310));
    m.receiveShadow = true;
    m.userData.seLimpia = (i + 1) / 46;
    g.add(m);
    papelitos3d.push(m);
  }
}

function actualizarPapelitos(limpieza) {
  for (const m of papelitos3d) m.visible = m.userData.seLimpia > limpieza;
}

// Celebración: cae confeti sobre el colegio limpio.
function actualizarCelebracion(dt) {
  if (!colegioRecuperado) {
    if (confeti3d) confeti3d.visible = false;
    return;
  }
  if (!confeti3d) {
    confeti3d = new THREE.Group();
    const geometria = new THREE.PlaneGeometry(0.12, 0.2);
    const colores = ['#f5d57c', '#efabb7', '#e0e8f6', '#72dca4', '#8ecbff'];
    for (let i = 0; i < 140; i++) {
      const m = new THREE.Mesh(geometria, new THREE.MeshBasicMaterial({ color: colores[i % 5], side: THREE.DoubleSide }));
      m.position.set(aleatorio(-11, 11), aleatorio(0, 9), aleatorio(-2, 7));
      m.userData.velocidad = aleatorio(1, 2.2);
      confeti3d.add(m);
    }
    escena3d.add(confeti3d);
  }
  confeti3d.visible = true;
  for (const m of confeti3d.children) {
    m.position.y -= m.userData.velocidad * dt;
    m.rotation.x += dt * 3;
    m.rotation.z += dt * 2;
    if (m.position.y < 0) m.position.y = 9;
  }
}

function actualizarMarcaDestino() {
  const visible = Boolean(destino) && estado === 'jugando';
  marcaDestino3d.visible = visible;
  if (!visible) return;
  marcaDestino3d.position.x = aMundoX(destino.x);
  marcaDestino3d.position.z = aMundoZ(destino.y);
  marcaDestino3d.scale.setScalar(1 + Math.sin(reloj * 6) * 0.15);
}


/* ===== 10. ETIQUETAS HTML SOBRE LA ESCENA =====
   Los nombres se escriben con HTML (no dentro del 3D) para que se lean nítidos en cualquier pantalla. */

let capaEtiquetas = null;
let burbuja3d = null;
let etiquetasCanecas = [];

function crearEtiqueta(clase) {
  const etiqueta = document.createElement('div');
  etiqueta.className = clase;
  capaEtiquetas.appendChild(etiqueta);
  return etiqueta;
}

// Convierte un punto del mundo 3D a un punto de la pantalla y pone allí la etiqueta.
function colocarEtiqueta(etiqueta, x, y, z, visible = true) {
  if (!visible) {
    etiqueta.style.display = 'none';
    return;
  }
  vectorAuxiliar.set(x, y, z).project(camara);
  const lienzo = renderizador.domElement;
  const enPantallaX = ((vectorAuxiliar.x + 1) / 2) * lienzo.clientWidth;
  const enPantallaY = ((1 - vectorAuxiliar.y) / 2) * lienzo.clientHeight;
  etiqueta.style.display = 'block';
  etiqueta.style.transform = `translate(${enPantallaX}px, ${enPantallaY}px) translate(-50%, -50%)`;
}


/* ===== 11. DIBUJAR CADA CUADRO (lo llama game.js unas 60 veces por segundo) ===== */

// Calidad automática: si el computador va lento, baja la resolución; si va sobrado, la sube.
let calidad = Math.min(window.devicePixelRatio, 2);
let cuadrosMedidos = 0;
let inicioMedicion = performance.now();

function ajustarCalidad() {
  cuadrosMedidos++;
  const transcurrido = performance.now() - inicioMedicion;
  if (transcurrido < 2000) return;
  const cuadrosPorSegundo = (cuadrosMedidos * 1000) / transcurrido;
  cuadrosMedidos = 0;
  inicioMedicion = performance.now();
  if (transcurrido > 4000) return;  // la pestaña estuvo oculta: esta medición no sirve
  const maxima = Math.min(window.devicePixelRatio, 2);
  let nueva = calidad;
  if (cuadrosPorSegundo < 30 && calidad > 0.5) nueva = Math.max(0.5, calidad - 0.25);
  else if (cuadrosPorSegundo > 55 && calidad < maxima) nueva = Math.min(maxima, calidad + 0.25);
  if (nueva !== calidad) {
    calidad = nueva;
    renderizador.setPixelRatio(calidad);
    ajustarTamano();
  }
}

function dibujarCuadro(dt) {
  ajustarCalidad();
  const limpieza = colegioRecuperado ? 1 : aciertos / TOTAL_RESIDUOS;  // de 0 (sucio) a 1 (limpio)
  renderizador.toneMappingExposure = 0.86 + 0.24 * limpieza;           // el colegio se ve más luminoso al limpiarlo
  actualizarPapelitos(limpieza);
  actualizarResiduos3D();
  actualizarCanecas3D();
  actualizarJugador3D(dt);
  actualizarMarcaDestino();
  actualizarParticulas3D(dt);
  actualizarCelebracion(dt);
  renderizador.render(escena3d, camara);
}


/* ===== 12. ¿QUÉ TOCÓ EL JUGADOR? =====
   El raycaster lanza un "rayo" desde la cámara a través del punto tocado y mira con qué choca. */

function queHayEn(evento) {
  const borde = renderizador.domElement.getBoundingClientRect();
  puntero.set(((evento.clientX - borde.left) / borde.width) * 2 - 1, -((evento.clientY - borde.top) / borde.height) * 2 + 1);
  raycaster.setFromCamera(puntero, camara);

  const golpeCaneca = raycaster.intersectObjects(canecas3d.map(c => c.grupo), true)[0];
  if (golpeCaneca) return { caneca: golpeCaneca.object.userData.caneca };
  const golpeResiduo = raycaster.intersectObjects([...modelosResiduos.values()], true)[0];
  if (golpeResiduo) return { residuo: golpeResiduo.object.userData.residuo };

  const punto = new THREE.Vector3();
  if (!raycaster.ray.intersectPlane(planoDelPiso, punto)) return null;
  const x = aJuegoX(punto.x);
  const y = aJuegoY(punto.z);
  // Si tocó el piso muy cerca de un residuo, cuenta como tocar el residuo (más fácil en celular).
  const cercano = residuos.find(r => distancia(x, y, r.x, r.y) < 45);
  return cercano ? { residuo: cercano, x, y } : { x, y };
}

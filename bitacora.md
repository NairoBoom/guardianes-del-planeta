# Bitácora de programación · Guardianes del Planeta

Formato de la sección 20 del documento del proyecto. Cada cambio se probó jugando partidas completas en computador y en celular.

| Componente | Problema | Solución | ¿Funcionó? |
|---|---|---|---|
| Reglas | La regla 5 dice "gana al alcanzar 100 puntos" y la sección 6 dice "100 puntos **y** limpiar el parque". El juego solo dejaba ganar si se cumplían ambas. | Se sigue la regla 5 y el GDD: gana quien llega a 100 puntos antes de que termine el tiempo. Limpiar todo el parque da la medalla de plata, y hacerlo sin errores, la de oro. | Sí |
| Niveles | Los 3 niveles eran iguales, pero el GDD pide fácil, intermedio y difícil. | Fácil: 4 residuos y la caneca correcta se ilumina. Intermedio: 5 residuos, sin ayuda. Difícil: 6 residuos que confunden, el viento los mueve y el nombre solo aparece al acercarse. | Sí |
| Canecas | El juego usaba canecas blanca, verde y negra; el documento dice papel, plástico y orgánicos. | Se cambiaron a papel, plástico y orgánicos. En la guía se agregó un dato sobre el código de colores de Colombia. | Sí |
| Residuos | Siempre salían los mismos 12 residuos en el mismo lugar. | Hay 18 residuos con un dato educativo cada uno. En cada partida se eligen al azar (al menos uno de cada tipo) y se ubican en lugares distintos. | Sí |
| Escenario 3 | El documento dice que al final "aparecen árboles, flores y animales"; el juego solo mostraba confeti. | Al principio el parque se ve gris y sucio y se aclara con cada acierto. Al limpiarlo todo aparecen flores, conejos, el pato, mariposas y un arcoíris. | Sí |
| Resultados | No se sabía en qué se había equivocado el jugador. | La pantalla final muestra "Para repasar" con cada residuo mal clasificado y su caneca correcta. | Sí |
| Estructura | Todo estaba en un solo archivo de 1240 líneas, con unas 200 líneas de una versión anterior que no se usaban. | Se separó en `index.html`, `style.css`, `game.js` y `assets/` (sección 17). Se borró el código sin uso. | Sí |
| Tecnología | El documento propone p5.js, pero el juego usaba el canvas de JavaScript directamente. | Ahora usa p5.js (`setup()`, `draw()`, `keyIsDown()`…). p5.js está guardado en `libreria/` para jugar sin internet. | Sí |
| Código | Las variables estaban en inglés (`state.score`, `state.player.x`…) y era difícil de explicar. | Se usan las variables de la sección 19: `puntos`, `tiempo`, `jugadorX` y `jugadorY`. Todo está en español, comentado y ordenado en 13 secciones. | Sí |
| Compatibilidad | El juego quedaba en blanco en navegadores viejos (usaba `roundRect`). | p5.js dibuja los rectángulos redondeados en cualquier navegador. | Sí |
| Rendimiento | Se redibujaban miles de detalles del parque 60 veces por segundo. | El parque se dibuja una sola vez por nivel en una imagen aparte (`createGraphics`). | Sí |
| Celular | Los nombres de los residuos se veían diminutos y los controles táctiles quedaban lejos del juego. | Los textos del lienzo se agrandan en pantallas pequeñas y los controles quedan justo debajo del juego. | Sí |
| Dibujo | Eco siempre se dibujaba encima de los residuos, aunque estuviera detrás. | Se dibuja primero lo que está más arriba en la pantalla. | Sí |
| Accesibilidad | El lector de pantalla leía el reloj cada segundo. Algunos textos tenían poco contraste. | Se quitó el anuncio del reloj y se oscurecieron esos colores. | Sí |
| Textos | Decía "LOPÉZ" y "Edición 1.0" en un juego 2.0. Las instrucciones nombraban canecas que no existían en el juego. | Se corrigieron los textos. | Sí |

## Adicionales (mejoras que van más allá del documento)

| Componente | Qué agregamos | Cómo funciona | ¿Funcionó? |
|---|---|---|---|
| Dificultad progresiva | Los niveles fácil, intermedio y difícil se diferencian de verdad. | Cada nivel tiene más residuos y menos ayudas. En el difícil hay viento y los nombres de los residuos están ocultos (lista `NIVELES`). | Sí |
| Personajes | Se puede elegir entre Cristian López, Juan Noriega o Eco. | Cristian y Juan llevan la foto de su cara sobre un cuerpo dibujado con su ropa (polo y jean; uniforme del colegio). Eco es el personaje del documento. El juego recuerda la última elección (lista `PERSONAJES`). | Sí |
| Racha | Premia clasificar bien varias veces seguidas. | Cada 3 aciertos seguidos se ganan 5 puntos extra. Un error reinicia la racha, que se ve en la barra de abajo. | Sí |
| Pregunta rápida | Una pregunta entre niveles con residuos que no salen en el parque. | Si acierta, gana 5 segundos. Si falla, el juego le muestra la respuesta correcta y no pierde nada (lista `PREGUNTAS`). | Sí |
| Récord | Guarda el mejor puntaje. | Se guarda en el navegador y aparece en la pantalla de inicio y en la final. | Sí |
| Repaso final | Muestra en qué se equivocó el jugador. | La pantalla final lista cada residuo mal clasificado con su caneca correcta. | Sí |

Las constantes de los extras están al principio de `game.js` (`RACHA_PARA_BONO`, `PUNTOS_BONO_RACHA`, `SEGUNDOS_BONO_PREGUNTA`) para poder ajustarlas.

**Fotos de los personajes:** el juego solo usa los recortes livianos de `assets/personajes/`, no las fotos originales. Si el juego se publica en internet, primero hay que pedir permiso a Cristian y a Juan.

## Ajuste después de la revisión del profesor (4 de noviembre de 2026)

**Observación del profesor:** el juego era genérico. Revisando la guía vimos por qué: el ejemplo de objetivo educativo de la página 7 es "clasificar residuos y tomar decisiones de reciclaje", y nuestro juego era casi ese ejemplo, en un parque cualquiera. La Misión 1 pide partir de un problema real, de la comunidad o de la vida cotidiana.

**Decisión del equipo:** la IA nos propuso cuatro enfoques (nuestro colegio, la ruta del residuo, colegio + ruta, reciclador de oficio). **Elegimos ubicar el juego en nuestro colegio**, porque es un problema que vemos todos los días en el descanso y lo podemos investigar y observar directamente.

| Componente | Antes (genérico) | Ahora (nuestro colegio) | ¿Funcionó? |
|---|---|---|---|
| Problema | Basura en "un parque" | La basura del descanso en la I.E. Ángela María Torres Suárez está mal separada | Sí |
| Escenarios | Sendero, picnic y lago | **Salón** (después de clase), **tienda escolar** (descanso) y **cancha** (después del partido) | Sí |
| Canecas | Papel, plástico y orgánicos (genéricas) | **Blanca, verde y negra**: el código de colores de Colombia (Resolución 2184 de 2019), el mismo del punto ecológico | Sí |
| Residuos | Genéricos | Basura real del colegio: fotocopias, paquete de papas, caja de jugo, servilleta con grasa, cáscaras de naranja del medio tiempo… | Sí |
| Aprendizaje | Solo "dónde va" cada cosa | **Por qué** va ahí: lo limpio y seco va en la blanca; lo sucio, mojado o metalizado va en la negra. El nivel difícil tiene parejas que confunden (caja de cartón limpia y caja de pizza con grasa) | Sí |
| Retroalimentación | "Es un residuo de papel" | Al equivocarse, el juego explica la razón ("Los empaques metalizados no se aprovechan: van en la negra") | Sí |
| Historia | Limpiar un parque | Semana ambiental: limpiar el colegio antes de que suene el timbre | Sí |
| Ambiente | Flores y animales | Papelitos en el piso que desaparecen al limpiar, timbre al acabarse el tiempo y celebración con el colegio limpio | Sí |

### Mejora visual: que se vea más real (seguimos con p5.js)

Consideramos pasar a Three.js (3D), pero decidimos **mantener p5.js**: ya estaba en el documento y el código es más fácil de explicar en la sustentación. Mejoramos el dibujo con técnicas de arte y matemáticas:

| Técnica | Cómo la usamos | ¿Funcionó? |
|---|---|---|
| Perspectiva con punto de fuga | El piso del salón, el patio y la cancha tienen líneas que se juntan hacia un punto lejano (función `xEnPerspectiva`). Las filas de baldosas crecen 14 % cada vez que se acercan. | Sí |
| Escala por profundidad | El personaje y los residuos se ven más pequeños al fondo y más grandes adelante (`escalaPorProfundidad`). | Sí |
| Luz y sombras | Sombras difuminadas con degradado radial, luz de ventana en el piso, sombra donde la pared toca el piso y viñeta en los bordes. | Sí |
| Volumen | Degradados de luz a sombra en canecas (con tapa, pedal y etiqueta), botellas transparentes con reflejo, latas metálicas y cajas en 3D. | Sí |
| Texturas | Pintura de pared, cemento, corcho, polvo de tiza, ladrillo y tejado de barro, hechos con puntitos y manchas. | Sí |
| Más detalle en los escenarios | Cartelera con avisos y bandera, pupitres, nevera con bebidas, ventanas con reja, gradería y montañas al fondo. | Sí |

### Cambio de librería: de p5.js a Three.js (3D)

Después de mejorar el dibujo 2D, el equipo quería que el colegio se viera todavía más real. Revisamos la guía (Misión 16, páginas 18 y 19): usar una librería es obligatorio, pero se puede elegir entre **Phaser, p5.js o Three.js**, siempre que la elección se justifique. Decidimos **cambiar a Three.js**.

**Justificación (para la Misión 16 y el punto 17 del GDD):**
> Elegimos **Three.js** porque queríamos que el colegio se viera real: un espacio en 3D con luces, sombras, materiales que reflejan la luz y una cámara con perspectiva. Con p5.js solo podíamos imitar el 3D dibujando. Three.js está en la lista de librerías de la guía ("experiencias 3D"), funciona en el navegador y en celulares, y tiene buena documentación. Lo guardamos en `libreria/three.min.js` para que el juego funcione sin internet.

| Componente | Problema | Solución | ¿Funcionó? |
|---|---|---|---|
| Estructura | El código de dibujo y la lógica estaban mezclados en `game.js`. | `game.js` quedó solo con las reglas, la puntuación y los controles. `escena3d.js` arma y dibuja el mundo 3D. | Sí |
| Mundo 3D | Había que pasar del mapa plano a un mundo con profundidad. | El mapa del juego (1040 × 585) se convierte a metros: 50 unidades = 1 metro (`aMundoX`, `aMundoZ`). | Sí |
| Escenarios | El salón, la tienda y la cancha eran dibujos planos. | Se arman con cajas, cilindros y esferas de Three.js, con texturas pintadas en canvas: baldosa, cemento, tablero con tiza, cartelera, tejado, malla de la cancha… | Sí |
| Luz y sombras | Las sombras eran manchas dibujadas a mano. | Una luz de sol (`DirectionalLight`) proyecta sombras reales y una luz de cielo (`HemisphereLight`) ilumina suave. Los materiales reaccionan a la luz (`MeshStandardMaterial`): la baldosa brilla y las latas parecen metal. | Sí |
| Personajes | El cuerpo era un dibujo plano. | Cuerpo en 3D (cápsulas y cajas) con la ropa de cada uno. Camina moviendo brazos y piernas, gira hacia donde va y lleva el residuo en las manos. La cara de Cristian y Juan es su foto. | Sí |
| Muebles sólidos | El personaje atravesaba el escritorio y los pupitres. | `chocaConMuebles()` no lo deja pasar por encima de los muebles. | Sí |
| Tocar la pantalla | Con perspectiva, un toque ya no corresponde a un punto del mapa en línea recta. | Un `Raycaster` lanza un rayo desde la cámara por el punto tocado y averigua si tocó una caneca, un residuo o el piso. | Sí |
| Cámara | Al principio la cámara seguía al jugador y la basura de las esquinas quedaba fuera de la pantalla. | La cámara quedó fija y abierta para que siempre se vea todo el escenario. | Sí |
| Fotos de las caras | WebGL no acepta imágenes cargadas desde archivos al abrir `index.html` con doble clic. | Las caras se guardaron como texto (data URI) en `assets/personajes/caras.js`. | Sí |
| Computadores lentos | En equipos sin tarjeta de video el 3D puede ir lento. | Calidad automática: si el juego va a menos de 30 cuadros por segundo, baja la resolución; si va sobrado, la sube. | Sí |
| Nombres | El texto dentro del 3D se ve borroso en celular. | Los nombres de residuos y canecas son etiquetas HTML que siguen a cada objeto en la pantalla. | Sí |

Se probó en Chrome y Edge de computador, en Safari de iPhone 14 (emulado) y en Chrome de Android (emulado): los tres niveles, la celebración y los resultados, sin errores.

**Pendiente del equipo:**
- Actualizar en la Entrega 1 (GDD) el problema, los escenarios, la historia y las canecas para que coincidan con el juego.
- Cambiar el punto 17 del GDD y la Misión 16 a **Three.js**, con la justificación de arriba.
- Contarle al profe el cambio de librería.

## Bitácora de IA

| Fecha | Necesidad | Prompt (resumen) | Respuesta utilizada | Decisión del equipo |
|---|---|---|---|---|
| 4-nov-2026 | El profesor dijo que el juego era genérico | Le dimos a la IA la guía del proyecto y le pedimos ajustar el juego | Cuatro enfoques posibles para que el juego fuera propio | Elegimos "nuestro colegio" y revisamos que los residuos y las canecas siguieran la norma colombiana |
| 4-nov-2026 | Queríamos que el juego se viera más real | Preguntamos si era obligatorio seguir con p5.js y pedimos cambiar la librería | La guía permite Phaser, p5.js o Three.js si se justifica. La IA rehízo el dibujo en 3D con Three.js | Elegimos Three.js para que el colegio se viera en 3D con luces y sombras. Mantuvimos las mismas reglas y niveles |

## Cómo revisar el juego

- Abre `index.html` en Chrome, Edge, Firefox o Safari. No necesita internet.
- En la consola del navegador (F12) escribe `GuardianesDelPlaneta.estado()` para ver los puntos, el tiempo, el nivel y la posición del personaje.
- Para cambiar la dificultad, edita las constantes al inicio de `game.js`: `TIEMPO_TOTAL`, `META_PUNTOS`, `VELOCIDAD_JUGADOR` o la lista `NIVELES`.
- Para mover la cámara o cambiar las luces, edita `iniciarEscena3D()` y `configurarLuz()` en `escena3d.js`.

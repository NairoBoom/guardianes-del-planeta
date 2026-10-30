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

## Cómo revisar el juego

- Abre `index.html` en Chrome, Edge o Firefox. No necesita internet.
- En la consola del navegador (F12) escribe `GuardianesDelPlaneta.estado()` para ver los puntos, el tiempo, el nivel y la posición de Eco.
- Para cambiar la dificultad, edita las constantes al inicio de `game.js`: `TIEMPO_TOTAL`, `META_PUNTOS`, `VELOCIDAD_ECO` o la lista `NIVELES`.

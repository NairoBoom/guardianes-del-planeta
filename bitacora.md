# Bitácora - Guardianes del Planeta

## Bitácora de programación

| Fecha | Componente | Problema | Solución | ¿Funcionó? |
|---|---|---|---|---|
| 29-oct-2026 | Reglas | La regla 5 y la sección 6 del documento decían cosas distintas sobre cómo ganar. | Se gana con 100 puntos (regla 5). Limpiar todo da medalla de plata, y sin errores, de oro. | Sí |
| 29-oct-2026 | Niveles | Los 3 niveles eran iguales. | Fácil: 4 residuos y la caneca correcta se marca. Intermedio: 5 residuos. Difícil: 6 residuos y los nombres solo salen al acercarse. | Sí |
| 29-oct-2026 | Personajes | Queríamos jugar con nuestros personajes. | Se pueden elegir Cristian o Juan, con la foto de la cara. | Sí |
| 29-oct-2026 | Celular | En iPhone el archivo enviado por WhatsApp no dejaba jugar. | WhatsApp abre el archivo en una vista previa que no ejecuta JavaScript. Se subió el juego a GitHub Pages para jugarlo desde un enlace. | Sí |
| 4-nov-2026 | Tema | El profesor dijo que el juego era genérico (pasaba en un parque cualquiera). | El juego pasa en el colegio: salón, tienda escolar y cancha, con las canecas blanca, verde y negra (Resolución 2184 de 2019) y basura real del descanso. | Sí |
| 4-nov-2026 | Diseño y código | El profesor dijo que se veía genérico por la forma, los colores y la estructura del código. | Se simplificó todo: un solo archivo `js/game.js` de unas 440 líneas, diseño sencillo, sin emojis, y comentarios solo donde hacen falta. | Sí |

## Bitácora de IA

| Fecha | Necesidad | Prompt (resumen) | Respuesta utilizada | Decisión |
|---|---|---|---|---|
| 29-oct-2026 | Mejorar el prototipo | Pedimos revisar el juego y ajustarlo al documento del proyecto. | La IA reorganizó el código, corrigió errores y agregó niveles de dificultad. | Se usó, siguiendo las reglas del documento. |
| 29-oct-2026 | Personajes | Pedimos usar fotos de Cristian y Juan como personajes. | La IA recortó las caras y las puso en el juego. | Se usó. |
| 4-nov-2026 | El profesor dijo que era genérico | Pedimos ideas para que el juego fuera propio. | La IA propuso 4 enfoques. | Se eligió ubicar el juego en el colegio. |
| 4-nov-2026 | Que se viera más real | Pedimos probar 3D con Three.js. | La IA hizo una versión 3D. | No se dejó: era muy difícil de explicar y se veía hecha por IA. |
| 4-nov-2026 | Simplificar | Pedimos simplificar el código, el diseño y los comentarios. | La IA reescribió el juego en p5.js de forma sencilla (esta versión). | Se usó. Falta que el equipo lo estudie para poder explicarlo. |

## Cómo funciona el código (para la sustentación)

- `setup()` crea el lienzo y `draw()` se repite unas 60 veces por segundo: dibuja el fondo, las canecas, los residuos y el jugador, y descuenta el tiempo.
- `moverJugador()` mueve al jugador con las flechas, W A S D o los botones del celular.
- `interactuar()` recoge un residuo si el jugador está cerca, o lo deposita si está frente a una caneca.
- `depositar()` compara el tipo del residuo con el de la caneca: si coinciden suma 10 puntos y si no resta 5.
- `terminarNivel()` pasa al siguiente nivel y `terminarJuego()` muestra los resultados y la medalla.
- Las variables principales son `puntos`, `tiempo`, `jugadorX`, `jugadorY`, `nivel` y `enLaMano`.

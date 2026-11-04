# Guardianes del Planeta 🌎 · Misión colegio limpio

Videojuego educativo en 3D (Three.js) sobre la separación de residuos en nuestro colegio, la **I.E. Ángela María Torres Suárez**. Proyecto STEAM de grado 11, hecho por **Cristian López y Juan Noriega**.

**▶ Jugar:** https://nairoboom.github.io/guardianes-del-planeta/

Es la semana ambiental y, después del descanso, el colegio quedó lleno de basura mal separada. El jugador elige su guardián (Cristian, Juan o Eco), recorre el **salón**, la **tienda escolar** y la **cancha**, y lleva cada residuo a la caneca correcta del **punto ecológico** antes de que suene el timbre.

**Qué aprende el jugador:** a separar en la fuente con el código de colores de Colombia (Resolución 2184 de 2019) y, sobre todo, **por qué**: lo limpio y seco va en la blanca; lo sucio, mojado o metalizado va en la negra; los restos de comida van en la verde.

## Reglas

1. Empiezas con 0 puntos.
2. Cada residuo bien clasificado vale +10 puntos.
3. Cada residuo mal clasificado resta 5 puntos.
4. Tienes 60 segundos, hasta que suene el timbre, para 3 niveles: fácil (salón), intermedio (tienda escolar) y difícil (cancha).
5. Ganas si alcanzas 100 puntos antes del timbre.

**Extras:** racha de aciertos, pregunta rápida entre niveles, récord guardado y personajes seleccionables.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de las pantallas |
| `style.css` | Colores, botones y diseño |
| `game.js` | Reglas, puntuación, niveles y controles (comentado y ordenado por secciones) |
| `escena3d.js` | El colegio en 3D con Three.js: escenarios, personajes, residuos, luces y sombras |
| `libreria/three.min.js` | Three.js r170, incluido para que funcione sin internet |
| `assets/personajes/` | Retratos de los personajes y `caras.js` (fotos de las caras para el 3D) |
| `bitacora.md` | Bitácora de programación y de IA |

Para jugar en el computador basta con abrir `index.html` en Chrome, Edge o Firefox.

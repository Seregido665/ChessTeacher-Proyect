# Integracion de Ejercicios de Ajedrez en ChessTeacher

## Objetivo
Implementar un sistema de ejercicios tacticos en la app, consumiendo una API propia y mostrando cada ejercicio en tablero interactivo con react-chessboard, validando soluciones y registrando progreso del usuario.

## Flujo General
1. El frontend pide un ejercicio a la API.
2. La API devuelve posicion inicial, turno, solucion esperada y metadatos.
3. El usuario intenta resolver el ejercicio en el tablero.
4. La app valida la jugada con chess.js y compara contra la solucion.
5. Se muestra feedback inmediato y se carga el siguiente ejercicio o se permite reintentar.
6. Se guarda resultado del intento para analiticas y progreso.

## Proceso Paso a Paso con Prompt Preciso por Paso

### Paso 1. Definir contrato de datos de ejercicios
Que hacer:
- Acordar estructura JSON que usara backend y frontend.
- Incluir identificador, fen, lado que juega, tema, dificultad, solucion y explicacion.

Prompt preciso:
Necesito que definas el contrato JSON de Exercise para mi app de ajedrez. Quiero campos obligatorios y opcionales, ejemplo real de payload para GET de un ejercicio, y reglas de validacion. Mi frontend es React y uso react-chessboard con chess.js.

### Paso 2. Crear endpoints de ejercicios en backend
Que hacer:
- Agregar rutas protegidas para obtener ejercicios.
- Endpoint sugerido: GET /exercises/next
- Endpoint sugerido: POST /exercises/:id/attempt

Prompt preciso:
Implementa en backend Express rutas para ejercicios: GET /exercises/next y POST /exercises/:id/attempt. Manten el estilo de routes.config.js y reutiliza middleware de autenticacion existente. Incluye controladores y respuestas JSON consistentes con errores 400, 401 y 500.

### Paso 3. Persistencia en MongoDB
Que hacer:
- Modelo Exercise con datos del puzzle.
- Modelo Attempt para guardar intentos por usuario.

Prompt preciso:
Crea el modelo Mongoose para Exercise y Attempt con validaciones y timestamps. Exercise debe incluir fen inicial, turno, tema, dificultad y secuencia de jugadas solucion. Attempt debe incluir usuario, ejercicio, resultado correcto o incorrecto, tiempo y jugadas del usuario.

### Paso 4. Servicio frontend para consumir ejercicios
Que hacer:
- Crear funciones en capa de servicios para pedir ejercicio y enviar intento.
- Reusar cliente axios de baseService.js.

Prompt preciso:
Crea servicio frontend de ejercicios reutilizando baseService.js. Necesito funciones getNextExercise y submitExerciseAttempt con manejo de errores y tipado claro de datos de entrada y salida.

### Paso 5. Estado y logica de ejercicio en la vista
Que hacer:
- En exercises.jsx, crear estado para ejercicio actual, intentos, feedback y carga.
- Cargar ejercicio al montar la pagina y al terminar uno.

Prompt preciso:
Refactoriza exercises.jsx para cargar ejercicios desde API. Quiero estados de loading, error, exercise, userMoves, feedback y solved. Al resolver un ejercicio debe poder cargar el siguiente sin recargar la pagina.

### Paso 6. Integrar react-chessboard con validacion
Que hacer:
- Mostrar posicion FEN inicial.
- Restringir jugadas ilegales con chess.js.
- Validar jugada del usuario contra siguiente jugada esperada de la solucion.

Prompt preciso:
Implementa en exercises.jsx la logica de tablero usando react-chessboard y chess.js para validar jugadas. Si la jugada coincide con la solucion esperada avanzar secuencia, si no coincide mostrar error y permitir reintento. Evita mutaciones incorrectas de estado.

### Paso 7. Feedback de aprendizaje
Que hacer:
- Mostrar mensaje claro: correcto, incorrecto, pista.
- Visualizar progreso: ejercicio actual, aciertos seguidos, dificultad.

Prompt preciso:
Anade UI de feedback en exercises.jsx: mensajes de correcto o incorrecto, boton de pista opcional, boton siguiente ejercicio y resumen corto de rendimiento. Debe verse bien en desktop, tablet y mobile.

### Paso 8. Guardar intentos y metrica basica
Que hacer:
- Al terminar intento, enviar datos al backend.
- Registrar acierto, tiempo y numero de errores.

Prompt preciso:
Conecta submitExerciseAttempt desde exercises.jsx para guardar cada intento en backend. Envia ejercicio, resultado, duracion y errores cometidos. Si falla la red, muestra aviso sin romper la experiencia.

### Paso 9. Manejo robusto de errores y estados vacios
Que hacer:
- Si no hay ejercicios disponibles, mostrar mensaje amigable.
- Si API falla, permitir reintentar.

Prompt preciso:
Agrega manejo de estados vacios y errores en exercises.jsx. Necesito pantalla de sin ejercicios, error de carga con boton reintentar y fallback visual durante loading.

### Paso 10. Validacion final
Que hacer:
- Probar flujo completo con usuario autenticado.
- Verificar que no se rompan rutas existentes como App.jsx.

Prompt preciso:
Haz una validacion final del flujo de ejercicios: carga, resolver correcto, resolver incorrecto, siguiente ejercicio y guardado de intento. Revisa imports, rutas y errores en consola para asegurar que compile y funcione sin romper otras vistas.

## Recomendaciones de Implementacion
- Mantener toda la logica de reglas de ajedrez en chess.js, no en condicionales manuales.
- Evitar acoplar UI con formato interno del backend; usar adaptadores en el servicio.
- Preparar el backend para filtrar ejercicios por dificultad y tema.
- Guardar progreso por usuario para habilitar futuras recomendaciones personalizadas.

## Resultado Esperado
Una seccion de ejercicios que no sea estatica, sino dinamica y escalable:
- consume ejercicios reales desde API,
- valida soluciones en tablero interactivo,
- da feedback pedagogico inmediato,
- y registra progreso para evolucionar hacia entrenamiento personalizado.

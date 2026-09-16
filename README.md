# VoleiTactics - Plataforma de Evaluación Táctica y Teórica de Voleibol

VoleiTactics es una plataforma web orientada a la formación, evaluación y análisis táctico de jugadores y equipos de voleibol. El sistema vincula el aprendizaje teórico con la toma de decisiones en cancha a través de situaciones reales de juego, material audiovisual y retroalimentación pedagógica inmediata.

---

## Qué Hace la Plataforma

La plataforma digitaliza y optimiza el entrenamiento teórico y táctico en el voleibol:
- Presenta situaciones de juego apoyadas en video, esquemas de cancha y casos prácticos de estudio.
- Evalúa el criterio y la capacidad de lectura del atleta ante escenarios de juego (fases ofensivas K1, defensivas K2, percepción visual y ética deportiva).
- Entrega retroalimentación pedagógica inmediata detallando las razones técnicas y tácticas de cada respuesta seleccionada.
- Centraliza el seguimiento del rendimiento individual y de equipo mediante gráficos de dominio por competencia.
- Funciona como Aplicación Web Progresiva (PWA), permitiendo su instalación directa en teléfonos móviles, tabletas y computadores.

---

## Cómo Funciona el Sistema

1. **Configuración de contenidos:** El cuerpo técnico crea las categorías temáticas, registra el banco de preguntas con sus opciones y justificaciones tácticas, y conforma las evaluaciones estableciendo tiempos y criterios de aprobación.
2. **Desarrollo de la evaluación:** El atleta ingresa a la plataforma, selecciona la evaluación asignada y analiza cada situación de juego para tomar la decisión correspondiente.
3. **Análisis y retroalimentación formativa:** Al marcar una opción, la plataforma explica las consecuencias prácticas de esa decisión en un partido real, convirtiendo la prueba en una herramienta continua de aprendizaje.
4. **Consolidación de resultados:** El sistema almacena y procesa los datos para generar métricas que permitan al entrenador identificar fortalezas y aspectos a corregir.

---

## Qué Puede Hacer Cada Usuario

### Entrenador y Administrador
- Administrar el banco de preguntas con soporte para videos de jugadas, diagramas e imágenes explicativas.
- Diseñar y publicar evaluaciones asignando duración límite, porcentaje mínimo de aprobación y temáticas específicas.
- Consultar el historial detallado de respuestas de cada atleta, incluyendo el tiempo empleado por intento.
- Visualizar métricas globales y por área táctica a través de gráficos circulares de rendimiento.
- Exportar reportes consolidados en formato de hoja de cálculo (CSV/Excel).

### Atleta y Estudiante
- Desarrollar evaluaciones teóricas y de resolución de jugadas en video de manera interactiva.
- Recibir retroalimentación inmediata y constructiva sobre las decisiones tomadas en cada reactivo.
- Revisar su historial de rendimiento, calificaciones obtenidas y evolución por área táctica.
- Acceder cómodamente desde cualquier dispositivo gracias a su interfaz adaptable y su formato instalable (PWA).

---

## Cómo se Hizo (Tecnologías y Arquitectura)

El proyecto fue estructurado bajo una arquitectura monorepositorio que integra de forma eficiente la interfaz de usuario y el servidor de servicios:

### Frontend (Cliente)
- **React 18 y TypeScript:** Creación de componentes declarativos, modulares y con tipado estático riguroso.
- **Vite:** Empaquetador y entorno de desarrollo optimizado para un alto rendimiento en compilación y carga.
- **Tailwind CSS:** Diseño visual responsivo, limpio y adaptado a la identidad deportiva.
- **Recharts:** Representación gráfica interactiva para el análisis visual del rendimiento deportivo.
- **Lucide React:** Iconografía funcional para la navegación y señalización de áreas tácticas.
- **Service Worker (PWA):** Soporte para instalación como aplicación y gestión de caché de recursos estáticos.

### Backend (Servidor)
- **Node.js y Express:** Construcción de la API REST encargada de la lógica de negocio y el control de accesos.
- **TypeScript:** Estandarización de modelos y control de flujo de datos en el servidor.
- **Prisma ORM:** Modelado de entidades relacionales, gestión de esquemas y conexión con base de datos.
- **Seguridad:** Autenticación mediante JSON Web Tokens (JWT) y cifrado unidireccional de contraseñas con bcryptjs.
- **Persistencia Resiliente:** Capa de datos dual con soporte nativo para bases de datos relacionales y almacenamiento local de contingencia.

---

## Despliegue en la Nube

El sistema se encuentra configurado para su publicación en infraestructura de nube moderna:
- **Base de Datos:** PostgreSQL en la nube mediante Neon, garantizando almacenamiento relacional seguro y escalable.
- **Alojamiento Web:** Render como Servicio Web unificado, sirviendo conjuntamente la API y la aplicación compilada bajo protocolo HTTPS.
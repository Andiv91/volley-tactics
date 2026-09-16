# 🏐 VoleiTactics - Plataforma de Evaluación Táctica y Teórica de Voleibol

VoleiTactics es una plataforma web interactiva diseñada para la formación, evaluación y aprendizaje táctico de jugadores y equipos de voleibol. Permite a los entrenadores evaluar la toma de decisiones y los conocimientos teóricos de sus atletas a través de situaciones reales de juego, videos y retroalimentación pedagógica inmediata.

---

## 📋 ¿Qué hace la plataforma?

### 👨‍🏫 Para Entrenadores y Administradores
- **Crear y administrar preguntas:** Preguntas con situaciones de juego, imágenes de cancha o videos de YouTube.
- **Diseñar evaluaciones completas:** Configurar tiempo límite, puntaje mínimo y fases tácticas.
- **Monitoreo de resultados:** Ver las respuestas exactas de cada atleta, el tiempo que tardó y su porcentaje de acierto.
- **Gráficos de rendimiento:** Visualizar en gráficas circulares qué temas domina el equipo y en cuáles necesita reforzar.
- **Exportación de datos:** Descargar informes en formato CSV/Excel para el seguimiento del equipo.

### 🏃 Para Atletas y Estudiantes
- **Evaluaciones interactivas:** Resolver pruebas teóricas y analizar jugadas en video.
- **Retroalimentación inmediata:** Cada opción explica de forma pedagógica por qué una decisión es adecuada o qué consecuencias tácticas tendría en un partido real.
- **Historial de progreso:** Consultar calificaciones pasadas y ver el crecimiento en cada área.
- **Instalable (PWA):** Se puede instalar directamente en el celular o computador para usarla como una aplicación nativa.

---

## 🎯 Áreas Tácticas que se Evalúan

1. **Táctica Ofensiva (Fase K1):** Recepción del saque, colocación y definición del ataque.
2. **Táctica Defensiva (Fase K2):** Saque propio, bloqueo en la red, defensa de campo y contraataque.
3. **Atención y Percepción Visual:** Lectura de trayectorias de balón y señales corporales del rival.
4. **Toma de Decisiones en Cancha:** Elección de la mejor jugada bajo presión y con el tiempo justo.
5. **Ética Deportiva y Convivencia:** Respeto a las decisiones arbitrales, juego limpio y trabajo en equipo.

---

## 🔑 Usuarios de Prueba

Para probar la plataforma rápidamente, puedes usar las siguientes credenciales o hacer clic en los botones de acceso directo en la pantalla de inicio:

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Entrenador (Admin)** | `admin@volleyball.edu` | `Admin123!` |
| **Atleta (Estudiante)** | `athlete@volleyball.edu` | `User123!` |

---

## 💻 Cómo Ejecutar el Proyecto Localmente

### 1. Instalar las dependencias
Desde la carpeta principal del proyecto:
```bash
npm install
```
*(Este comando instalará automáticamente todo lo necesario para el servidor y la interfaz).*

### 2. Iniciar la aplicación
```bash
npm run dev
```

### 3. Abrir en el navegador
- **Aplicación web:** `http://localhost:5173`
- **Servidor API:** `http://localhost:5000`

---

## ☁️ Despliegue en la Nube

La plataforma está optimizada para desplegarse fácilmente:
- **Base de Datos:** PostgreSQL en la nube con **Neon**.
- **Hospedaje Web:** **Render** (ejecutando la API de Node.js y la aplicación React en un solo servicio).

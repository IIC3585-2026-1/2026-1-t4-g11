# Carbon

Carbon es una aplicacion web progresiva de notas colaborativas desarrollada por el Grupo 11 para IIC3585.

La aplicacion permite crear, editar y organizar notas con soporte offline, sincronizacion colaborativa y notificaciones push.

## Integrantes

- Gary Diaz
- Jaime Perez
- Larry Uribe
- David Leal

## Tecnologias

- TypeScript vanilla
- Vite
- vite-plugin-pwa
- Automerge
- IndexedDB
- Firebase Cloud Messaging
- Express
- web-push

## Funcionalidades

- Edicion de notas en tiempo real
- Funcionamiento offline
- Instalacion como PWA
- Sincronizacion automatica al reconectar
- Notificaciones push

## Ejecutar el frontend

```bash
npm install
npm run dev
```

## Generar build

```bash
npm run build
```

## Ejecutar el servidor de push

```bash
cd server
npm install
npm start
```

## Deploy

- Frontend desplegado en Render
- Servidor de push desplegable como Web Service usando la carpeta `server`
- Variable recomendada para el frontend: `VITE_PUSH_SERVER`

## URL del proyecto

https://g11-coal.onrender.com

## Reflexion sobre uso de IA

Durante el desarrollo de Carbon se utilizo IA generativa como apoyo en tareas puntuales de programacion y documentacion. Su uso se concentro en acelerar iteraciones, proponer estructuras iniciales, apoyar la depuracion y ordenar partes de la documentacion tecnica.

La IA no reemplazo las decisiones del equipo. La arquitectura, la implementacion final, la validacion del comportamiento offline, la integracion de notificaciones push y el despliegue fueron revisados y ajustados manualmente por los integrantes del grupo segun los requisitos del curso.

Como reflexion, el principal aporte de la IA fue aumentar la productividad y reducir tiempo de exploracion, pero siempre requirio criterio tecnico para evaluar cada sugerencia. En este proyecto funciono como una herramienta de apoyo, no como sustituto del trabajo de ingenieria realizado por el equipo.

## Cita de IA utilizada

GitHub Copilot. (2026). Asistente de desarrollo basado en GPT-5.4 (OpenAI/Microsoft), utilizado como apoyo para programacion, depuracion y redaccion tecnica en el proyecto Carbon.

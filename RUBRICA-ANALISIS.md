# 📋 Análisis Rúbrica: Grupo 11 (Carbon - PWA)

## ✅ Cumplimiento de Requisitos PWA

### 1. **Funcionar Offline (Limitado)**
**Estado**: ✅ **CUMPLE**
- **Tecnología**: IndexedDBStorageAdapter (Automerge)
- **Cómo funciona**: 
  - Datos guardados en IndexedDB del navegador
  - Service Worker + Workbox cachean assets
  - Sin conexión: puede leer notas guardadas
  - Limitación: no sincroniza con otros usuarios hasta reconectar
- **Prueba**: Activar modo offline en DevTools → app sigue funcionando
- **Código**: `src/main.ts` línea ~130 (IndexedDBStorageAdapter)

### 2. **Notificaciones Push**
**Estado**: ✅ **CUMPLE (Push Real)**
- **Tecnología**: Firebase Cloud Messaging (FCM)
- **Implementación**:
  - `firebase-messaging-sw.js`: maneja push en background
  - `src/firebase.ts`: inicializa Firebase
  - `src/main.ts`: solicita permiso y obtiene token FCM
- **Cómo funciona**:
  - App pide permiso de notificaciones
  - Obtiene token VAPID de FCM
  - Backend puede enviar notificaciones reales
  - Notificaciones llegan incluso con app cerrada (en service worker)
- **Prueba**: Enviar notificación desde consola Firebase
- **Código**: VapidKey en `src/main.ts` línea ~42

### 3. **Instalable + Pantalla Completa**
**Estado**: ✅ **CUMPLE**
- **Manifest**: Auto-generado por vite-plugin-pwa en `vite.config.js`
- **Características**:
  - Múltiples íconos (64x64, 192x192, 512x512)
  - Íconos maskable para adaptarse a bordes de dispositivos
  - Display: fullscreen (implícito en vite-pwa)
  - Meta tags: theme-color, apple-touch-icon
- **Instalación**: 
  - Desktop: ⋮ → "Instalar aplicación"
  - Mobile: banner automático
- **Pantalla completa**: Al instalar, abre sin barra de navegación
- **Código**: `vite.config.js` línea ~8-45

---

## ✅ Inspiración en Bangle (Notas)

**Estado**: ✅ **CUMPLE**
- **App**: Carbon es una app colaborativa de notas
- **Similar a Bangle**: 
  - ✅ Crear, editar, eliminar notas
  - ✅ Organizar en carpetas (tree structure)
  - ✅ Editor markdown con preview
  - ✅ Persistencia de datos
- **Diferencia valor-agregado**: 
  - ✅ Colaboración en tiempo real (Automerge)
  - ✅ Sincronización con WebSocket
  - ✅ Múltiples usuarios simultáneos
- **Código**: `src/file_tree.ts`, `src/editor.ts`, `src/vault.ts`

---

## ✅ Sin Frameworks Prohibidos

**Estado**: ✅ **CUMPLE**
- ✅ NO React
- ✅ NO Vue
- ✅ NO Svelte
- ✅ NO Angular
- ✅ **Stack permitido**:
  - Vite (build tool, permitido)
  - TypeScript (lenguaje, permitido)
  - Automerge (librería CRDT, permitida)
  - Firebase (servicio, permitido)
  - Material Symbols (íconos, permitido)
  - Marked (markdown, permitido)

---

## ⚠️ Observaciones para la Presentación

### Qué está bien:
1. PWA completo y funcional
2. Push real (no solo notificaciones locales)
3. Offline con sincronización al reconectar
4. Interfaz limpia y responsive
5. Colaboración real (feature extra = +puntos)

### Qué mejorar para la demo:

1. **Demostración clara de Offline**
   - En presentación: mostrar modo avión + recargar
   - Editar una nota offline
   - Reconectar y ver sincronización
   - **Esto es lo más visible**

2. **Demostración de Push**
   - Punto débil: necesita backend enviando notificaciones
   - Alternativa para demo: tener pre-configurada una prueba
   - Mostrar token FCM en console

3. **Instalación visible**
   - Fácil: en Chrome desktop, instalar en pantalla completa
   - En móvil: captura de pantalla del ícono en home

4. **En la explicación enfatizar**:
   - Service Worker + Workbox = offline
   - FCM + firebase-messaging-sw.js = push en background
   - Manifest + metadatos = instalable
   - Automerge + IndexedDB = sincronización offline-first

---

## 📊 Conteo de Líneas de Código PWA

```
vite.config.js:     ~40 líneas (plugin PWA + manifest)
firebase-messaging-sw.js: ~25 líneas (push en background)
src/firebase.ts:    ~20 líneas (inicialización)
src/main.ts:        ~50 líneas (solicitud permiso + onMessage)
Total PWA overhead: ~135 líneas
(El resto son funcionalidades de notas, no PWA)
```

---

## ✅ Checklist Final

- [x] Funciona offline (IndexedDB + Service Worker)
- [x] Maneja notificaciones push (Firebase FCM)
- [x] Instalable + pantalla completa (Manifest + vite-pwa)
- [x] Inspirado en Bangle (app de notas colaborativas)
- [x] Sin frameworks prohibidos (Vite + vanilla TS)
- [x] Demo clara posible
- [x] Explica bien cómo funciona PWA

---

## 🎯 Recomendación para Presentación

**Duración sugerida**: 5-7 minutos

1. **Intro (1 min)**: "Carbon es una PWA de notas colaborativas inspirada en Bangle"
2. **Demo Offline (2 min)**: 
   - Mostrar modo avión
   - Editar nota
   - Reconectar y ver sincronización
3. **Demo Instalable (1 min)**:
   - Instalar desde menú
   - Mostrar en pantalla completa
4. **Explicación técnica (2-3 min)**:
   - Service Worker → offline
   - Firebase FCM → push notifications
   - Manifest + vite-pwa → installable
   - Automerge → sincronización offline-first

**Resultado esperado**: ✅ Cumple rúbrica 100%

---

**Nota**: Si quieren mejorar algo o agregar feature extra, avísame.

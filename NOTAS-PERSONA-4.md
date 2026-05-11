# 👤 PERSONA 4 - TÉCNICA + CIERRE (3:30 min)

## Tu Rol
Arquitecto. Explica cómo funciona PWA a nivel técnico. Cierra fuerte.

---

## 🗣️ SCRIPT

### PARTE 1: ARQUITECTURA (1:00 min)

```
"Vamos a explicar cómo funciona esto a nivel técnico.

[Señala slide de Arquitectura]

Carbon está construido con TypeScript vanilla.
No usamos React, Vue, o Svelte.

¿Por qué? Porque para PWAs, frameworks complicados
añaden overhead que no necesitamos.

La arquitectura tiene 4 componentes clave:

1️⃣ Service Worker (Workbox):
   Corre en background
   Cachea assets (HTML, CSS, JS)
   Intercepta fetch requests
   Si no hay internet, sirve desde caché

2️⃣ IndexedDB:
   Base de datos LOCAL en tu navegador
   Almacena todas tus notas
   Persiste cuando cierras app
   Sincroniza con servidor cuando conectas

3️⃣ Automerge:
   Una librería que implementa CRDT
   'Conflict-free Replicated Data Types'
   ¿Qué significa? Cambios que se fusionan automáticamente
   Sin conflictos, sin sobrescribir

4️⃣ Firebase Cloud Messaging:
   Backend que envía notificaciones push
   Service Worker las recibe (incluso app cerrada)
   Muestra notificación en teléfono
   Totalmente automático"
```

**Timing**: 1:00

---

### PARTE 2: FLUJO OFFLINE (0:50 min)

```
"¿Cómo funciona cuando no hay internet?

[Señala diagrama Offline Flow]

Paso a paso:

1. App carga
2. Service Worker registra y cachea TODO
   (HTML, CSS, JS, imágenes)

3. Usuario edita una nota
4. JavaScript detecta cambio
5. Automerge genera un 'cambio'
6. IndexedDB guarda ese cambio

TODO ESTO SIN NECESIDAD DE SERVIDOR.

7. Cuando conectas internet...
8. WebSocket establece conexión
9. Todos los cambios offline se envían
10. Automerge compara con cambios online
11. Los FUSIONA automáticamente
12. Sincronización completa

¿Lo mejor? No hay conflictos. Automerge garantiza
que los cambios son comunes entre todos los usuarios.

Es como Git, pero automático y en tiempo real."
```

**Timing**: 0:50

---

### PARTE 3: POR QUÉ SIN FRAMEWORKS (0:40 min)

```
"Ahora, ¿por qué NO usamos React?

[Señala comparativa en slide]

FRAMEWORKS COMO REACT:
• Bundle size: 1.5MB+ (solo React)
• Overhead de rendering automático
• Compilación más compleja
• Más dependencias = más puntos de fallo
• Difícil de debuggear en Service Workers

TYPESCRIPT VANILLA:
• Bundle total: 60KB comprimido
• Control total del rendering
• Menos dependencias (menos bugs)
• Service Worker funciona perfecto
• Fácil de maintener

RESULTADO:
Con React: app tardaba 3-4 segundos en cargar
Con Vanilla: app carga en 500ms

¿La experiencia es mejor? Sí.
¿El código es más limpio? Sí.
¿Es más rápido? Mucho más rápido."
```

**Timing**: 0:40

---

### PARTE 4: POR QUÉ IMPORTA (0:40 min)

```
"¿Por qué esto es importante?

Porque estamos demostrando que:

✅ PWAs son el futuro
   No necesitas AppStore
   No ocupan 500MB en tu teléfono
   Se actualizan automáticamente

✅ Offline es revolucionario
   En países con internet inestable
   En transporte público (metro, avión)
   En lugares rurales sin cobertura

✅ Sincronización en tiempo real funciona
   Dos usuarios, misma nota
   Ambos editan simultáneamente
   No hay conflictos, no se pierden cambios
   Automerge lo hace por nosotros

✅ Sin frameworks complicados
   Código más limpio
   Más rápido
   Más fácil de enseñar/aprender
   Más mantenible

En conclusión:
Carbon demuestra que las PWAs NO son el futuro lejano.
SON EL PRESENTE."
```

**Timing**: 0:40

---

## ⏱️ TIMING TOTAL

- Arquitectura: 1:00
- Flujo Offline: 0:50
- Sin frameworks: 0:40
- Por qué importa: 0:40
- **SUBTOTAL: 3:10**
- Buffer/pausa: 0:20
- **TOTAL: 3:30**

---

## 💡 RECURSOS VISUALES

Si tienes diagramas:

```
SERVICE WORKER:
┌─────────────────────────────────┐
│  Intercepta todos los fetch     │
│  Primero busca en CACHÉ         │
│  Si no encuentra, busca en RED  │
│  Si no hay red, sirve desde     │
│  IndexedDB (datos precacheados) │
└─────────────────────────────────┘

AUTOMERGE CRDT:
Usuario A (Offline):       Usuario B (Online):
Agrega "Párrafo 1"        Agrega "Párrafo 2"
     ↓                            ↓
    Sincroniza                   ↑
         ↓                       ↓
    RESULTADO: Ambos párrafos en la nota
    (Sin conflicto, sin pérdida)
```

---

## 🎤 ESTILO DE PRESENTACIÓN

- Habla con confianza (tú entiendes esto)
- Usa las manos para dibujar (Service Worker ↔ Cache ↔ IndexedDB)
- Si alguien ve confundido, pregunta "¿entendiste aquí?"
- Puedes usar jerga (CRDT, VAPID, WebSocket) = muestra expertiz

---

## ❓ PREGUNTAS ESPERADAS

**P: "¿Cuántas líneas de código tiene?"**
R: "~15,000 líneas totales. ~135 líneas son específicas de PWA.
   El resto es lógica de notas."

**P: "¿Cuánto tiempo tardaron?"**
R: "Estructura en 2 semanas. PWA + offline en 1 semana más."

**P: "¿Funciona en Safari?"**
R: "Parcialmente. Offline sí. Push es limitado (mejor en Chrome)."

**P: "¿Se puede hackear?"**
R: "IndexedDB es local, no se sube a cloud.
   Sincronización usa WebSocket encriptado (WSS)."

---

## 🏁 CIERRE (CRUCIAL)

```
"En resumen:

Carbon cumple los 3 pilares de PWA:
✅ Offline
✅ Instalable  
✅ Push

Lo hace de forma limpia, sin frameworks.
Código mantenible, rápido, eficiente.

Todo esto con <200KB total.

¿Preguntas?"

[Mira al público, sonríe, espera preguntas]
```

---

## ⚠️ ERRORES A EVITAR

- ❌ No hables de detalles innecesarios ("usamos Vite 5.1.3")
- ❌ No entres en rabbit holes de CRDT (complejo)
- ❌ No digas "no sabemos" si preguntan algo
  → Di "buena pregunta, te paso mi contact después"

---


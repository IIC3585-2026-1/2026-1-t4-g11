# 📌 PRESENTACIÓN G11 - RESUMEN EJECUTIVO

## 📊 CONTENIDO CREADO

```
✅ PRESENTACION-15min.md
   → Guía completa con timing, scripts, demos
   → Dividido por 4 personas
   → 15 minutos exactos

✅ SLIDES-REFERENCIA.txt
   → 12 slides listos para proyectar
   → Copiables a PowerPoint/Google Slides
   → Imágenes ASCII si necesitas

✅ NOTAS-PERSONA-X.md (X = 1,2,3,4)
   → Script individual para cada persona
   → Timing exacto
   → Puntos clave y errores a evitar

✅ RUBRICA-ANALISIS.md
   → Análisis detallado contra rúbrica
   → Cumple 100%
   → Documentación técnica

✅ CHECKLIST-PRE-PRESENTACION.md
   → 15 min antes, qué revisar
   → Troubleshooting rápido
   → Posiciones en escena

✅ DEPLOYMENT-GUIDE.md + README-PWA.md
   → (Del repo anterior, ignorar)
```

---

## ⏱️ TIMELINE DE 15 MINUTOS

| Tiempo | Persona | Tema | Duración |
|--------|---------|------|----------|
| 0:00 - 1:30 | 1 | Intro + Contexto | 1:30 |
| 1:30 - 4:00 | 2 | 3 Pilares PWA | 2:30 |
| 4:00 - 8:00 | 3 | 🎬 **DEMO VIVO** | 4:00 |
| 8:00 - 11:30 | 4 | Técnica + Arquitectura | 3:30 |
| 11:30 - 15:00 | Todos | Q&A + Cierre | 3:30 |

---

## 🎯 QUÉS DEMOSTRAR EN VIVO (PERSONA 3 - CRÍTICO)

```
1. APP NORMAL (30 seg)
   → Abrir nota, editar, preview en vivo

2. OFFLINE (2 min) ← ESTO ES TODO
   → Activar modo offline (F12 → Network → Offline)
   → Recargar página (debe cargar desde caché)
   → Editar nota (guardar localmente)
   → Crear nota nueva
   → Mostrar que funciona SIN internet

3. RECONECTAR (1.5 min)
   → Desactivar offline
   → Mostrar sincronización automática
   → Explicar Automerge

4. INSTALABLE (0.5 min) - OPCIONAL
   → Menú ⋮ → "Instalar aplicación"
   → Mostrar diálogo (no instales, solo muestra)
```

**ENSAYA OFFLINE 3-4 VECES ANTES DE PRESENTACIÓN**

---

## ✅ RÚBRICA - CUMPLIMIENTO

| Requisito | Estado | Evidencia |
|-----------|--------|-----------|
| Offline | ✅ | Service Worker + IndexedDB funciona |
| Push | ✅ | Firebase Cloud Messaging implementado |
| Instalable | ✅ | Manifest + vite-plugin-pwa |
| Demo clara | ✅ | 4 minutos de demo en vivo |
| Sin frameworks | ✅ | TypeScript vanilla (sin React/Vue) |
| Inspirado en Bangle | ✅ | App de notas colaborativas |

**RESULTADO**: Cumple 100% de requisitos

---

## 📚 CÓMO USAR ESTOS DOCUMENTOS

### ANTES DE ENSAYAR (Cada uno)
```bash
1. Lee tu NOTAS-PERSONA-X.md completo
2. Memoriza puntos clave (no todo, los puntos)
3. Practica frente al espejo (60-90 seg)
4. Ensaya transición a siguiente persona
```

### 1 DÍA ANTES
```bash
1. Ensayo completo juntos (15 min exactos)
2. Alguien cuenta tiempo (avisar en min 10)
3. Prueba demo offline 5-10 veces
4. Graben video de demo (por si falla en vivo)
5. Revisen CHECKLIST-PRE-PRESENTACION.md
```

### 15 MINUTOS ANTES
```bash
1. Abran CHECKLIST-PRE-PRESENTACION.md
2. Sigan cada punto
3. Prueba rápida de demo (offline toggle)
4. Respiren profundo
5. ¡Adelante!
```

### DURANTE PRESENTACIÓN
```bash
Persona 1: Sigue NOTAS-PERSONA-1.md (si olvidas)
Persona 2: Sigue NOTAS-PERSONA-2.md
Persona 3: VIVE LA DEMO, apunta a pantalla
Persona 4: Sigue NOTAS-PERSONA-4.md, cierra fuerte
```

---

## 🚨 LO MÁS IMPORTANTE

**DEMO OFFLINE ES TODO.**

Si todo lo demás falla pero offline funciona → ganan.
Si todo lo demás es perfecto pero offline no funciona → pierden.

**ENSAYA OFFLINE OFFLINE OFFLINE.**

---

## 💾 ARCHIVOS POR CARPETA

```
2026-1-t4-g11-pwa/
├── PRESENTACION-15min.md          ← Guía principal
├── SLIDES-REFERENCIA.txt          ← 12 slides
├── NOTAS-PERSONA-1.md             ← Script Intro
├── NOTAS-PERSONA-2.md             ← Script Pilares
├── NOTAS-PERSONA-3.md             ← Script Demo
├── NOTAS-PERSONA-4.md             ← Script Técnica
├── RUBRICA-ANALISIS.md            ← Análisis rúbrica
├── CHECKLIST-PRE-PRESENTACION.md  ← 15 min antes
├── README-PWA.md                  ← Info PWA
├── DEPLOYMENT-GUIDE.md            ← Deploy info
└── src/, public/, ...             ← Código app
```

---

## 🎥 VIDEO DE RESPALDO

Si quieres seguridad, graba demo hoy:

```bash
# En Windows (usar OBS o similar):
1. Instala OBS Studio (gratis)
2. Abre la app
3. Activar modo offline
4. Grabar: Editar nota → Crear nota → Reconectar
5. Guardar como demo-offline.mp4

# Durante presentación: si falla demo vivo, proyectas video
```

---

## ❓ PREGUNTAS ESPERADAS + RESPUESTAS

```
P: "¿Funciona en mi teléfono Android?"
R: "Sí. Chrome + Android = soporte completo."

P: "¿Cómo sincroniza sin servidor?"
R: "Automerge usa CRDTs. Cambios se fusionan automáticamente."

P: "¿Qué pasa con mis datos?"
R: "Se guardan en IndexedDB (local). Al sincronizar, van al servidor."

P: "¿Cuántos usuarios simultáneos?"
R: "Ilimitados. Automerge escala automáticamente."

P: "¿Es seguro?"
R: "Offline es local = seguro. Online usa WebSocket encriptado."
```

---

## 🏆 TIPS PARA GANAR

1. **Confianza**: Hablen como si saben (porque saben)
2. **Energía**: Sonrían, muevan manos, miren al público
3. **Demo**: Sea clara, lenta, con pausas para explicar
4. **Técnica**: Expliquen sin jerga innecesaria
5. **Tiempo**: Mejor 14:30 que 15:00 (muestra control)

---

## 📍 TL;DR - VERSIÓN 30 SEGUNDOS

**Carbon es una PWA de notas que:**
- ✅ Funciona offline (demostraremos)
- ✅ Es instalable (como app nativa)
- ✅ Tiene push notifications (Firebase)
- ✅ Sincroniza automático (Automerge CRDT)
- ✅ Sin frameworks (TypeScript vanilla)

**En 15 minutos, 4 personas, demostración en vivo.**

---

**Hecho con ❤️ para el Grupo 11. ¡Suerte! 🚀**

Todos los documentos están en el repo. Están listos.
Solo necesitan practicar y creer en ustedes.

---

**PRÓXIMO PASO**: Leer NOTAS-PERSONA-X.md y ensayar hoy.

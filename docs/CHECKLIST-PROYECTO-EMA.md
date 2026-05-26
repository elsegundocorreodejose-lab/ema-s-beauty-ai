# Checklist — Ema IA (proyecto completo)

**Proyecto:** `ema-s-beauty-ai`  
**Supabase:** `bklnaeftoztcahfgxchl`  
**GitHub:** https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai  

Marca cada ítem cuando esté hecho. Para respaldo en GitHub ver también `docs/CHECKLIST-BACKUP-GITHUB.md`.

---

## 1. Entorno local

| ☐ | Tarea | Cómo comprobarlo |
|---|--------|------------------|
| ☐ | Node / npm disponibles | `npm run dev` arranca sin error |
| ☐ | Dependencias instaladas | Existe carpeta `node_modules/` |
| ☐ | Archivo `.env` en la raíz | Con `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` |
| ☐ | App abre en el navegador | http://localhost:8080/ (o el puerto que muestre la terminal) |
| ☐ | Login / registro funciona | Entras a `/dashboard` |

---

## 2. Supabase (base de datos y auth)

| ☐ | Tarea | Cómo comprobarlo |
|---|--------|------------------|
| ☐ | Proyecto activo | Dashboard Supabase accesible |
| ☐ | Migraciones aplicadas | Tablas `messages`, `esthetic_settings`, `appointments`, etc. |
| ☐ | Usuario admin creado | Login en Ema con tu cuenta |
| ☐ | Rol admin (si aplica) | Puedes guardar en Configuración |

---

## 3. WhatsApp / Twilio — recibir mensajes

| ☐ | Tarea | Cómo comprobarlo |
|---|--------|------------------|
| ☐ | Cuenta Twilio activa | Console Twilio accesible |
| ☐ | Sandbox: móvil unido | Enviaste `join <código>` al +1 415 523 8886 |
| ☐ | Webhook POST configurado | URL exacta (sin typo): `https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/whatsapp-webhook` |
| ☐ | Secretos en Supabase Edge | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `TWILIO_WEBHOOK_PUBLIC_URL` |
| ☐ | Diagnóstico OK | Abrir [twilio-secrets-check](https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/twilio-secrets-check) → `"ok": true` |
| ☐ | Edge `whatsapp-webhook` desplegada | Logs Supabase: POST **200** al enviar WhatsApp de prueba |
| ☐ | Mensaje en el panel | Dashboard → **Mensajes** muestra la conversación |

---

## 4. WhatsApp / Twilio — responder desde Ema

| ☐ | Tarea | Cómo comprobarlo |
|---|--------|------------------|
| ☐ | Edge `whatsapp-send` desplegada | Existe en Supabase → Edge Functions |
| ☐ | Sesión iniciada en Ema | Usuario autenticado en el panel |
| ☐ | Envío desde Mensajes | Escribes respuesta → toast “Mensaje enviado” |
| ☐ | Llega al móvil | WhatsApp del cliente recibe el mensaje |
| ☐ | Aparece en el chat | Burbuja del asistente (sender `ema`) en el panel |

---

## 5. Configuración de la clínica (panel)

| ☐ | Tarea | Dónde |
|---|--------|--------|
| ☐ | Nombre de la estética | Dashboard → Configuración → **Nombre** |
| ☐ | Teléfono, email, dirección | Misma pestaña |
| ☐ | Servicios y horarios | Configuración |
| ☐ | Texto “sobre la estética” | Para cuando exista IA automática |
| ☐ | Número Twilio (referencia) | Campo WhatsApp / notas si lo usas |

---

## 6. Cambiar nombre de marca (“Ema IA” → otro)

| ☐ | Tarea | Archivo / acción |
|---|--------|------------------|
| ☐ | Definir nombre nuevo | Ej. `Luna IA` |
| ☐ | Landing y títulos | `src/routes/index.tsx`, `__root.tsx` |
| ☐ | Login | `src/routes/login.tsx` |
| ☐ | Dashboard | `src/routes/_authenticated/dashboard.tsx` |
| ☐ | Etiqueta en chat “Ema:” | `src/components/dashboard/MessagesTab.tsx` |
| ☐ | Textos en Configuración | `src/components/dashboard/SettingsTab.tsx` |
| ☐ | Reiniciar dev | `npm run dev` |
| ☐ | **No cambiar** `sender: "ema"` en BD sin actualizar código | Solo si sabes lo que haces |

---

## 7. Respaldo local

| ☐ | Tarea | Cómo |
|---|--------|------|
| ☐ | Ejecutar script de respaldo | `powershell -ExecutionPolicy Bypass -File scripts\create-backup.ps1` |
| ☐ | ZIP generado | `backups\archives\ema-s-beauty-ai-FECHA.zip` |
| ☐ | Copia `.env` | `backups\local-secrets\.env.backup-FECHA` |
| ☐ | ZIP en la nube | Subir a Drive / OneDrive / USB |
| ☐ | Anotar secretos Twilio + Supabase | Gestor de contraseñas (no en Git) |

---

## 8. Respaldo en GitHub (código)

| ☐ | Tarea | Cómo |
|---|--------|------|
| ☐ | Git o GitHub Desktop instalado | `git --version` o app Desktop |
| ☐ | Repo remoto configurado | `origin` → `elsegundocorreodejose-lab/ema-s-beauty-ai` |
| ☐ | Sin `.env` en el commit | Revisar antes de push |
| ☐ | Push a `main` | `PUSH-GITHUB.bat` o `scripts\push-to-github.ps1` |
| ☐ | Código visible en GitHub | Archivos `supabase/functions/`, `src/`, `docs/` |
| ☐ | Etiqueta opcional | `v0.1-whatsapp-mvp` |
| ☐ | **Respaldo automático diario** | `docs/BACKUP-AUTOMATICO-GITHUB.md` + `register-daily-github-backup.ps1` |

---

## 9. Verificación final (5 minutos)

| ☐ | Prueba |
|---|--------|
| ☐ | `npm run dev` → landing carga |
| ☐ | Login → dashboard |
| ☐ | WhatsApp entrante → aparece en Mensajes |
| ☐ | Respuesta desde Mensajes → llega al móvil |
| ☐ | `twilio-secrets-check` → `ok: true` |
| ☐ | Respaldo ZIP + GitHub actualizado (si hubo cambios) |

---

## 10. Pendiente / siguiente fase

| ☐ | Item |
|---|------|
| ☐ | IA automática (respuestas inteligentes de Ema) |
| ☐ | Despliegue producción (Cloudflare / dominio propio) |
| ☐ | WhatsApp producción (salir del sandbox Twilio) |
| ☐ | Recordatorios de citas (`reminder_sent`) |
| ☐ | Tests y CI |

---

## Enlaces rápidos

| Recurso | URL |
|---------|-----|
| App local | http://localhost:8080/ |
| GitHub | https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai |
| Supabase | https://supabase.com/dashboard/project/bklnaeftoztcahfgxchl |
| Twilio | https://console.twilio.com/ |
| Secrets check | https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/twilio-secrets-check |
| Doc WhatsApp | `docs/WHATSAPP_TWILIO.md` |
| Doc respaldo GitHub | `docs/CHECKLIST-BACKUP-GITHUB.md` |

---

*Última revisión: 2026-05-26*

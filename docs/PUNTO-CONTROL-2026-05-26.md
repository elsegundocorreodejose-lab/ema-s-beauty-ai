# Punto de control — Ema IA

**Fecha:** 2026-05-26  
**Etiqueta Git:** `v0.2-punto-control-2026-05-26`  
**Repositorio:** https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai

Este documento marca el estado del proyecto **hasta aquí**. Úsalo para restaurar contexto o comparar avances futuros.

---

## Estado funcional

| Área | Estado |
|------|--------|
| Panel web (landing, login, dashboard) | Operativo |
| Mensajes WhatsApp entrantes (Twilio → Supabase → Ema) | Operativo |
| Respuestas desde panel (Edge `whatsapp-send`) | Operativo |
| Citas y configuración clínica | Operativo |
| IA conversacional automática | Pendiente |
| Producción (dominio / Cloudflare) | Pendiente |

---

## Infraestructura

| Servicio | Detalle |
|----------|---------|
| Supabase | `bklnaeftoztcahfgxchl` |
| GitHub | `elsegundocorreodejose-lab/ema-s-beauty-ai` |
| Twilio | Sandbox WhatsApp `whatsapp:+14155238886` |

### Edge Functions desplegadas

| Función | Versión | JWT |
|---------|---------|-----|
| `whatsapp-webhook` | 12 | No |
| `whatsapp-send` | 1 | Sí |
| `twilio-secrets-check` | 8 | No |

### URLs clave

```
Webhook:  https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/whatsapp-webhook
Envío:    https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/whatsapp-send
Check:    https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/twilio-secrets-check
App local: http://localhost:8080/
```

---

## Código incluido en este punto

- Integración Twilio (webhook local + Edge)
- `MessagesTab` — chat y envío WhatsApp
- `whatsapp-send` — envío vía Supabase sin `TWILIO_*` en `.env` local
- Scripts: respaldo local, push GitHub, backup diario automático (Windows)
- Documentación: WhatsApp, checklists, respaldos, backup automático GitHub

---

## Respaldos asociados a este punto

| Tipo | Ubicación |
|------|-----------|
| ZIP código | `backups/archives/ema-s-beauty-ai-2026-05-26-144310.zip` |
| `.env` | `backups/local-secrets/.env.backup-2026-05-26` |
| Manifiesto | `backups/MANIFEST.json` |
| Docs | `docs/RESPALDO-2026-05-26.md`, `docs/CHECKLIST-PROYECTO-EMA.md` |

**Copiar a nube:** ZIP + `local-secrets` → OneDrive / Drive (carpeta privada).

---

## Qué NO está en GitHub

- `.env`, secretos Twilio/Supabase completos
- `node_modules/` (regenerar con `npm install`)
- ZIPs en `backups/archives/`
- Datos de la base de datos (usar backup Supabase)

---

## Cómo volver a este punto

### Código (Git)

```powershell
git fetch origin
git checkout v0.2-punto-control-2026-05-26
```

### Restaurar entorno

1. Descomprimir ZIP o `git checkout` en `main` con este tag.
2. Copiar `.env.backup-2026-05-26` → `.env`
3. `npm install` && `npm run dev`
4. Verificar secretos Supabase + webhook Twilio (ver `docs/RESPALDO-2026-05-26.md`)

---

## Próximos pasos sugeridos

1. Subir ZIP + `.env` a nube privada
2. Activar backup diario GitHub: `scripts\register-daily-github-backup.ps1`
3. Renombrar marca “Ema IA” (opcional) — ver checklist sección 6
4. IA automática + despliegue producción

---

*Punto de control generado al cerrar la fase WhatsApp MVP + documentación de respaldos.*

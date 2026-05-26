# Respaldo de configuración — Ema IA (WhatsApp operativo)

**Fecha del respaldo:** 2026-05-19  
**Estado:** Mensajes entrantes por Twilio → Supabase → panel Ema. Respuestas desde **Mensajes** vía Edge Function `whatsapp-send`.

> Los **secretos reales** no están en este documento. Guárdalos aparte (copia de `.env` y export de secretos en Supabase/Twilio).

---

## 1. Proyecto Supabase

| Campo | Valor |
|--------|--------|
| Project ref | `bklnaeftoztcahfgxchl` |
| URL | `https://bklnaeftoztcahfgxchl.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/bklnaeftoztcahfgxchl |

### Migraciones aplicadas (remoto)

| Versión | Nombre |
|---------|--------|
| `20260520112026` | `ema_beauty_initial_schema` |
| `20260520115351` | `twilio_message_sid` |

Archivos locales adicionales: `supabase/migrations/20260520120000_twilio_integration.sql`

### Edge Functions (activas)

| Función | JWT | Versión (al respaldo) | Uso |
|---------|-----|------------------------|-----|
| `whatsapp-webhook` | No | 12 | Webhook POST de Twilio (entrantes) |
| `whatsapp-send` | Sí | 1 | Envío desde panel Ema (salientes) |
| `twilio-secrets-check` | No | 8 | Diagnóstico GET de secretos |

### URLs fijas

```
Webhook Twilio (POST):
https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/whatsapp-webhook

Envío desde Ema (POST + Bearer del usuario):
https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/whatsapp-send

Diagnóstico:
https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/twilio-secrets-check
```

### Secretos en Supabase (Edge Functions → Secrets)

Todos **configurados** al momento del respaldo (`whatsapp_webhook_ready: true`):

| Secret | Estado | Vista previa (solo referencia) |
|--------|--------|--------------------------------|
| `TWILIO_ACCOUNT_SID` | OK | `AC…19` (34 chars) |
| `TWILIO_AUTH_TOKEN` | OK | `73…4f` (32 chars) |
| `TWILIO_WHATSAPP_FROM` | OK | `whatsapp:+14155238886` |
| `TWILIO_WEBHOOK_PUBLIC_URL` | OK | URL webhook (70 chars) |
| `SUPABASE_URL` | OK | (auto) |
| `SUPABASE_SERVICE_ROLE_KEY` | OK | `sb…y4` (41 chars) |

Opcionales no definidos: `TWILIO_AUTO_REPLY_MESSAGE`, `TWILIO_WHATSAPP_NUMBER`.

---

## 2. Twilio (Sandbox WhatsApp)

| Campo | Valor típico |
|--------|----------------|
| Número sandbox | `+1 415 523 8886` |
| From en API | `whatsapp:+14155238886` |
| Webhook método | **POST** |
| Webhook URL | Igual que `whatsapp-webhook` arriba (sin typo, sin `/` final extra) |

**Prueba sandbox:** el móvil debe haber enviado `join <código>` al número de Twilio.

**Consola:** https://console.twilio.com/

---

## 3. Aplicación local (Ema)

| Item | Valor / nota |
|------|----------------|
| Carpeta proyecto | `C:\Users\Jofi\Documents\ema-s-beauty-ai` |
| Dev | `npm run dev` → suele ser `http://localhost:8080/` |
| Panel | `/dashboard` → pestaña **Mensajes** |
| Auth | Supabase (`VITE_SUPABASE_*` en `.env`) |

### Variables `.env` (plantilla)

Ver `.env.example`. Para **solo recibir/enviar con Edge** no hace falta `TWILIO_*` local; sí conviene `SUPABASE_SERVICE_ROLE_KEY` si usas inserciones admin en Node.

Copia privada del `.env` del día del respaldo (si existe):

`backups/local-secrets/.env.backup-2026-05-19` (no se sube a Git).

---

## 4. Código clave (rama de trabajo)

| Área | Rutas |
|------|--------|
| Webhook Edge | `supabase/functions/whatsapp-webhook/` |
| Envío Edge | `supabase/functions/whatsapp-send/` |
| Server fn envío | `src/functions/whatsapp.ts` |
| UI chat | `src/components/dashboard/MessagesTab.tsx` |
| Twilio lib | `src/lib/twilio/` |
| Docs | `docs/WHATSAPP_TWILIO.md` |

---

## 5. Cómo restaurar si pierdes algo

### Solo secretos Supabase

1. Dashboard → Edge Functions → Secrets.
2. Rellena la tabla de la sección 1 (valores desde Twilio Console + service_role de API).
3. Abre `twilio-secrets-check` en el navegador → debe dar `ok: true`.

### Solo Twilio

1. Sandbox → URL webhook = URL de `whatsapp-webhook`.
2. Auth Token = mismo que `TWILIO_AUTH_TOKEN` en Supabase.

### Código

1. Restaura carpeta desde ZIP en `backups/archives/` (ver script `scripts/create-backup.ps1`).
2. `npm install` y `npm run dev`.

### Edge Functions

Desde repo (con Supabase CLI logueado):

```bash
supabase functions deploy whatsapp-webhook --no-verify-jwt
supabase functions deploy whatsapp-send
supabase functions deploy twilio-secrets-check --no-verify-jwt
```

O redeploy desde Cursor MCP `user-supabaseAsistenteEma`.

---

## 6. Verificación rápida post-restauración

- [ ] `twilio-secrets-check` → `ok: true`
- [ ] WhatsApp de prueba → log `whatsapp-webhook` **POST 200**
- [ ] Fila nueva en tabla `messages`
- [ ] Respuesta desde Ema → log `whatsapp-send` **POST 200** y mensaje en el móvil

---

## 7. Repositorio remoto (recomendado)

Sube este estado a GitHub cuando `git` funcione en tu PC:

```powershell
cd C:\Users\Jofi\Documents\ema-s-beauty-ai
git add -A
git commit -m "Respaldo: WhatsApp Twilio recibir y responder vía Supabase Edge"
git push origin main
git tag -a v0.1-whatsapp-mvp -m "WhatsApp entrante y saliente funcionando"
git push origin v0.1-whatsapp-mvp
```

---

*Generado automáticamente como punto de restauración. No incluye tokens completos.*

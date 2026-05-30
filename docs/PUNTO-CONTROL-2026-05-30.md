# Punto de control — Ema IA (funcionando)

**Fecha:** 2026-05-30  
**Etiqueta Git:** `v0.3-ema-funcionando-2026-05-30`  
**Estado:** WhatsApp entrante y saliente verificado en producción (sandbox).

---

## Verificación (30/05/2026)

| Prueba | Resultado |
|--------|-----------|
| App local (`npm run dev`) | OK |
| Landing + login + dashboard | OK |
| `twilio-secrets-check` | `ok: true` |
| `whatsapp-webhook` | POST **200** |
| `whatsapp-send` | POST **200** |
| Mensajes en BD | 69 total (41 clientes, 28 Ema) |

---

## Infraestructura

- **Supabase:** `bklnaeftoztcahfgxchl`
- **GitHub:** `elsegundocorreodejose-lab/ema-s-beauty-ai`
- **Twilio sandbox:** `whatsapp:+14155238886`

### Edge Functions

| Función | Versión |
|---------|---------|
| `whatsapp-webhook` | 12 |
| `whatsapp-send` | 1 |
| `twilio-secrets-check` | 8 |

### URLs

```
Webhook: https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/whatsapp-webhook
Envío:   https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/whatsapp-send
Check:   https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/twilio-secrets-check
```

---

## Respaldos de este punto

| Tipo | Ruta |
|------|------|
| ZIP código | `backups/archives/ema-s-beauty-ai-2026-05-30-203804.zip` |
| `.env` | `backups/local-secrets/.env.backup-2026-05-30` |
| Manifiesto | `backups/MANIFEST.json` |

---

## Restaurar este punto

```powershell
git fetch origin
git checkout v0.3-ema-funcionando-2026-05-30
copy backups\local-secrets\.env.backup-2026-05-30 .env
npm install
npm run dev
```

---

## Siguiente fase

- IA automática asistida
- Producción (URL pública)
- Salir de sandbox Twilio
- Plan 7 días en `docs/CHECKLIST-PROYECTO-EMA.md`

---

*Punto de control: Ema operativa sin incidencias conocidas en WhatsApp.*

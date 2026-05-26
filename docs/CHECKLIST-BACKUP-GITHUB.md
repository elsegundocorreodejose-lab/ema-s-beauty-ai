# Checklist — respaldo completo (local + GitHub)

**Proyecto:** Ema IA (`ema-s-beauty-ai`)  
**Última actualización:** 2026-05-26

Un respaldo **completo** tiene **tres capas**. GitHub solo guarda el **código**; no sustituye secretos ni la base de datos.

---

## Capa 1 — Local (tu PC) ✅ puedes hacerlo ya

| # | Qué | Cómo | ¿Hecho? |
|---|-----|------|--------|
| 1.1 | ZIP del código | Ejecutar `scripts\create-backup.ps1` | ☐ |
| 1.2 | Copia del `.env` | Se guarda en `backups\local-secrets\.env.backup-FECHA` | ☐ |
| 1.3 | ZIP en la nube | Subir `backups\archives\ema-s-beauty-ai-*.zip` a Drive / OneDrive | ☐ |
| 1.4 | Leer guía de restauración | `docs\RESPALDO-2026-05-26.md` | ☐ |

**Último ZIP generado (ejemplo):**  
`backups\archives\ema-s-beauty-ai-2026-05-26-100746.zip`

---

## Capa 2 — GitHub (código versionado)

### A. Requisitos previos en tu computadora

| # | Requisito | Notas |
|---|-----------|--------|
| 2.1 | **Git** o **GitHub Desktop** | En Windows antiguo (build 15063) Git 2.54 a veces falla → prueba [GitHub Desktop](https://desktop.github.com/) |
| 2.2 | Cuenta GitHub | `elsegundocorreodejose-lab` |
| 2.3 | Acceso al repo | https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai |
| 2.4 | Autenticación | Personal Access Token (PAT) o login en GitHub Desktop |

### B. Qué SÍ debe subirse al repo

| # | Contenido |
|---|-----------|
| 2.5 | `src/` (app React + server functions) |
| 2.6 | `supabase/functions/` (Edge Functions) |
| 2.7 | `supabase/migrations/` |
| 2.8 | `supabase/config.toml` |
| 2.9 | `docs/` (incl. respaldos y WhatsApp) |
| 2.10 | `scripts/` (`create-backup.ps1`, `push-to-github.ps1`) |
| 2.11 | `backups/MANIFEST.json`, `backups/README.md` |
| 2.12 | `.env.example`, `package.json`, configs Vite/TS |

### C. Qué NO debe subirse (ya en `.gitignore`)

| # | Archivo / carpeta | Motivo |
|---|-------------------|--------|
| 2.13 | `.env` | Secretos locales |
| 2.14 | `backups/local-secrets/` | Copia del `.env` |
| 2.15 | `backups/archives/*.zip` | Respaldos pesados |
| 2.16 | `node_modules/` | Se regenera con `npm install` |
| 2.17 | `.tools/` | Node portable local |

### D. Pasos para subir (elige uno)

**Opción 1 — Doble clic**

1. Ejecutar `PUSH-GITHUB.bat` en la raíz del proyecto.

**Opción 2 — PowerShell**

```powershell
cd C:\Users\Jofi\Documents\ema-s-beauty-ai
powershell -ExecutionPolicy Bypass -File scripts\push-to-github.ps1
```

**Opción 3 — GitHub Desktop**

1. File → Add local repository → carpeta del proyecto.  
2. Summary: `Respaldo 2026-05-26: WhatsApp + Edge Functions`.  
3. Commit to `main` → Push origin.

### E. Después del push (recomendado)

| # | Acción |
|---|--------|
| 2.18 | Crear etiqueta: `git tag -a v0.1-whatsapp-mvp -m "WhatsApp OK"` |
| 2.19 | Subir etiqueta: `git push origin v0.1-whatsapp-mvp` |
| 2.20 | Comprobar en GitHub que el último commit aparece en `main` |

### F. Checklist rápido GitHub

- [ ] Git o GitHub Desktop instalado y funciona (`git --version`)
- [ ] `git status` muestra archivos listos para commit
- [ ] No aparece `.env` en lo que se va a subir
- [ ] `git push` termina sin error
- [ ] Repo en navegador muestra carpetas `supabase/functions/whatsapp-send`, etc.

---

## Capa 3 — Nube (Supabase + Twilio) — no va a GitHub

Sin esto, clonas el repo y **WhatsApp deja de funcionar** hasta reconfigurar.

### Supabase (`bklnaeftoztcahfgxchl`)

| # | Qué guardar | Dónde obtenerlo |
|---|-------------|-----------------|
| 3.1 | `SUPABASE_URL` | Dashboard → Settings → API |
| 3.2 | `anon` / publishable key | Misma página (ya en `.env` como `VITE_SUPABASE_*`) |
| 3.3 | `service_role` key | **Secreto** — solo servidor / Edge |
| 3.4 | Edge secrets | Dashboard → Edge Functions → Secrets |
| 3.5 | Edge Functions desplegadas | `whatsapp-webhook`, `whatsapp-send`, `twilio-secrets-check` |
| 3.6 | Migraciones / esquema BD | Export SQL o confiar en migraciones del repo |
| 3.7 | Usuarios y datos (`messages`, citas…) | Backup BD: Dashboard → Database → Backups |

**Secretos Edge (lista mínima):**

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `TWILIO_WEBHOOK_PUBLIC_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (suele inyectarse automático)

**Verificación:** abrir  
https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/twilio-secrets-check  
→ debe mostrar `"ok": true`.

### Twilio

| # | Qué guardar | Dónde |
|---|-------------|--------|
| 3.8 | Account SID | Console → Account |
| 3.9 | Auth Token | Console → API keys (copiar y guardar en gestor de contraseñas) |
| 3.10 | Sandbox `join` code | Messaging → WhatsApp Sandbox |
| 3.11 | Webhook URL | POST → `https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/whatsapp-webhook` |

---

## Resumen: ¿qué es “completo”?

| Capa | Qué protege | Obligatorio |
|------|-------------|-------------|
| Local ZIP + `.env` | Código + claves locales | ✅ Sí |
| GitHub | Historial de código, colaboración | ✅ Muy recomendado |
| Supabase + Twilio | WhatsApp, BD, auth | ✅ Sí para producción |

**Solo GitHub no es respaldo completo.**  
**Solo ZIP local sin anotar secretos de Supabase/Twilio tampoco.**

---

## Respaldo automático diario a GitHub

Ver guía completa: **`docs/BACKUP-AUTOMATICO-GITHUB.md`**

```powershell
# Probar una vez
powershell -ExecutionPolicy Bypass -File scripts\daily-github-backup.ps1

# Programar cada día a las 20:00
powershell -ExecutionPolicy Bypass -File scripts\register-daily-github-backup.ps1
```

Requisito: haber hecho **Push manual** al menos una vez con GitHub Desktop (credenciales guardadas).

---

## Comandos útiles

```powershell
# Nuevo respaldo local
powershell -ExecutionPolicy Bypass -File scripts\create-backup.ps1

# Subir a GitHub (con Git instalado)
powershell -ExecutionPolicy Bypass -File scripts\push-to-github.ps1

# Arrancar proyecto
npm run dev
# → http://localhost:8080/
```

---

## Enlaces

| Recurso | URL |
|---------|-----|
| Repo GitHub | https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai |
| Supabase proyecto | https://supabase.com/dashboard/project/bklnaeftoztcahfgxchl |
| Twilio Console | https://console.twilio.com/ |
| Doc WhatsApp | `docs/WHATSAPP_TWILIO.md` |
| Respaldo detallado | `docs/RESPALDO-2026-05-26.md` |

# Respaldo automatico diario a GitHub

GitHub **no** entra solo a tu PC. El respaldo automatico hace esto **en tu computadora**, cada dia:

1. Revisa si hay cambios en el codigo (respeta `.gitignore`: no sube `.env`).
2. Si hay cambios → `commit` + `push` a `main`.
3. Si no hay cambios → no hace nada.
4. Escribe un log en `backups/logs/github-backup-FECHA.log`.

---

## Configuracion en 3 pasos

### 1. Autenticacion (una sola vez)

Abre **GitHub Desktop**, inicia sesion y haz **un Push manual** del proyecto.  
Asi Windows guarda las credenciales para los pushes automaticos.

### 2. Probar el script manualmente

```powershell
cd C:\Users\Jofi\Documents\ema-s-beauty-ai
powershell -ExecutionPolicy Bypass -File scripts\daily-github-backup.ps1
```

Debe decir `Push OK` o `Sin cambios`.

### 3. Programar cada dia (por defecto 20:00)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\register-daily-github-backup.ps1
```

Otra hora (ej. 21:30):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\register-daily-github-backup.ps1 -Hour 21 -Minute 30
```

Incluir tambien ZIP local cada dia:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\register-daily-github-backup.ps1 -IncludeLocalZip
```

---

## Ver la tarea en Windows

1. Tecla Windows → escribe **Programador de tareas**
2. Busca: **EmaIA-GitHub-Backup-Diario**
3. Clic derecho → **Ejecutar** para probar sin esperar al horario

---

## Quitar el respaldo automatico

```powershell
powershell -ExecutionPolicy Bypass -File scripts\unregister-daily-github-backup.ps1
```

---

## Limitaciones importantes

| Situacion | Que pasa |
|-----------|----------|
| PC apagado a la hora programada | Se ejecuta al encender si `StartWhenAvailable` (puede retrasarse) |
| Sin internet | Falla el push; revisa el log |
| Sin cambios en codigo | No hay commit ese dia (normal) |
| Solo secretos / `.env` | **No se suben** (gitignore) |
| Base de datos Supabase | **No** se respalda en GitHub; usa backup de Supabase |

---

## Respaldo completo (codigo + secretos + BD)

| Que | Como |
|-----|------|
| Codigo cada dia | Este script → GitHub |
| ZIP + `.env` | `scripts\create-backup.ps1` o `-IncludeLocalZip` en la tarea |
| Secretos Twilio/Supabase | Dashboard + gestor de contraseñas |
| Base de datos | Supabase Dashboard → Database → Backups |

---

## Archivos

| Archivo | Uso |
|---------|-----|
| `scripts/daily-github-backup.ps1` | Ejecuta commit + push |
| `scripts/register-daily-github-backup.ps1` | Crea tarea diaria en Windows |
| `scripts/unregister-daily-github-backup.ps1` | Quita la tarea |
| `backups/logs/*.log` | Historial de ejecuciones |

Repo: https://github.com/elsegundocorreodejose-lab/ema-s-beauty-ai

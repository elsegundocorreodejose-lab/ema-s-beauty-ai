# Carpeta de respaldos — Ema IA

| Subcarpeta / archivo | Contenido | ¿En Git? |
|----------------------|-----------|----------|
| `MANIFEST.json` | Metadatos del punto de restauración | Sí |
| `../docs/RESPALDO-2026-05-26.md` | Respaldo del día (URLs, funciones) | Sí |
| `../docs/CHECKLIST-BACKUP-GITHUB.md` | Checklist local + GitHub + nube | Sí |
| `../docs/CHECKLIST-PROYECTO-EMA.md` | Checklist operativo completo del proyecto | Sí |
| `local-secrets/` | Copias de `.env` con claves reales | **No** (gitignore) |
| `archives/` | ZIPs del proyecto | **No** (gitignore) |

## Crear un respaldo nuevo

```powershell
cd C:\Users\Jofi\Documents\ema-s-beauty-ai
powershell -ExecutionPolicy Bypass -File scripts\create-backup.ps1
```

## Restaurar

1. Lee `docs/CHECKLIST-BACKUP-GITHUB.md` y `docs/RESPALDO-2026-05-26.md`
2. Descomprime el ZIP más reciente de `archives/`
3. Restaura `.env` desde `local-secrets/.env.backup-YYYY-MM-DD`

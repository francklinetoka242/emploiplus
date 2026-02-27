# BACKEND RENAISSANCE

## 1) Confirmation d'élimination du PID 27193

- Action exécutée: `kill -9 27193` et nettoyage PM2 (`pm2 delete all && pm2 kill`).
- Vérification: `ps -ef | grep 27193` ne retourne plus rien — PID `27193` éliminé.

## 2) Nouveau PID du processus `emploi-backend`

- Commande: `pm2 start dist/server.js --name "emploi-backend"` puis `pm2 pid emploi-backend`.
- Nouveau PID: `28024`.

## 3) Résultat du `curl` sur le port 5000

- Commande exécutée:

```
curl -s -X POST http://localhost:5000/api/auth/register-admin -H 'Content-Type: application/json' -d '{}'
```

- Réponse (body):

```
{"success":true,"message":"Test /register-admin"}
```

- Code HTTP: `201` (succès)

## 4) Liste des processus vus par PM2

```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ emploi-backend     │ fork     │ 0    │ online    │ 0%       │ 77.0mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

## 5) Statut final du site

- OPÉRATIONNEL

---
Generated on 2026-02-25 by automated recovery steps.

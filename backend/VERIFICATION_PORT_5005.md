# Vérification port 5005

## 1) Statut du port 5000

- Observation: le port `5000` répond encore (HTTP 200). Processus identifié:

```
LISTEN ... users:(("node /home/empl",pid=27193,fd=20))
UID          PID    PPID  C STIME TTY          TIME CMD
emplo12+   27193     473  0 09:27 ?        00:00:00 node /home/emploiplus-group.
CMDLINE: node /home/emploiplus-group.com/public_html/backend/dist/s
cwd -> /home/emploiplus-group.com/public_html/backend
```

- Réponse HTTP tête (headers) reçue depuis `http://localhost:5000/`:

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 161
ETag: W/"a1-YMddN7/7v8jI2RE6Ptvz80EQjeA"
Date: Wed, 25 Feb 2026 08:29:44 GMT
Connection: keep-alive
Keep-Alive: timeout=5
... (autres headers ci-dessus)
```

Conclusion: le port `5000` n'est PAS vide — un processus `node` (PID `27193`) sert encore des requêtes.

## 2) Résultat précis de l'appel sur le port 5005

- Commande exécutée:

```
curl -s -X POST http://localhost:5005/api/auth/register-admin -H 'Content-Type: application/json' -d '{}'
```

- Réponse brute (body):

```
{"success":true,"message":"Test /register-admin"}
```

- Code HTTP retourné: `201`

## 3) Liste des fichiers dans `dist/` (preuve du build)

Fichiers listés (extraits):

```
 - server.js
 - server.js.map
 - app.js
 - app.js.map
 - routes/auth.routes.js
 - routes/index.js
 - routes/formations.routes.js
 - routes/jobs.routes.js
 - controllers/auth.controller.js
 - controllers/jobs.controller.js
 - controllers/formations.controller.js
 - services/mail.service.js
 - config/mail.js
 - config/database.js
 - middlewares/auth.middleware.js
 - middlewares/errorMiddleware.js
 ... (liste complète dans l'arbre `dist/`)
```

## 4) Conclusion

Basé sur les observations ci‑dessus :

 - Le serveur que vous avez lancé manuellement sur le port `5005` répond correctement et renvoie `201` avec le payload attendu.
 - Le port `5000` est toujours occupé par un autre processus `node` (PID `27193`) qui sert des requêtes et retourne `200`.

Conclusion finale: **Le problème venait d'un conflit de port.** Le comportement incohérent venait du fait qu'un autre processus servait encore sur le port `5000` (probablement l'instance PM2 ou une instance précédente), ce qui a masqué les changements que vous testiez.

---
Generated on 2026-02-25 by automated verification steps.

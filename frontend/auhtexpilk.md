# Explication - Authentification Frontend (auhtexpilk)

Ce document décrit précisément la façon dont l'authentification est gérée côté frontend dans l'application (admin login), avec le code exact, la structure des requêtes, le traitement des réponses, et la manière dont le token est stocké.

## 1) Fonction de Login (code complet)
Voici la fonction `handleLogin` utilisée dans `src/pages/admin/login/page.tsx` qui effectue le `fetch` vers l'API d'authentification :

```ts
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  console.log('🔐 Tentative de connexion admin...');

  try {
    // Utiliser l'endpoint isolé /api/auth/login
    const res = await fetch(buildApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      credentials: 'include', // Important pour CORS et les cookies
      body: JSON.stringify({ email, password }),
    });

    // Si le serveur renvoie une erreur HTTP, lire le corps brut pour debug
    if (!res.ok) {
      const text = await res.text().catch(() => '<unable to read response body>');
      console.error('Erreur Brute Serveur:', text);
      // Lancer une erreur explicite pour que le catch supérieur l'attrape
      throw new Error('Erreur 500');
    }

    // Tenter de parser en JSON, sinon logger le texte brut (cas 500 non-JSON)
    let parsed: any;
    try {
      parsed = await res.json();
    } catch (e) {
      const raw = await res.text();
      console.error('❌ Réponse non-JSON du serveur:', raw);
      toast.error('Réponse serveur invalide (non-JSON)');
      return;
    }

    // Extraire la charge utile en supportant axios-style response.data.data
    const apiPayload = parsed && parsed.data && parsed.data.data ? parsed.data.data : parsed && parsed.data ? parsed.data : parsed;

    if (parsed && parsed.success) {
      // apiPayload contient maintenant { token, admin, ... }
      localStorage.setItem("adminToken", apiPayload.token ?? '');
      localStorage.setItem("admin", JSON.stringify(apiPayload.admin ?? {}));

      console.log('✅ Connexion réussie:', {
        email: apiPayload.admin?.email,
        role: apiPayload.admin?.role,
        tokenReceived: !!apiPayload.token,
      });

      toast.success("Connecté avec succès !");

      const role = apiPayload.admin?.role;
      switch (role) {
        case "super_admin":
          navigate("/admin");
          break;
        case "content_admin":
          navigate("/admin/publications");
          break;
        case "admin_offres":
          navigate("/admin/jobs");
          break;
        case "admin_users":
          navigate("/admin/users");
          break;
        default:
          navigate("/admin");
      }
    } else {
      console.error('❌ Erreur login:', parsed?.message ?? parsed);
      toast.error(parsed?.message || "Identifiants incorrects");
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
    toast.error("Serveur injoignable – vérifiez le backend");
  } finally {
    setLoading(false);
  }
};
```

---

## 2) Structure d'envoi (body)
- Le body est envoyé en JSON via `JSON.stringify({ email, password })`.
- Champs envoyés :
  - `email` (string)
  - `password` (string)
- Headers : `Content-Type: application/json` et `Accept: application/json`.
- URL utilisée : `buildApiUrl("/api/auth/login")` (fonction centralisée qui normalise l'URL de l'API).

---

## 3) Traitement de la réponse
- Vérification initiale : la fonction vérifie `if (!res.ok)`.
  - Si `res.ok` est faux, on appelle `await res.text()` pour lire le corps brut et on `console.error('Erreur Brute Serveur:', text)`.
  - Ensuite on lève une erreur `throw new Error('Erreur 500')` pour que le `catch` supérieur la prenne en charge.
- Ligne exacte où `res.json()` est faite :

```ts
parsed = await res.json();
```

- Si `res.json()` échoue (SyntaxError parce que le serveur a renvoyé du HTML), il y a un `catch` qui fait :

```ts
const raw = await res.text();
console.error('❌ Réponse non-JSON du serveur:', raw);
toast.error('Réponse serveur invalide (non-JSON)');
return;
```

Cela garantit qu'on n'essaie pas d'appeler `res.json()` sur une réponse HTML 500 sans d'abord capturer le texte brut.

---

## 4) Stockage du Token
- Après succès (si `parsed && parsed.success`), le token est sauvegardé ainsi :

```ts
localStorage.setItem("adminToken", apiPayload.token ?? '');
localStorage.setItem("admin", JSON.stringify(apiPayload.admin ?? {}));
```

- Le token est donc accessible ensuite via `localStorage.getItem('adminToken')` et est automatiquement ajouté aux headers par `authHeaders()` / `apiFetch()`.

---

## 5) Analyse immédiate & Correctif demandé
Problème observé : `SyntaxError: The string did not match the expected pattern.` — typiquement causé par `res.json()` sur une réponse HTML (500) ou par un `atob` sur une chaîne non base64url.

Mesures prises et recommandations immédiates :

1. Déjà implémenté dans le code :
   - Vérification `if (!res.ok)` et `await res.text()` pour logger le corps brut du serveur avant de rejeter. Cela empêche `res.json()` de lancer un `SyntaxError` si le serveur renvoie du HTML.

2. Si vous voulez afficher plus de détails (headers/stack), loggez également :

```ts
const text = await res.text().catch(() => '<unable to read response body>');
console.error('[login error] status=%d url=%s body=\n%s', res.status, buildApiUrl('/api/auth/login'), text);
```

3. Exemple de `curl` pour reproduire et voir le HTML brut :

```bash
curl -i -X POST "http://127.0.0.1:5000/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-super-admin@test.local","password":"TestAdmin123!"}'
```

4. Autre source possible du SyntaxError : décodage du JWT avec `atob` si la chaîne n'est pas en base64url. Le code `decodeJWT` a été rendu défensif (validation base64url + padding) pour éviter les erreurs lors du décodage.

---

## 6) Actions recommandations (opérations sûres)
- Vérifier les logs backend (maintenant renvoyés en JSON dans le `catch`) pour identifier la vraie erreur 500.
- Si l'erreur côté serveur est due à une exception non gérée, consulter la stack imprimée côté serveur (nous avons ajouté `console.error(err.stack)` lors du catch serveur).
- Pour débogage rapide, reproduire la requête via `curl` et lire la réponse brut.

---

## 7) Emplacement du code
- La fonction de login se trouve dans : `src/pages/admin/login/page.tsx`.
- Les helpers API sont dans : `src/lib/headers.ts` (buildApiUrl, authHeaders, decodeJWT) et `src/lib/api.ts` (fonctions API comme `loginAdmin`).

---

Si vous voulez, je peux :
- ajouter un log plus verbeux (headers + body) côté serveur pour la route `/api/auth/login` (temporaire),
- ou restaurer/réaliser d'autres ajustements pour que les erreurs 500 renvoient toujours un JSON clair.

Fin du fichier `auhtexpilk.md`.

# Description de l'Intégration IA dans Emploi+

## 🏗️ Architecture Globale

### Fournisseur et Modèle Principal
La plateforme Emploi+ intègre l'intelligence artificielle via **Google Gemini AI** comme fournisseur principal. Le modèle de base utilisé est **gemini-1.5-flash**, reconnu pour sa rapidité et son efficacité dans les tâches de traitement de texte et d'analyse de documents. En cas d'indisponibilité ou de surcharge, le système bascule automatiquement sur **gemini-pro** comme modèle de fallback, assurant une continuité de service sans interruption.

### Pile Technique
L'intégration est réalisée côté backend à l'aide de **Node.js** et **Express.js**, frameworks robustes pour la gestion des API et des requêtes asynchrones. L'interaction avec l'API de Google Gemini s'effectue via la bibliothèque officielle **@google/generative-ai**, qui fournit une interface sécurisée et optimisée pour les appels à l'IA. Cette approche permet une intégration transparente dans l'architecture existante, en exploitant les capacités de génération de contenu et d'analyse de données de l'IA.

## 🤖 Fonctionnalités IA (Cas d'Usage)

### Parsing de CV (Extraction de Données)
L'IA est utilisée pour analyser automatiquement les documents de candidature soumis par les visiteurs, notamment les CV au format PDF ou Docx. Le processus implique :
- **Extraction automatique** : Identification et extraction des informations clés telles que le nom du candidat, l'adresse email, le numéro de téléphone et les compétences principales.
- **Traitement intelligent** : Utilisation d'algorithmes de reconnaissance de texte avancés pour gérer les variations de format et de mise en page, assurant une précision élevée dans l'extraction des données.
- **Intégration en temps réel** : Les données extraites sont directement intégrées dans le système de gestion des candidatures, réduisant le temps de traitement manuel et minimisant les erreurs.

### Analyse de la 'Santé du Système'
Une fonctionnalité de surveillance proactive utilise l'IA pour analyser les logs système et les métriques de performance :
- **Surveillance des logs** : L'IA examine en continu les fichiers de logs pour détecter des anomalies, des erreurs récurrentes ou des signes de dégradation des performances.
- **Alertes automatiques** : En cas de problème détecté (par exemple, surcharge serveur ou échecs répétés), l'IA génère des alertes ciblées pour les administrateurs, incluant des recommandations d'actions correctives.
- **Rapports périodiques** : Génération de rapports synthétiques sur l'état global du système, aidant à la maintenance préventive et à l'optimisation des ressources.

### Assistance à la Rédaction
L'IA offre un support aux candidats pour améliorer leurs documents de candidature :
- **Génération de lettres de motivation** : À partir des informations du profil candidat et de l'offre d'emploi, l'IA propose des brouillons personnalisés de lettres de motivation, adaptés au poste visé.
- **Optimisation de CV** : Analyse et suggestions d'améliorations pour les CV, en mettant en avant les compétences pertinentes et en optimisant la structure pour une meilleure lisibilité.
- **Personnalisation contextuelle** : Utilisation de données contextuelles (secteur d'activité, exigences du poste) pour rendre les suggestions plus pertinentes et efficaces.

## 🔧 Configuration & Sécurité

### Variables d'Environnement
La configuration de l'IA repose sur des variables d'environnement sécurisées :
- **GEMINI_API_KEY** : Clé d'API fournie par Google pour authentifier les requêtes vers Gemini AI. Cette clé doit être stockée de manière sécurisée et ne jamais être exposée dans le code source.

### Mode Mock (Simulé)
En cas d'indisponibilité de l'API Google Gemini (par exemple, dépassement de quota ou interruption de service), le système active automatiquement le **Mode Mock** :
- **Simulation des réponses** : Le système génère des réponses fictives basées sur des modèles pré-définis, permettant au reste de la plateforme de fonctionner normalement sans interruption.
- **Logging des événements** : Tous les appels en mode mock sont enregistrés pour analyse ultérieure, facilitant le diagnostic et la reprise du service normal.
- **Transition transparente** : Le basculement entre mode réel et mock est géré dynamiquement, sans impact sur l'expérience utilisateur.

### Limites et Paramètres de Sécurité
- **Limites de tokens** : Configuration des seuils de tokens pour éviter les dépassements de coût et optimiser les performances (par exemple, limitation à 1000 tokens par requête pour les analyses de CV).
- **Safety Settings** : Paramètres intégrés pour filtrer les contenus inappropriés, incluant des filtres contre les biais, les contenus offensants ou les informations sensibles. Ces réglages respectent les guidelines de Google et assurent une utilisation éthique de l'IA.

## 🚀 Maintenance et Déploiement

### Mise à Jour du Modèle
Pour mettre à jour le modèle IA dans le code :
1. **Vérification des compatibilités** : Consulter la documentation de Google Gemini pour les nouvelles versions de modèles.
2. **Modification du code** : Mettre à jour les références au modèle dans les fichiers de configuration (par exemple, remplacer "gemini-1.5-flash" par la nouvelle version dans le code d'initialisation).
3. **Tests unitaires** : Exécuter les tests automatisés pour valider le fonctionnement avec le nouveau modèle.
4. **Déploiement progressif** : Appliquer les changements en environnement de staging avant la production, avec monitoring des performances.

### Test de l'Initialisation IA
Pour tester l'initialisation de l'IA lors du démarrage du serveur :
1. **Lancement du serveur** : Exécuter `node server.js` depuis le répertoire backend.
2. **Vérification des logs** : Surveiller les messages de console pour confirmer l'initialisation réussie de l'IA (par exemple, "IA initialisée avec succès" ou erreurs liées à l'API).
3. **Tests fonctionnels** : Effectuer des appels API de test (parsing de CV ou génération de contenu) pour valider l'intégration.
4. **Mode de secours** : En cas d'échec, vérifier l'activation automatique du mode mock et les logs associés.

Cette documentation assure une compréhension complète de l'intégration IA, facilitant la maintenance, la sécurité et l'évolution de la plateforme Emploi+.
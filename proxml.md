# Exemples de structure de `sitemap.xml`

Le document ci-dessous montre une organisation idéale pour refléter les catégories et priorités que nous avons identifiées. Les sections `<!-- ... -->` sont des commentaires explicatifs, à conserver ou supprimer selon vos besoins.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- pages institutionnelles (importance maximale sur le domaine) -->
  <url>
    <loc>https://emploiplus-group.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/a-propos</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/contact</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/privacy</loc>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/legal</loc>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/cookies</loc>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/services</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/cv</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/lettre-de-motivation</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/simulateur-entretien</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/tests-competence</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/cartes-de-visite</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/flyers</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/bannieres</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/portfolio</loc>
    <priority>0.6</priority>
  </url>

  <!-- pages de listes importantes pour Google -->
  <url>
    <loc>https://emploiplus-group.com/emplois</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/formations</loc>
    <priority>0.8</priority>
  </url>
  

  <!-- pages dynamiques, extraites de la DB (génerées automatiquement) -->
 
  <url>
    <loc>https://emploiplus-group.com/jobs/{jobId}</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://emploiplus-group.com/formations/{formationId}</loc>
    <priority>0.8</priority>
  </url>

</urlset>
```
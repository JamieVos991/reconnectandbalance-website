# Reconnect & Balance – nieuwe website

De kant-en-klare website staat in `site/`. Je kunt die map zo op elke webhost zetten.

## Mappen
- `src/pages/` – de inhoud van elke pagina (hier pas je teksten aan)
- `src/style.css`, `src/main.js` – opmaak en menu/formulier
- `scripts/build.js` – maakt `site/` opnieuw aan (en haalt afbeeldingen op)
- `scripts/serve.js` – lokale server om de site te bekijken
- `_bron/`, `content/` – kopie van de oude site, alleen ter referentie

## Werken met de site
```bash
node scripts/build.js
node scripts/serve.js
```
Open daarna http://localhost:8080

## Goed om te weten
- De productkaarten linken naar de bestaande webwinkel (WooCommerce) op reconnectandbalance.com. Daar gebeuren afrekenen en de winkelwagen.
- Het contactformulier opent het e-mailprogramma van de bezoeker met het bericht al ingevuld.
- Producten en prijzen staan bovenaan in `scripts/build.js`.

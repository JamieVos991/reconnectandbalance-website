# Reconnect & Balance: website

Statische website voor de holistische praktijk van Linda Vos in Den Haag. Live op https://reconnectandbalance.com via GitHub Pages.

## Mappen
- `src/pages/`: de inhoud van elke pagina (hier pas je teksten aan). De eerste regel is `<!-- title: Titel | Omschrijving -->`.
- `src/style.css`, `src/main.js`: opmaak, menu, dropdowns, scroll-animaties en het contactformulier
- `src/fonts/`: de lettertypen
- `scripts/build.js`: bouwt `site/` uit de pagina's en het sjabloon (header, menu, footer), plus `sitemap.xml` en `robots.txt`
- `scripts/serve.js`: lokale server om de site te bekijken
- `site/`: de gebouwde website, inclusief `site/img/` met alle afbeeldingen
- `docs/`: de onderhoudspagina ("Binnenkort online")
- `worker/`: Cloudflare Worker die het contactformulier verstuurt (zie `worker/README.md`)
- `_bron/`, `content/`: kopie van de oude WordPress-site, alleen ter referentie (niet in git)

## Werken met de site
```bash
node scripts/build.js
node scripts/serve.js
```
Open daarna http://localhost:8080. Pas altijd `src/` aan en bouw opnieuw; wijzig `site/*.html` niet met de hand.

## Online zetten
Elke push naar `main` zet de site online via `.github/workflows/pages.yml`.

- Zolang `ONDERHOUD: "ja"` in die workflow staat, toont het hoofddomein de onderhoudspagina uit `docs/`. De echte homepage staat dan op `/home.html` en alle andere pagina's werken gewoon.
- Klaar om live te gaan? Zet `ONDERHOUD` op `"nee"` en push.

## Contactformulier
Het formulier post naar de Worker `reconnectandbalance-mail`. Die controleert Cloudflare Turnstile en een honeypot, beperkt het aantal berichten en verstuurt de mail via Resend naar info@reconnectandbalance.com, met het adres van de bezoeker als antwoordadres. Een concept van het bericht blijft bewaard in de browser (localStorage) tot het verstuurd is.

## Mail en domein
- Domein en DNS: Squarespace
- Mailbox: Fastmail (info@ is een alias van Linda's account)
- Verzenden vanaf de website: Resend (`website@reconnectandbalance.com`)

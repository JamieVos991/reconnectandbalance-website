# Mail-API (Cloudflare Worker)

Verstuurt het contactformulier van `src/pages/contact.html` via Resend, met Cloudflare
Turnstile tegen spam. Zelfde opzet als de Worker van lychees.studio.

## Eerste keer instellen

1. Voeg in Resend (Domains) `reconnectandbalance.com` toe en zet de DNS-records die Resend
   geeft bij Squarespace. Laat de MX-, DKIM- en SPF-records van Fastmail staan.
2. In Cloudflare staat de Turnstile-widget "Reconnect & Balance contact" voor
   `reconnectandbalance.com`. De sitekey staat in `src/pages/contact.html`, het geheim
   gaat als `TURNSTILE_SECRET` in de Worker.

Daarna vanuit deze map (je plakt de sleutels zelf in de terminal):

```sh
npx wrangler login
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET
npx wrangler deploy
```

Krijgt de Worker een ander adres dan `https://reconnectandbalance-mail.artquake.workers.dev`?
Zet dat adres dan in `action` van het formulier in `src/pages/contact.html` en bouw de site opnieuw.

## Testen

Lokaal draaien met de testsleutel van Turnstile, die altijd slaagt:

```sh
npx wrangler dev --var RESEND_API_KEY:nep --var TURNSTILE_SECRET:1x0000000000000000000000000000000AA --var ONTVANGER:test@example.com
```

De controles werken dan, alleen het echte versturen mislukt.

// Mail-API van reconnectandbalance.com, draait als Cloudflare Worker en verstuurt via Resend.
//   POST /contact  contactformulier, mail naar ONTVANGER
// Zelfde opzet als de Worker van lychees.studio. Fouten hebben de vorm { errors: [{ message }] }.
// De sleutels staan als geheim in Cloudflare (RESEND_API_KEY, TURNSTILE_SECRET), niet in de code.

const HERKOMST = ["https://reconnectandbalance.com", "https://www.reconnectandbalance.com"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BEHANDELINGEN = ["Holistische Bodyscan", "Biofotonentherapie", "QM Hypnose", "Telefonisch consult", "Opleiding", "Algemene vraag"];

// fout met een statuscode voor de bezoeker
class Afwijzing extends Error {
	constructor(status, melding) {
		super(melding);
		this.status = status;
	}
}

function antwoord(status, melding, herkomst) {
	const inhoud = melding ? { errors: [{ message: melding }] } : { ok: true };
	return new Response(JSON.stringify(inhoud), {
		status,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"X-Content-Type-Options": "nosniff",
			"Access-Control-Allow-Origin": herkomst,
			Vary: "Origin",
		},
	});
}

// enters horen niet in een onderwerp of naam
const eenRegel = (tekst) => String(tekst ?? "").replace(/[\r\n]+/g, " ").trim();

async function verstuur(env, mail) {
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
		body: JSON.stringify(mail),
	});
	if (!res.ok) {
		console.error("Resend", res.status, await res.text());
		throw new Afwijzing(500, "Versturen mislukt");
	}
}

// Cloudflare Turnstile: bevestigt dat het formulier door een mens is verstuurd
async function controleerMens(token, ip, env) {
	if (typeof token !== "string" || token === "" || token.length > 2048) {
		throw new Afwijzing(403, "Controle mislukt, probeer het opnieuw");
	}
	const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
	});
	const uitslag = await res.json().catch(() => ({}));
	if (uitslag.success !== true) {
		console.error("Turnstile", uitslag["error-codes"]);
		throw new Afwijzing(403, "Controle mislukt, probeer het opnieuw");
	}
}

async function contact(invoer, request, env) {
	// verborgen veld ingevuld: een bot. Doe alsof het gelukt is.
	if (String(invoer.get("_gotcha") ?? "").trim() !== "") return;

	const ip = request.headers.get("CF-Connecting-IP") ?? "onbekend";
	if (!(await env.LIMIET_CONTACT.limit({ key: ip })).success) {
		throw new Afwijzing(429, "Te veel berichten, probeer het later opnieuw");
	}
	await controleerMens(invoer.get("cf-turnstile-response"), ip, env);

	const naam = eenRegel(invoer.get("naam"));
	const email = String(invoer.get("email") ?? "").trim();
	const telefoon = eenRegel(invoer.get("telefoon"));
	const behandeling = eenRegel(invoer.get("behandeling"));
	const bericht = String(invoer.get("bericht") ?? "").trim();
	if (naam === "" || naam.length > 120) throw new Afwijzing(422, "Vul je naam in");
	if (!EMAIL.test(email) || email.length > 200) throw new Afwijzing(422, "Vul een geldig e-mailadres in");
	if (telefoon.length > 40) throw new Afwijzing(422, "Telefoonnummer is te lang");
	if (!BEHANDELINGEN.includes(behandeling)) throw new Afwijzing(422, "Kies een behandeling");
	if (bericht === "" || bericht.length > 5000) throw new Afwijzing(422, "Vul een bericht in");

	await verstuur(env, {
		from: `Reconnect & Balance website <${env.AFZENDER}>`,
		to: [env.ONTVANGER],
		reply_to: email, // op Beantwoorden klikken gaat naar de bezoeker
		subject: `${behandeling}: bericht van ${naam} via de website`,
		text: `Naam: ${naam}\nE-mail: ${email}\nTelefoon: ${telefoon || "-"}\nBehandeling: ${behandeling}\n\n${bericht}\n\n--\nVerstuurd via het contactformulier op reconnectandbalance.com`,
	});
}

export default {
	async fetch(request, env) {
		const herkomst = request.headers.get("Origin") ?? "";
		// alleen vanaf de eigen site
		if (!HERKOMST.includes(herkomst)) return antwoord(403, "Niet toegestaan", HERKOMST[0]);

		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": herkomst,
					"Access-Control-Allow-Methods": "POST",
					"Access-Control-Max-Age": "86400",
					Vary: "Origin",
				},
			});
		}
		if (request.method !== "POST") return antwoord(405, "Alleen POST", herkomst);
		if (new URL(request.url).pathname !== "/contact") return antwoord(404, "Niet gevonden", herkomst);

		let invoer;
		try {
			invoer = await request.formData();
		} catch {
			return antwoord(400, "Ongeldige invoer", herkomst);
		}

		try {
			await contact(invoer, request, env);
			return antwoord(200, "", herkomst);
		} catch (fout) {
			if (fout instanceof Afwijzing) return antwoord(fout.status, fout.message, herkomst);
			console.error(fout);
			return antwoord(500, "Versturen mislukt", herkomst);
		}
	},
};

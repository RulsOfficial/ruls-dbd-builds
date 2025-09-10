const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const axios = require("axios").default;

// 🔹 Función que parsea perks desde la wiki
async function parsePerks(url) {
	const stuff = await axios.get(url);
	const dom = new JSDOM(stuff.data);
	const { document } = dom.window;

	// Extraer todas las filas de la tabla
	let perks = [...document.querySelector("tbody").children].map((x) => {
		// Quitar iconitos de enlaces internos
		x.children[2].querySelectorAll(".iconLink").forEach((y) => y.remove());

		// Imagen del perk
		const imageElement = x.children[0].querySelector("img");
		const imageUrl = imageElement?.src.substring(0, imageElement.src.lastIndexOf("/")).replace("/thumb", "");

		return {
			perkImage: imageElement ? "https://deadbydaylight.wiki.gg" + imageUrl : "",
			perkName: imageElement?.alt || "",
			// Descripción codificada en URI
			description: encodeURI(
				x.children[2].innerHTML.replaceAll("/wiki/", "https://deadbydaylight.wiki.gg/wiki/")
			),
			character: x.children[3].querySelector("a")?.title || "",
			characterImage: x.children[3].querySelector("img")?.src || ""
		};
	});

	// Ordenar perks alfabéticamente
	perks.sort((a, b) => a.perkName.localeCompare(b.perkName, 'en'));
	return perks;
}

// 🔹 Main
(async function () {
	try {
		console.log("⏳ Descargando perks desde la wiki...");

		// Parsear perks de killers y survivors
		const killerPerks = await parsePerks("https://deadbydaylight.wiki.gg/wiki/Killer_Perks");
		const survivorPerks = await parsePerks("https://deadbydaylight.wiki.gg/wiki/Survivor_Perks");

		// Carpeta data en el root del repo (aunque el script esté en otra carpeta)
		const dataDir = path.join(__dirname, "..", "data");

		// Crear la carpeta si no existe
		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir, { recursive: true });
		}

		// Guardar los archivos y sobrescribir si existen
		fs.writeFileSync(path.join(dataDir, "killer-perks.json"), JSON.stringify(killerPerks, null, '\t'));
		fs.writeFileSync(path.join(dataDir, "survivor-perks.json"), JSON.stringify(survivorPerks, null, '\t'));

		console.log(`✅ Archivos guardados en ${dataDir}`);
	} catch (err) {
		console.error("❌ Error:", err);
	}
})();

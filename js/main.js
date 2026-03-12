document.addEventListener('DOMContentLoaded', async () => {
  try {
    const loadBuilds = async (folder) => {
      const files = await fetch(`https://api.github.com/repos/RulsOfficial/ruls-dbd-builds/contents/${folder}?ref=main`).then(r => r.json());
      return Promise.all(files.filter(f => f.name.endsWith('.json')).map(f => fetch(f.download_url).then(r => r.json())));
    };
    const [survivorBuilds, killerBuilds, survivorPerks, killerPerks, survivorPortraits] = await Promise.all([
      loadBuilds('data/survivor-builds'),
      loadBuilds('data/killer-builds'),
      fetch('./data/survivor-perks.json?v=' + Date.now()).then(r => r.json()),
      fetch('./data/killer-perks.json?v=' + Date.now()).then(r => r.json()),
      fetch('./data/survivor-groups.json?v=' + Date.now()).then(r => r.json())
    ]);
    const renderPerk = (perkName, altPerkName, perks, role) => {
      const perk = perks.find(p => p.perkName === perkName);
      if (!perk) return '';
      const alt = altPerkName ? perks.find(p => p.perkName === altPerkName) : null;
      return `
        <div class="perkWrapper">
          <img class="perk" title="${perk.perkName}" alt="${perk.perkName}" src="${perk.perkImage}"
               data-role="${role}" data-description="${perk.description}" 
               data-character="${perk.character}" data-characterImage="${perk.characterImage || ''}" loading="lazy">
          ${alt ? `<div class="alternatives" title="${alt.perkName}">
            <img class="perk" src="${alt.perkImage}" alt="${alt.perkName}" title="${alt.perkName}"
                 data-role="${role}" data-description="${alt.description}" 
                 data-character="${alt.character}" data-characterImage="${alt.characterImage || ''}" loading="lazy">
          </div>` : ''}
        </div>`;
    };
    const renderBuild = (build, perks, role) => `
      <div class="build">
        <div class="buildName">${build.name}</div>
        <div class="perks">${build.perks.map((p, i) => renderPerk(p, build.altperks?.[i], perks, role)).join('')}</div>
      </div>`;
    const groupBy = (arr, key) => arr.reduce((acc, item) => {
      (acc[item[key]] ||= []).push(item);
      return acc;
    }, {});
    const survivorsGrouped = groupBy(survivorBuilds, 'group');
    document.getElementById('survivors').innerHTML = Object.keys(survivorPortraits).filter(g => survivorsGrouped[g]).map(g => `
        <div class="character" id="${g}">
          <h3 class="characterName">${g}</h3>
          <div class="image"><img alt="${g}" src="${survivorPortraits[g]}"></div>
          <div class="builds">${survivorsGrouped[g].map(b => renderBuild(b, survivorPerks, 'survivor')).join('')}</div>
        </div>`).join('');
    const killerPortraits = Object.fromEntries(killerPerks.filter(p => p.character && p.characterImage).map(p => [p.character, p.characterImage.startsWith('http') ? p.characterImage : `https://deadbydaylight.wiki.gg${p.characterImage}`]));
    const killersGrouped = groupBy(killerBuilds, 'killer');
    document.getElementById('killerSidebar').innerHTML = Object.keys(killersGrouped).map(k => `<a href="#${k}">${k}</a>`).join('');
    document.getElementById('killers').innerHTML = Object.entries(killersGrouped).map(([k, builds]) => `
      <div class="character" id="${k}">
        <h3 class="characterName">${k}</h3>
        <div class="image"><img alt="${k}" src="${killerPortraits[k] || 'https://deadbydaylight.wiki.gg/images/placeholder.png'}"></div>
        <div class="builds">${builds.map(b => renderBuild(b, killerPerks, 'killer')).join('')}</div>
      </div>`).join('');
    document.querySelectorAll('.perk').forEach(img => {
      img.addEventListener('click', () => {
        const modalBg = document.createElement('div');
        modalBg.className = 'modalbg';
        modalBg.innerHTML = `<div class="modal">
          <h2>${img.alt}</h2>
          <p class="perkDescription">${decodeURIComponent(img.dataset.description || '')}</p>
          <p class="perkCharacter">Character: ${img.dataset.character || ''}</p>
          ${img.dataset.perkimage ? `<img class="perkImage" src="${img.dataset.perkimage}">` : ''}
        </div>`;
        document.body.appendChild(modalBg);
        modalBg.addEventListener('click', e => e.target === modalBg && modalBg.remove());
      });
    });
  } catch (e) {
    console.error('Error cargando datos:', e);
  }
});




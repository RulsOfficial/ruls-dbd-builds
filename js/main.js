document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 🔹 Cargar datos
    const survivorBuilds = await fetch('./data/survivor-builds.json?v=' + Date.now()).then(r => r.json());
    const killerBuilds = await fetch('./data/killer-builds.json?v=' + Date.now()).then(r => r.json());

    const survivorPerks = await fetch('./data/survivor-perks.json?v=' + Date.now()).then(r => r.json());
    const killerPerks = await fetch('./data/killer-perks.json?v=' + Date.now()).then(r => r.json());

    // 🔹 Containers
    const survivorsContainer = document.getElementById('survivors');
    const killersContainer = document.getElementById('killers');
    const killerSidebar = document.getElementById('killerSidebar');

    // 🔹 Diccionario de portraits de survivors
    const survivorPortraits = await fetch('./data/survivor-groups.json?v=' + Date.now()).then(r => r.json())

          // 🔹 Agrupar survivors por group
    const survivorsGrouped = {};
    survivorBuilds.forEach(build => {
      if (!survivorsGrouped[build.group]) survivorsGrouped[build.group] = [];
      survivorsGrouped[build.group].push(build);
    });

    // 🔹 Render survivors (agrupados)
    survivorsContainer.innerHTML = Object.entries(survivorsGrouped).map(([groupName, builds]) => {
    const survivorImage = survivorPortraits[groupName] || "https://deadbydaylight.wiki.gg/images/placeholder.png";

    return `
      <div class="character" id="${groupName}">
        <h3 class="characterName">${groupName}</h3>
        <div class="image">
          <img alt="${groupName}" src="${survivorImage}">
        </div>
        <div class="builds">
          ${builds.map(build => {
            const altperks = build.altperks || [];
            return `
              <div class="build">
                <div class="buildName">${build.name}</div>
                <div class="perks">
                  ${build.perks.map((perkName, i) => {
                    const perk = survivorPerks.find(p => p.perkName === perkName);
                    const altperks = build.altperks || [];
                    const alt = altperks[i];
                    const altObj = alt ? survivorPerks.find(p => p.perkName === alt) : null;
                    return perk ? `
                      <div class="perkWrapper">
                        <img class="perk"
                            title="${perk.perkName}"
                            alt="${perk.perkName}"
                            src="${perk.perkImage}"
                            data-role="survivor"
                            data-description="${perk.description}"
                            data-character="${perk.character}"
                            data-characterImage="${perk.characterImage || ''}"
                            loading="lazy">
                        ${altObj ? `
                          <div class="alternatives" 
                               title="${altObj.perkName}">
                            <img class="perk"
                              src="${altObj.perkImage}"
                              alt="${altObj.perkName}"
                              title="${altObj.perkName}"
                              data-role="survivor"
                              data-description="${altObj.description}"
                              data-character="${altObj.character}"
                              data-characterImage="${altObj.characterImage || ''}"
                              loading="lazy">
                          </div>
                        ` : ''}
                      </div>
                    ` : '';
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
    
    // 🔹 Generar diccionario de retratos desde killer-perks.json
    const killerPortraits = {};
    killerPerks.forEach(perk => {
      if (perk.character && perk.characterImage) {
        // Evita sobrescribir si ya lo guardamos (1 asesino puede tener varios perks)
        if (!killerPortraits[perk.character]) {
          // Si la ruta es relativa (/images/...), la completas con el dominio
          const imageUrl = perk.characterImage.startsWith('http')
            ? perk.characterImage
            : `https://deadbydaylight.wiki.gg${perk.characterImage}`;
          
          killerPortraits[perk.character] = imageUrl;
        }
      }
    });

    // 🔹 Agrupar killers por personaje
    const killersGrouped = {};
    killerBuilds.forEach(build => {
      if (!killersGrouped[build.killer]) killersGrouped[build.killer] = [];
      killersGrouped[build.killer].push(build);
    });

    // 🔹 Sidebar links (killers)
    killerSidebar.innerHTML = Object.keys(killersGrouped)
      .map(killerName => `<a href="#${killerName}">${killerName}</a>`)
      .join('');

    // 🔹 Render killers agrupados
    killersContainer.innerHTML = Object.entries(killersGrouped).map(([killerName, builds]) => {
      const killerImage = killerPortraits[killerName] || "https://deadbydaylight.wiki.gg/images/placeholder.png";

      return `
        <div class="character" id="${killerName}">
          <h3 class="characterName">${killerName}</h3>
          <div class="image">
            <img alt="${killerName}" src="${killerImage}">
          </div>
          <div class="builds">
            ${builds.map(build => `
              <div class="build">
                <div class="buildName">${build.name}</div>
                <div class="perks">
                  ${build.perks.map((perkName, i) => {
                    const perk = killerPerks.find(p => p.perkName === perkName);
                    const altperks = build.altperks || [];
                    const alt = altperks[i];
                    const altObj = alt ? killerPerks.find(p => p.perkName === alt) : null;
                    return perk ? `
                      <div class="perkWrapper">
                        <img class="perk" title="${perk.perkName}" alt="${perk.perkName}"
                            src="${perk.perkImage}" data-role="killer" 
                            data-description="${perk.description}" 
                            data-character="${perk.character}" 
                            data-characterImage="${perk.characterImage || ''}" 
                            loading="lazy">
                        ${altObj ? `
                          <div class="alternatives" 
                               title="${altObj.perkName}">
                            <img class="perk"
                              src="${altObj.perkImage}"
                              alt="${altObj.perkName}"
                              title="${altObj.perkName}"
                              data-role="survivor"
                              data-description="${altObj.description}"
                              data-character="${altObj.character}"
                              data-characterImage="${altObj.characterImage || ''}"
                              loading="lazy">
                          </div>
                        ` : ''}
                      </div>
                    ` : '';
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

   // 🔹 Modal para perks
    document.querySelectorAll('.perk').forEach(img => {
      img.addEventListener('click', () => {
        const modalBg = document.createElement('div');
        modalBg.className = 'modalbg';

        const modal = document.createElement('div');
        modal.className = 'modal';

        const perkName = img.getAttribute('alt');
        const perkDescription = decodeURIComponent(img.dataset.description || '');
        const perkCharacter = img.dataset.character || '';
        const perkCharacterImage = img.dataset.characterImage || '';

        modal.innerHTML = `
          <h2>${perkName}</h2>
          <p class="perkDescription">${perkDescription}</p>
          <p class="perkCharacter">Character: ${perkCharacter}</p>
          ${perkCharacterImage ? `<img class="perkImage" src="${perkCharacterImage}" alt="${perkCharacter}">` : ''}
        `;

        modalBg.appendChild(modal);
        document.body.appendChild(modalBg);

        modalBg.addEventListener('click', (e) => {
          if (e.target === modalBg) {
            modalBg.remove();
          }
        });
      });
    });

  } catch (e) {
    console.error('Error cargando datos:', e);
  }
});

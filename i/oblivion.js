// Oblivion Alchemy Recipes Finder
// Refactored for Oblivion skill-based effect restrictions

function getCallerLineNumber() {
    const err = new Error();
    const stack = err.stack.split('\n');
    // let callerLine = stack[3] ? stack[3].match(/:(\d+):/) : null;
    // callerLine = callerLine ? callerLine[1] : '';
    // const callerName = stack[3] ? stack[3].split(/\s+/)[2] : '';
    return (err.stack.split('\n'))[3].split('at ')[1];
    return stack[3].split('at ')[1];
}

let dbg = 0; // 1= findMatches; 2= add/deleteItem; 4=future; 8=future;
const deleteIcon = "i/delete.png";
const addItemIcon = "i/plus.png";
const scriptAddIcon = "i/script_add.png";
const scriptDeleteIcon = "i/script_delete.png";

let preGeneratedRecipes = {};
let firstRun = true;
let filters = [];
let matches = [];
let newMatches = [];
let have = [];
let exclude = [];

const effects = [
    ["Burden", 43, 0],
    ["Chameleon", 43, 1],
    ["Cure Disease", 43, 1],
    ["Cure Paralysis", 43, 1],
    ["Cure Poison", 43, 1],
    ["Damage Agility", 43, 0],
    ["Damage Endurance", 43, 0],
    ["Damage Fatigue", 43, 0],
    ["Damage Health", 43, 0],
    ["Damage Intelligence", 43, 0],
    ["Damage Luck", 43, 0],
    ["Damage Magicka", 43, 0],
    ["Damage Personality", 43, 0],
    ["Damage Speed", 43, 0],
    ["Damage Strength", 43, 0],
    ["Damage Willpower", 43, 0],
    ["Detect Life", 43, 1],
    ["Dispel", 43, 1],
    ["Drain Fatigue", 43, 0],
    ["Drain Health", 43, 0],
    ["Feather", 43, 1],
    ["Fire Damage", 43, 0],
    ["Fire Shield", 43, 1],
    ["Fortify Agility", 43, 1],
    ["Fortify Endurance", 43, 1],
    ["Fortify Fatigue", 43, 1],
    ["Fortify Health", 43, 1],
    ["Fortify Intelligence", 43, 1],
    ["Fortify Luck", 43, 1],
    ["Fortify Magicka", 43, 1],
    ["Fortify Personality", 43, 1],
    ["Fortify Speed", 43, 1],
    ["Fortify Strength", 43, 1],
    ["Fortify Willpower", 43, 1],
    ["Frost Damage", 43, 0],
    ["Frost Shield", 43, 1],
    ["Invisibility", 43, 1],
    ["Light", 43, 1],
    ["Night-Eye", 43, 1],
    ["Paralyze", 43, 0],
    ["Reflect Damage", 43, 1],
    ["Reflect Spell", 43, 1],
    ["Resist Disease", 43, 1],
    ["Resist Fire", 43, 1],
    ["Resist Frost", 43, 1],
    ["Resist Paralysis", 43, 1],
    ["Resist Poison", 43, 1],
    ["Resist Shock", 43, 1],
    ["Restore Agility", 43, 1],
    ["Restore Endurance", 43, 1],
    ["Restore Fatigue", 43, 1],
    ["Restore Health", 43, 1],
    ["Restore Intelligence", 43, 1],
    ["Restore Luck", 43, 1],
    ["Restore Magicka", 43, 1],
    ["Restore Personality", 43, 1],
    ["Restore Speed", 43, 1],
    ["Restore Strength", 43, 1],
    ["Restore Willpower", 43, 1],
    ["Shield", 43, 1],
    ["Shock Damage", 43, 0],
    ["Shock Shield", 43, 1],
    ["Silence", 43, 0],
    ["Water Breathing", 43, 1],
    ["Water Walking", 43, 1]
];

const allIngredients = [
    ["Alkanet Flower", [52, 46, 37, 7], 5, 0],
    ["Alocasia Fruit", [50, 37, 51, 11], 4, 1],
    ["Aloe Vera Leaves", [50, 51, 11, 36], 2, 0],
    ["Apple", [50, 10, 33, 8], 5, 0],
    ["Arrowroot", [48, 10, 32, 0], 3, 0],
    ["Aster Bloom Core", [48, 17, 59, 0], 3, 1],
    ["Bergamot Seeds", [42, 17, 11, 62], 5, 0],
    ["Black Tar", [7, 13, 8, 60], 5, 1],
    ["Blackberry", [50, 47, 24, 54], 4, 0],
    ["Blister Pod Cap", [54, 29, 38, 36], 4, 1],
    ["Bloodgrass", [1, 45, 0, 26], 4, 0],
    ["Boar Meat", [51, 13, 26, 0], 2, 0],
    ["Bog Beacon Asco Cap", [54, 59, 12, 6], 3, 0],
    ["Bone Marrow", [8, 34, 11, 39], 2, 1],
    ["Bone Shard", [58, 35, 11, 10], 2, 1],
    ["Bonemeal", [7, 43, 28, 38], 4, 0],
    ["Bread Loaf", [50, 16, 5, 14], 5, 0],
    ["Cairn Bolete Cap", [51, 9, 45, 60], 4, 0],
    ["Carrot", [50, 38, 27, 6], 4, 0],
    ["Cheese Wedge", [50, 43, 22, 5], 5, 0],
    ["Clannfear Claws", [2, 42, 39, 8], 2, 0],
    ["Clouded Funnel Cap", [52, 27, 6, 11], 5, 0],
    ["Columbine Root Pulp", [55, 44, 29, 1], 5, 0],
    ["Congealed Putrescence", [57, 21, 54, 8], 3, 1],
    ["Corn", [50, 52, 5, 61], 5, 0],
    ["Crab Meat", [49, 47, 7, 22], 4, 0],
    ["Daedra Heart", [51, 61, 11, 62], 3, 0],
    ["Daedra Silk", [0, 38, 1, 6], 2, 0],
    ["Daedra Venin", [39, 50, 8, 40], 2, 0],
    ["Daedroth Teeth", [38, 35, 0, 37], 2, 0],
    ["Dragon's Tongue", [43, 8, 51, 22], 2, 0],
    ["Dreugh Wax", [7, 46, 63, 8], 2, 0],
    ["Ectoplasm", [60, 17, 29, 8], 3, 0],
    ["Elytra Ichor", [54, 0, 1, 62], 3, 1],
    ["Fennel Seeds", [50, 9, 11, 39], 2, 0],
    ["Fire Salts", [21, 44, 54, 22], 2, 0],
    ["Flame Stalk", [51, 21, 35, 36], 4, 1],
    ["Flax Seeds", [54, 20, 59, 8], 5, 0],
    ["Flour", [50, 12, 25, 40], 3, 0],
    ["Fly Amanita Cap", [48, 0, 51, 60], 5, 0],
    ["Foxglove Nectar", [46, 45, 53, 42], 5, 0],
    ["Frost Salts", [34, 43, 62, 35], 2, 0],
    ["Fungus Stalk", [57, 64, 26, 54], 5, 1],
    ["Garlic", [42, 5, 35, 32], 2, 0],
    ["Ginseng", [10, 4, 0, 29], 3, 0],
    ["Glow Dust", [56, 37, 41, 8], 2, 0],
    ["Gnarl Bark", [49, 59, 22, 8], 4, 1],
    ["Grapes", [50, 64, 17, 8], 3, 0],
    ["Green Stain Cup Cap", [50, 13, 40, 8], 5, 0],
    ["Grummite Eggs", [11, 17, 1, 62], 5, 1],
    ["Ham", [50, 51, 11, 10], 2, 0],
    ["Harrada", [8, 11, 62, 39], 2, 0],
    ["Hound Tooth", [4, 16, 0, 36], 2, 1],
    ["Hunger Tongue", [4, 2, 21, 29], 2, 1],
    ["Hydnum Azure Giant Spore", [49, 16, 26, 35], 5, 1],
    ["Imp Gall", [30, 3, 8, 21], 3, 0],
    ["Lady's Mantle Leaves", [51, 6, 38, 20], 2, 0],
    ["Lady's Smock Leaves", [52, 43, 7, 26], 5, 0],
    ["Lavender Sprig", [55, 33, 51, 10], 5, 0],
    ["Leek", [50, 23, 12, 14], 3, 0],
    ["Letifer Orca Digestive Slime", [8, 7, 11, 50], 3, 1],
    ["Lettuce", [50, 53, 22, 12], 4, 0],
    ["Mandrake Root", [2, 46, 5, 33], 4, 0],
    ["Milk Thistle Seeds", [37, 34, 3, 39], 5, 0],
    ["Minotaur Horn", [58, 0, 24, 45], 2, 0],
    ["Monkshood Root Pulp", [57, 9, 24, 0], 5, 0],
    ["Morning Glory Root Pulp", [0, 15, 35, 11], 3, 0],
    ["Mort Flesh", [7, 10, 26, 62], 3, 0],
    ["Motherwort Sprig", [46, 7, 62, 36], 5, 0],
    ["Mutton", [26, 7, 17, 11], 3, 0],
    ["Nightshade", [8, 0, 10, 29], 5, 0],
    ["Ogre's Teeth", [9, 45, 60, 32], 2, 0],
    ["Onion", [50, 63, 16, 8], 3, 0],
    ["Orange", [50, 16, 0, 59], 2, 0],
    ["Pear", [50, 13, 31, 8], 3, 0],
    ["Peony Seeds", [57, 8, 13, 50], 4, 0],
    ["Potato", [50, 59, 0, 35], 4, 0],
    ["Primrose Leaves", [58, 55, 28, 14], 3, 0],
    ["Pumpkin", [50, 5, 12, 16], 3, 0],
    ["Radish", [50, 6, 1, 0], 3, 0],
    ["Rat Meat", [7, 16, 11, 62], 4, 0],
    ["Red Kelp Gas Bladder", [56, 63, 2, 29], 5, 1],
    ["Redwort Flower", [44, 4, 8, 36], 3, 0],
    ["Rice", [50, 62, 61, 5], 4, 0],
    ["Rot Scale", [0, 8, 62, 39], 2, 1],
    ["Sacred Lotus Seeds", [44, 8, 20, 17], 4, 0],
    ["Scales", [15, 63, 8, 64], 2, 0],
    ["Scalon Fin", [63, 8, 60, 0], 4, 1],
    ["Scamp Skin", [11, 47, 40, 8], 2, 0],
    ["Screaming Maw", [58, 16, 1, 51], 3, 1],
    ["Smoked Baliwog Leg", [50, 20, 51, 7], 2, 1],
    ["Somnalius Frond", [56, 6, 26, 20], 4, 0],
    ["Spiddal Stick", [8, 11, 21, 50], 2, 0],
    ["St. Jahn's Wort Nectar", [47, 8, 4, 1], 4, 0],
    ["Steel-Blue Entoloma Cap", [54, 21, 44, 0], 5, 0],
    ["Stinkhorn Cap", [8, 54, 64, 36], 2, 0],
    ["Strawberry", [50, 4, 8, 40], 4, 0],
    ["Summer Bolete Cap", [48, 59, 12, 6], 4, 0],
    ["Swamp Tentacle", [55, 63, 64, 26], 3, 1],
    ["Sweetroll", [50, 42, 12, 26], 2, 0],
    ["Taproot", [53, 6, 46, 61], 2, 0],
    ["Thorn Hook", [8, 10, 54, 26], 2, 1],
    ["Tiger Lily Nectar", [49, 14, 64, 15], 4, 0],
    ["Tinder Polypore Cap", [58, 42, 36, 11], 4, 0],
    ["Tomato", [50, 16, 0, 59], 4, 0],
    ["Troll Fat", [5, 30, 15, 8], 2, 0],
    ["Vampire Dust", [62, 42, 34, 36], 2, 0],
    ["Venison", [51, 20, 8, 1], 5, 0],
    ["Viper's Bugloss Leaves", [45, 38, 0, 3], 5, 0],
    ["Void Essence", [51, 26, 32, 24], 2, 1],
    ["Void Salts", [54, 8, 29, 17], 2, 0],
    ["Watcher's Eye", [52, 29, 37, 41], 2, 1],
    ["Water Hyacinth Nectar", [10, 7, 54, 29], 3, 0],
    ["Water Root Pod Pit", [51, 43, 22, 63], 3, 1],
    ["Watermelon", [50, 37, 0, 8], 2, 0],
    ["Wheat Grain", [50, 11, 26, 12], 3, 0],
    ["White Seed Pod", [57, 63, 62, 37], 2, 0],
    ["Wisp Core", [52, 0, 37, 1], 4, 1],
    ["Wisp Stalk Caps", [8, 15, 9, 31], 4, 0],
    ["Withering Moon", [54, 59, 2, 41], 5, 1],
    ["Worm's Head Cap", [53, 38, 25, 39], 5, 1],
    ["Wormwood Leaves", [25, 36, 8, 11], 3, 0]
];

// const ii = allIngredients.reduce((acc, [ingredientName], index) => {
//     acc[ingredientName] = index;
//     return acc;
// }, {});

const isle = id => allIngredients[id]?.[3] ? '<sup>si</sup>' : '';
const relIngredient = allIngredients.map(item => item[0]);
const relEffectList = allIngredients.map(item => item[1]);
const relEffect = effects.map(effect => effect[0]);
const relWorth = effects.map(effect => effect[1]);
const relAffinity = effects.map(effect => effect[2]);
// indexIngredient
const ii = Object.fromEntries(
    allIngredients.map(([ingredientName], index) => [ingredientName, index])
);
// showIngredient; si('Troll Fat'); 'Troll Fat: Damage Agility, Fortify Personality, Damage Willpower, Damage Health'
const si = name => `${name}: ${allIngredients[ii[name]][1].map(i => effects[i][0]).join(', ')}`;
// showAllIngredient
function sai() {
    allIngredients.forEach((e,i)=>{
        console.log(si(e[0]));
    });
}

$(document).ready(() => {
    console.log('init');
    fetch('i/recipes.json.gz')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.arrayBuffer(); // Get raw binary data
        })
        .then(buffer => {
            // Decompress gzip
            const decompressed = pako.ungzip(new Uint8Array(buffer), { to: 'string' });
            const data = JSON.parse(decompressed); // Parse JSON
            preGeneratedRecipes = data;
            $("#results").html("")
            console.log('gz=', Object.keys(preGeneratedRecipes).length);
        })
        .catch(error => {
            console.error('Fetch failed:', error);
        });

    $("#autocomplete").autocomplete({
        source: relIngredient,
        delay: 0,
        autoFocus: true
    });

    $('input[name="recipeSize"], input[name="alch"], input[name="freq"], #si').change(() => refresh(true));
    $('input[name="pure"], input[name="sort"], #asc').change(() => refresh(false));
    $(":button").button(); // Ensure button widget is applied (tooltips)

    effects.forEach((effect, index) => {
        $("#effects").append(`<option value="${index}">${effect[0]}</option>`);
    });

    buildEffects();
});

function buildEffects() {
    const effectHtml = effects.map((effect, index) => `
        <span class="effect" data-id="${index}" style="font-weight:bold;color:${effect[2] === 1 ? 'green' : 'red'}">
            ${effect[0]} ($${effect[1]})
        </span><br/>
    `).join('');
    $("#listeffects").html(effectHtml).css("visibility", "visible");
    $("#listeffects .effect").tooltip({
        content: hoverEffect,
        position: {
            my: "left center",
            at: "right+10 center", // 10px right, vertically centered
            collision: "fit"
        },
        items: "[data-id]"
        // open: function(event, ui) {
        //     ui.tooltip.css("max-width", "300px");
        // }
    });
}

function hoverEffect() {
  // Use native dataset instead of jQuery
  const effectId = Number(this.dataset.id);
  if (!Number.isInteger(effectId)) {
    console.warn('Invalid effectId:', this.dataset.id);
    return '<b>Ingredients With Effect:</b><br/><table></table>';
  }

  // Map ingredients to { index, name } objects, filter, and sort
  const ingredientRows = allIngredients
    .map((item, idx) => {
      const effectArray = item[1] ?? [];
      const effectIndex = effectArray.indexOf(effectId);
      if (effectIndex === -1) return null;
      return { index: effectIndex + 1, name: item[0] }; // 1-based index
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index || a.name.localeCompare(b.name)); // Sort by index, then name

  // Build table with grouped indices
  const tableRows = ingredientRows.reduce((html, { index, name }, i, arr) => {
    const prevIndex = i > 0 ? arr[i - 1].index : null;
    const indexCell = index !== prevIndex ? `<td>${index}</td>` : '<td></td>';
    return `${html}<tr>${indexCell}<td>${name}</td></tr>`;
  }, '');

  return `<b>Ingredients With Effect:</b><br/><table>${tableRows}</table>`;
}

function hoverIngredients() {
    const ingredientId = parseInt($(this).attr("data-name"), 10);
    // console.log('ingredientId=',ingredientId);
    if (ingredientId === 1000) return "";
//  const ingredientEffects = relEffectList[ingredientId].sort();
    const ingredientEffects = allIngredients[ingredientId][1];
    let totalWorth = 0;
    const effectsHtml = ingredientEffects.map(effectId => {
        const effect = effects[effectId];
        totalWorth += effect[1];
        return `<span style="font-weight:bold;color:${effect[2] === 1 ? 'green' : 'red'}">${effect[0]}</span><br/>`;
    }).join('');
    return `${effectsHtml}<hr><b>Frequeency:</b> ${allIngredients[ingredientId][2]}`;
}

function ingredientOptions(id) {
    if (id === undefined || id === 1000) return "";
    return `
        <br/>
        <button onclick="removeHave(${id}); removeItem(${id});"><img src="${deleteIcon}"/></button>
        <button onclick="addItemFilter(${id}, true);"><img src="${scriptAddIcon}"/></button>
        <button onclick="addItemFilter(${id}, false);"><img src="${scriptDeleteIcon}"/></button>
    `;
}

function addFilter() {
    const hasEffect = !!parseInt($("#filter").val(), 10);
    const effectId = parseInt($("#effects").val(), 10);
    filters.push([
        `${hasEffect ? "Has" : "Does not have"} ${relEffect[effectId]}`,
        (effectIds) => hasEffect !== effectIds.includes(effectId)
    ]);
    console.log(`addFilter(): ${hasEffect ? "Has" : "Does not have"} ${relEffect[effectId]}`)
    offset = 0;
    refresh(false);
}

function addItemFilter(ingredientId, hasIngredient) {
    filters.push([
        `${hasIngredient ? "Has" : "Does not have"} ${relIngredient[ingredientId]}`,
        (_, ingredients) => hasIngredient !== ingredients.includes(ingredientId)
    ]);
    offset = 0;
    refresh(false);
}

function refresh(rebuildMatches) {
    console.log(rebuildMatches, getCallerLineNumber());
    if (firstRun) {
        $("#listeffects").css("visibility", "visible");
        $("#controls").css("display", "block");
        firstRun = false;
    }
    $("#results").html("");
    $("#warn").html("Generating recipes, please wait...<br/><br/>");
    setTimeout(() => refreshResults(rebuildMatches), 20);
}

// Global offset to track current page
let filteredMatches, maxResults, offset = 0;

function refreshResults(rebuildMatches) {
    const pure = parseInt($('input[name="pure"]:checked').val(), 10) || 0;
    const freq = parseInt($('input[name="freq"]:checked').val(), 10);
    const si = $("#si").prop("checked");

    const recipeSize = parseInt($('input[name="recipeSize"]:checked').val(), 10) || 2;
    const alchemySkill = parseInt($('input[name="alch"]:checked').val(), 10) || 0;
    maxResults = parseInt($("#max_results").val() || 100, 10);

    if (rebuildMatches) { // typeof rebuildMatches === 'boolean' && rebuildMatches === true) {
        deleteRare(freq, si);
        offset = 0;
        matches = filterPreGeneratedRecipes(alchemySkill, recipeSize, freq, si);
    }

    // Rest of the function remains the same
    const type = parseInt($('input[name="sort"]:checked').val(), 10) || 0;
    // console.log('type=',type);
    if ($('#asc').prop('checked')) {
        matches.sort((a, b) => a[4][type] - b[4][type] || a[4][3].localeCompare(b[4][3]));
    } else {
        matches.sort((a, b) => b[4][type] - a[4][type] || a[4][3].localeCompare(b[4][3]));
    }

    have.sort((a, b) => a - b);
    const ingredientsHtml = `
        <div id="ingredients" class="ingredients">
            <h4>Your Ingredients: Icon Legend</h4>
            <p>
                <img src="${deleteIcon}"/> = Remove ingredient<br/>
                <img src="${scriptAddIcon}"/> = Show recipes with this ingredient<br/>
                <img src="${scriptDeleteIcon}"/> = Exclude recipes with this ingredient
            </p>
            <hr>
            ${have.map((id, index) => `
                <button onclick="have.splice(${index}, 1); removeItem(${id});"><img src="${deleteIcon}"/></button>
                <button onclick="addItemFilter(${id}, true);"><img src="${scriptAddIcon}"/></button>
                <button onclick="addItemFilter(${id}, false);"><img src="${scriptDeleteIcon}"/></button>
                <span class="ingredient" data-name="${id}">${relIngredient[id]} ${isle(id)}</span><br/>
            `).join('')}
            ${excludeIngredients()}
        </div>
    `;
    $("#added").html(ingredientsHtml);
    $("#ingredients .ingredient").tooltip({
        content: hoverIngredients,
        position: {
            my: "left center",
            at: "right+10 center",
            collision: "fit"
        },
        items: "[data-name]"
    });

    if (have.length === 0) {
        $("#results").html("<br/>No ingredients selected.");
        $("#warn").html("");
        return;
    }

    if (matches.length === 0) {
        $("#results").html("<br/>No recipes found. Add more ingredients or adjust filters.");
        $("#warn").html("");
        return;
    }

    // Apply filters and affinity checks to get filtered matches
    filteredMatches = matches.filter(([ingredients, effectIds, skill, purity, value]) => {
        if (filters.length > 0 && filter(filters, effectIds, ingredients)) return false;
        // if (ingredients.some(i => allIngredients[i][2] <= freq)) return false;
        // if (ingredients.some(i => allIngredients[i][3]) && !si) return false;
        if (!(pure === 0 || pure === purity || pure&purity)) return false; // purity
        return true;
    });
    console.log('filteredMatches=',filteredMatches.length);

    const filterHtml = filters.length > 0
        ? `${filters.map((f, i) => `
            <a href="#" onclick="removeFilter(${i});"><img src="${deleteIcon}"/></a> ${f[0]}
        `).join(", ")}<br/>`
        : "";

    let resultHtml = `
        <br/>${filterHtml}
        <table id="xyz" cellpadding="3" cellspacing="0" border="1">
            <thead>
                <tr>
                    <th>Srt</th>
                    <th>Ingredient 1</th>
                    <th>Ingredient 2</th>
                    <th>Ingredient 3</th>
                    <th>Ingredient 4</th>
                    <th>Effects</th>
                </tr>
            </thead>
            <tbody>
    `;

    let count = 0;
    // Paginate filtered matches
    for (const [ingredients, effectIds, skill, purity, value] of filteredMatches.slice(offset, offset + maxResults)) {
        count++;
        const ingredientCells = [0, 1, 2, 3].map(i => {
            const id = ingredients[i] ?? 1000;
            const name = id === 1000 ? "none" : relIngredient[id];
            return `
                <td>
                    <span data-name="${id}" class="ingredient">${name}&thinsp;${isle(id)}</span>
                    ${ingredientOptions(id)}
                </td>
            `;
        }).join('');

        const effectsHtml = effectIds.map(id => {
            const effect = effects[id];
            return `
                <span class="effect" data-id="${id}" style="font-weight:bold;color:${effect[2] === 1 ? 'green' : 'red'}">
                    ${effect[0]}
                </span><br/>
            `;
        }).join('');

        resultHtml += `
            <tr>
                <td>${value[type]}</td>
                ${ingredientCells}
                <td>${effectsHtml}</td>
            </tr>
        `;
    }

    resultHtml += `
        </tbody>
        </table>
        <div>Showing ${offset + 1} to ${offset + count} of ${filteredMatches.length} recipes</div>
        <br/><br/>
    `;
    $("#results").html(resultHtml);
    $("#warn").html("");
    console.log('have: ', have.length, 'exclude: ', exclude.length);
    setTimeout(addHoverEffects, 100);

}

function calcPurity(effectIds){
    if(effectIds.every(e => effects[e][2] === 1)) return 1;
    if(effectIds.every(e => effects[e][2] === 0)) return 2;
    return 0;
}

function filterPreGeneratedRecipes(alchemySkill, recipeSize, freq, si) {
    return preGeneratedRecipes[recipeSize]
        .filter(pregen => pregen[2] <= alchemySkill &&
                         !pregen[0].some(i =>  allIngredients[i][2] <= freq) &&
                         (si || pregen[0].every(i => !allIngredients[i]?.[3]))) // Shivering Isles filter
                   // && (pregen[0].some(i => !allIngredients[i][3] || allIngredients[i][3] && si)))
        .map(([ingredients, effectIds, skill, purity, value]) => { 
            const usableEffects = getUsableEffectsForRecipe(ingredients, effectIds, alchemySkill);
            purity = calcPurity(usableEffects);
            value[1] = usableEffects.length;
            return [ingredients, usableEffects, skill, purity, value];})
        .filter(pregen => pregen[1].length >= 1); // Oblivion allows just 1 effect with 3,4 ingredients
}                                                 // There are no 1 effect recipes in pregen[3,4]

function getUsableEffectsForRecipe(ingredients, effectIds, alchemySkill) {
    return effectIds.filter(effectId => {
        let validIngredientCount = 0;
        for (const ingredientId of ingredients) {
            const effects = allIngredients[ingredientId]?.[1] || [];
            const effectIndex = effects.indexOf(effectId);
            if (effectIndex === -1) continue;
            if (effectIndex === 0 || 
                (effectIndex === 1 && alchemySkill >= 25) || 
                (effectIndex === 2 && alchemySkill >= 50) || 
                (effectIndex === 3 && alchemySkill >= 75)) {
                validIngredientCount++;
            }
        }
        return validIngredientCount >= 2;
    });
}

// Keydown listener
document.addEventListener('keydown', (event) => {
    if (event.key === 'PageDown' || event.key === 'PageUp' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault(); // Prevent page scrolling
    }
    if (event.key === 'PageDown' && offset + maxResults < filteredMatches.length) {
        offset += maxResults;
        console.log(offset + maxResults,filteredMatches.length,(offset + maxResults) < filteredMatches.length);
        refreshResults(false);
    } else if (event.key === 'PageUp' && offset > 0) {
        offset -= maxResults;
        offset = Math.max(0, offset);
        refreshResults(false);
    } else if (event.key === 'Home' && offset > 0) {
        offset = 0;
        refreshResults(false);
    } else if (event.key === 'End' && offset < filteredMatches.length - maxResults) {
        offset = filteredMatches.length - maxResults;
        // offset = Math.max(0, offset);
        refreshResults(false);
    }
});

function addHoverEffects() {
    $(".effect").tooltip({
        content: hoverEffect,
        position: {
            my: "right center",
            at: "left-10 center",
            collision: "fit"
        },
        items: "[data-id]"
    });

    $(".ingredient").tooltip({
        content: hoverIngredients,
        position: {
            my: "left center",
            at: "right+15 center",
            collision: "fit"
        },
        items: "[data-name]",
    });
}

function canUseEffect(effectId, alchemySkill, ...ingredientIds) {
    // Ensure effect is usable for ALL ingredients
    for (const id of ingredientIds) {
        const effects = allIngredients[id]?.[1] || [];
        const effectIndex = effects.indexOf(effectId);
        if (effectIndex === -1) return false; // Effect not found in this ingredient
        // Check if effect position is usable based on skill
        if (effectIndex === 0) continue; // 1st effect always usable
        if (effectIndex === 1 && alchemySkill < 25) return false; // 2nd effect needs Apprentice (25)
        if (effectIndex === 2 && alchemySkill < 50) return false; // 3rd effect needs Journeyman (50)
        if (effectIndex === 3 && alchemySkill < 75) return false; // 4th effect needs Expert/Master (75)
    }
    return true; // Effect is usable for all ingredients
}

function intersect(...arrays) {
    if (arrays.length === 0) return [];
    const result = arrays[0].filter(item => arrays.every(arr => arr.includes(item)));
    return result;
}

function worth(effectIds, ingredients) {
    return [ingredients.reduce((sum, id) => sum + allIngredients[id][2], 0), effectIds.length, 0,
            ingredients.reduce((str,num) => str + num.toString().padStart(3, "0"), '')];
}

function filter(filterList, effectIds, ingredients) {
    return filterList.some(([_, fn]) => fn(effectIds, ingredients));
}

function add() {
    const value = $("#autocomplete").val().toLowerCase();
    const index = relIngredient.findIndex(ing => ing.toLowerCase() === value);
    if (index === -1 || have.includes(index)) return;
    removeRare(index);
    have.push(index);
    $("#autocomplete").val("");
    refresh(false);
}

function addAll() {
    have = allIngredients.map((_, i) => i);
    // deleteRare();
    refresh(true);
}

function addItemOLD(id, element) {
    if (dbg & 2) console.log('addItem', id);
    if (!have.includes(id)) {
        console.log(`addItem(): ${id} ${relIngredient[id]}`);
        have.push(id);
        removeRare(id);

        const recipeSize = parseInt($('input[name="recipeSize"]:checked').val(), 10);
        newMatches = preGeneratedRecipes[recipeSize]
            .filter(recipe => recipe[0].includes(id));
        matches = matches.concat(newMatches);

        offset = 0;
        refresh(false);
    }
}

function addItem(id, element) { // fixed by Grok
    if (dbg & 2) console.log('addItem', id);
    if (!have.includes(id)) {
        console.log(`addItem(): ${id} ${relIngredient[id]}`);
        have.push(id);
        removeRare(id);

        const recipeSize = parseInt($('input[name="recipeSize"]:checked').val(), 10) || 2;
        const alchemySkill = parseInt($('input[name="alch"]:checked').val(), 10) || 0;
        const freq = parseInt($('input[name="freq"]:checked').val(), 10) || 0;
        const si = $("#si").prop("checked");

        // Get new recipes containing the ingredient, respecting all filters
        newMatches = filterPreGeneratedRecipes(alchemySkill, recipeSize, freq, si)
            .filter(recipe => recipe[0].includes(id));

        // Merge with existing matches, avoiding duplicates
        const matchSet = new Set(matches.map(m => JSON.stringify(m[0]))); // Use ingredient IDs as key
        matches = matches.concat(
            newMatches.filter(m => !matchSet.has(JSON.stringify(m[0])))
        );

        offset = 0;
        refresh(false);
    }
}

function removeItem(id) {
    dbg&2 && console.log('removeItem', id)
    console.log(`removeItem(): ${id} ${relIngredient[id]}`);
    exclude.push(id);
    matches = matches.filter(match => match && !match[0].includes(id));

    offset = 0;
    refresh(false);
}

function removeHave(id) {
    have = have.filter(h => h !== id);
}

function removeRare(id) {
    exclude = exclude.filter(e => e !== id);
}

function deleteRare(freq, si) {
    exclude = [];
    allIngredients.forEach((ingredient, index) => {
        if ((!si && ingredient[3] === 1) || ingredient[2] <= freq) {
            exclude.push(index);
        }
    });

    have = allIngredients
        .map((_, i) => i)
        .filter(i => !exclude.includes(i));

    dbg&2 && console.log("deleteRare:", 'freq=', freq, 'si=', si, "have", have.length, "excluded", exclude.length); // exclude.map(id => relIngredient[id]));
}

function removeFilter(index){
    offset = 0;
    filters.splice(index, 1); 
    refresh(false);
}

function excludeIngredients() {
    exclude.sort((a, b) => a - b);
    return `
        <hr>
        <h4>Rare Ingredients Excluded</h4>
        ${exclude.map(id => `
            <button onclick="addItem(${id}, this);"><img src="${addItemIcon}"/></button>
            <span class="ingredient" data-name="${id}">${relIngredient[id]}&thinsp;${isle(id)}</span><br/>
        `).join('')}
    `;
}

// debug(4,95,75)
// [[0,37],[0,37]]

function debug(recipeSize, i, alchemySkill){
    const [ingredients, effectIds, skill, purity, value] = preGeneratedRecipes[recipeSize.toString()][i]
    dump('p', recipeSize, i, 1);
    const usableEffects = getUsableEffectsForRecipe(ingredients, effectIds, alchemySkill);
    console.log(JSON.stringify([effectIds,usableEffects]));
}

// Example Usage - Valid calls
// dump('p', 4, 95, 1);     // Dump 1 preGeneratedRecipes, recipeSize 4, index 95
// dump('f', null, 0, 3);   // Dump 3 filteredMatches starting at 0
// dump('m', null, 10, 1);  // Dump 1 match at index 10

function dump(db, recipeSize, offset, count) {
    let results = [];
    let dataSource;

    if (db === 'p') {
        if (recipeSize !== 2 && recipeSize !== 3 && recipeSize !== 4) {
            console.error(`Invalid or missing recipeSize: ${recipeSize}. Must be 2, 3, or 4 for db='p'.`);
            return;
        }
        dataSource = preGeneratedRecipes[recipeSize.toString()];
        if (!dataSource) {
            console.error(`No recipes found for recipeSize: ${recipeSize}`);
            return;
        }
    } else if (db === 'f') {
        dataSource = filteredMatches;
    } else if (db === 'm') {
        dataSource = matches;
    } else {
        console.error(`Invalid db: ${db}. Use 'p', 'f', or 'm'.`);
        return;
    }

    if (!Array.isArray(dataSource)) {
        console.error(`Data source for db '${db}' is not an array.`);
        return;
    }

    offset = parseInt(offset, 10) || 0;
    count = parseInt(count, 10) || 0;
    if (count === 0) count = dataSource.length; // - offset
    const end = Math.min(offset + count, dataSource.length);

    if (offset < 0 || offset >= dataSource.length) {
        console.error(`Offset ${offset} is out of bounds for db '${db}' (length: ${dataSource.length}).`);
        return;
    }

    for (let i = offset; i < end; i++) {
        if (dataSource[i]) {
            results.push(formatRecipe(dataSource[i], i, db));
        } else {
            console.warn(`No recipe at index ${i} for db '${db}'.`);
        }
    }
    console.log(results.join('\n'));
}

function formatRecipe(recipe, index, db) {
    const results = [];
    if (!recipe || !Array.isArray(recipe)) {
        return `Invalid recipe at index ${index} for ${db}`;
    }

    const [ingredientIds, effectIds, skill, purity, value] = recipe;
    results.push(JSON.stringify([ingredientIds, effectIds, skill]));

    if (Array.isArray(ingredientIds)) {
        ingredientIds.forEach(id => {
            const ingredient = allIngredients[id] || ['Unknown', []];
            const effectsList = ingredient[1].map(i => `${i}: ${effects[i]?.[0] || 'Unknown'}`).join(', ');
            results.push(`${id}: ${ingredient[0]}, [${effectsList}]`);
        });
    }

    if (Array.isArray(effectIds)) {
        const effectsList = effectIds.map(i => `${i}: ${effects[i]?.[0] || 'Unknown'}`).join(', ');
        results.push(`\t[${effectsList}]`);
    }

    results.push(`\tskillRequired: ${skill || 'Unknown'}\n`);
    return results.join('\n');
}

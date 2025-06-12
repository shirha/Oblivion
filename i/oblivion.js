// Oblivion Alchemy Recipes Finder
// Refactored for Oblivion skill-based effect restrictions
// https://en.uesp.net/wiki/Oblivion:Alchemy#Calculating_Potion_Strengths

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
let newMatches = [], filteredNewMatches = [];
let have = [];
let exclude = [];
let customIngredients = new Set(
    JSON.parse(localStorage.getItem('oblivionCustomIngredients')) || [95, 118]
);

const effects = [
    ["Burden",1,1,0.21,0],
    ["Chameleon",0,1,0.63,1],
    ["Cure Disease",0,0,1400,0],
    ["Cure Paralysis",0,0,500,0],
    ["Cure Poison",0,0,600,0],
    ["Damage Agility",2,1,100,0],
    ["Damage Endurance",2,1,100,0],
    ["Damage Fatigue",2,1,4.4,0],
    ["Damage Health",2,1,12,0],
    ["Damage Intelligence",2,1,100,0],
    ["Damage Luck",2,1,100,0],
    ["Damage Magicka",2,1,2.45,0],
    ["Damage Personality",2,1,100,0],
    ["Damage Speed",2,1,100,0],
    ["Damage Strength",2,1,100,0],
    ["Damage Willpower",2,1,100,0],
    ["Detect Life",0,1,0.08,0],
    ["Dispel",0,2,3.6,0],
    ["Drain Fatigue",1,1,0.18,0],
    ["Drain Health",1,1,0.9,0],
    ["Feather",0,1,0.01,0],
    ["Fire Damage",2,1,7.5,0],
    ["Fire Shield",0,1,0.95,1],
    ["Fortify Agility",0,1,0.6,0],
    ["Fortify Endurance",0,1,0.6,0],
    ["Fortify Fatigue",0,1,0.04,0],
    ["Fortify Health",0,1,0.14,0],
    ["Fortify Intelligence",0,1,0.6,0],
    ["Fortify Luck",0,1,0.6,0],
    ["Fortify Magicka",0,1,0.15,0],
    ["Fortify Personality",0,1,0.6,0],
    ["Fortify Speed",0,1,0.6,0],
    ["Fortify Strength",0,1,0.6,0],
    ["Fortify Willpower",0,1,0.6,0],
    ["Frost Damage",2,1,7.4,0],
    ["Frost Shield",0,1,0.95,1],
    ["Invisibility",0,3,40,0],
    ["Light",0,1,0.051,0],
    ["Night-Eye",0,3,22,0],
    ["Paralyze",3,3,475,0],
    ["Reflect Damage",0,1,2.5,1],
    ["Reflect Spell",0,1,3.5,1],
    ["Resist Disease",0,1,0.5,1],
    ["Resist Fire",0,1,0.5,1],
    ["Resist Frost",0,1,0.5,1],
    ["Resist Paralysis",0,1,0.75,1],
    ["Resist Poison",0,1,0.5,1],
    ["Resist Shock",0,1,0.5,1],
    ["Restore Agility",0,1,38,0],
    ["Restore Endurance",0,1,38,0],
    ["Restore Fatigue",0,1,2,0],
    ["Restore Health",0,1,10,0],
    ["Restore Intelligence",0,1,38,0],
    ["Restore Luck",0,1,38,0],
    ["Restore Magicka",0,1,2.5,0],
    ["Restore Personality",0,1,38,0],
    ["Restore Speed",0,1,38,0],
    ["Restore Strength",0,1,38,0],
    ["Restore Willpower",0,1,38,0],
    ["Shield",0,1,0.45,1],
    ["Shock Damage",2,1,7.8,0],
    ["Shock Shield",0,1,0.95,1],
    ["Silence",1,3,60,0],
    ["Water Breathing",0,3,14.5,0],
    ["Water Walking",0,3,13,0]
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

const isle = id => allIngredients[id]?.[3] ? '&thinsp;<sup>si</sup>' : '';
const relIngredient = allIngredients.map(item => item[0]);
const relEffectList = allIngredients.map(item => item[1]);
const relEffect = effects.map(effect => effect[0]);
// const relWorth = effects.map(effect => effect[1]);
// const relAffinity = effects.map(effect => effect[2]);
const relAffinity = effects.map(effect => effect[1]);
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
            return response.arrayBuffer();
        })
        .then(buffer => {
            const decompressed = pako.ungzip(new Uint8Array(buffer), { to: 'string' });
            preGeneratedRecipes = JSON.parse(decompressed);
            $("#results").html("");
            have = allIngredients.map((_, i) => i).filter(i => !exclude.includes(i));
            refresh(true);
            console.log('gz=', Object.keys(preGeneratedRecipes).length);
        })
        .catch(error => console.error('Fetch failed:', error));

    $("#autocomplete").autocomplete({
        source: relIngredient,
        delay: 0,
        autoFocus: true
    });

    $('input[name="recipeSize"], input[name="alch"], input[name="freq"], #si').change(() => refresh(true));
    $('input[name="pure"], input[name="sort"], #asc').change(() => refresh(false));
    $(":button").button();

    effects.forEach((effect, index) => {
        $("#effects").append(`<option value="${index}">${effect[0]}</option>`);
    });

    // buildEffects();
    // console.log( effects.map((e,i) => `${e[0]}${getEffectTooltip(i)}`).join('\n') );

    // Event delegation for buttons
    $(document).on('click', '.remove-ingredient', function() {
        const id = parseInt($(this).data('id'), 10);
        if (!isNaN(id)) removeItem(id);
    });
    $(document).on('click', '.add-filter-include', function() {
        const id = parseInt($(this).data('id'), 10);
        if (!isNaN(id)) addItemFilter(id, true);
    });
    $(document).on('click', '.add-filter-exclude', function() {
        const id = parseInt($(this).data('id'), 10);
        if (!isNaN(id)) addItemFilter(id, false);
    });
    $(document).on('click', '.add-ingredient', function() {
        const id = parseInt($(this).data('id'), 10);
        if (!isNaN(id)) addItem(id);
    });
});

function buildEffects() {
    const effectHtml = effects.map((effect, index) => `
        <span class="effect" data-id="${index}" style="font-weight:bold;color:${effect[1] === 0 ? 'green' : 'red'}">
            ${effect[0]} ($${43/*effect[1]*/})
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
    });
}

function hoverEffect() {
  const [effectId, sideEffect] = this.dataset.id.split(',').map(Number);
  // const effectId = Number(this.dataset.id);
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

  return `${getEffectTooltip(effectId, sideEffect)}<br><b>Ingredients With Effect:</b><br/><table>${tableRows}</table>`;
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
        // totalWorth += 43; // effect[1];
        return `<span style="font-weight:bold;color:${effect[1] === 0 ? 'green' : 'red'}">${effect[0]}</span><br/>`;
    }).join('');
    return `${effectsHtml}<hr><b>Frequeency:</b> ${allIngredients[ingredientId][2]}`;
}

function ingredientOptions(id) {
    if (id === undefined || id === 1000) return "";
    return `
        <br/>
        <button class="remove-ingredient" data-id="${id}"><img src="${deleteIcon}"/></button>
        <button class="add-filter-include" data-id="${id}"><img src="${scriptAddIcon}"/></button>
        <button class="add-filter-exclude" data-id="${id}"><img src="${scriptDeleteIcon}"/></button>
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
    if (rebuildMatches) {
        deleteRare(freq, si, true);
        offset = 0;
        matches = filterPreGeneratedRecipes(alchemySkill, recipeSize, freq, si);
    // } else {
    //     deleteRare(freq, si, false);
    }
    syncMatches();
    const type = parseInt($('input[name="sort"]:checked').val(), 10) || 0;
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
            ${have.map(id => `
                <button class="remove-ingredient" data-id="${id}"><img src="${deleteIcon}"/></button>
                <button class="add-filter-include" data-id="${id}"><img src="${scriptAddIcon}"/></button>
                <button class="add-filter-exclude" data-id="${id}"><img src="${scriptDeleteIcon}"/></button>
                <span class="ingredient" data-name="${id}">${relIngredient[id]}${isle(id)}</span><br/>
            `).join('')}
            ${excludeIngredients()}
        </div>
    `;
    $("#added").html(ingredientsHtml);
    $("#ingredients .ingredient").tooltip({
        content: hoverIngredients,
        position: { my: "left center", at: "right+10 center", collision: "fit" },
        items: "[data-name]"
    });
    if (have.length === 0) {
        $("#results").html("<br/>No ingredients selected.");
        return;
    }
    if (matches.length === 0) {
        $("#results").html("<br/>No recipes found. Add more ingredients or adjust filters.");
        return;
    }
    filteredMatches = matches.filter(([ingredients, effectIds, skill, purity, value]) => {
        if (filters.length > 0 && filter(filters, effectIds, ingredients)) return false;
        if (!(pure === 0 || pure === purity || pure & purity)) return false;
        if (!ingredients.some(id => have.includes(id))) return false;
        if (ingredients.some(id => exclude.includes(id))) return false;
        return true;
    });
    console.log('matches=', matches.length, 'filteredMatches=', filteredMatches.length);
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
    for (const [ingredients, effectIds, skill, purity, value] of filteredMatches.slice(offset, offset + maxResults)) {
        count++;
        const ingredientCells = [0, 1, 2, 3].map(i => {
            const id = ingredients[i] ?? 1000;
            const name = id === 1000 ? "none" : relIngredient[id];
            return `
                <td>
                    <span data-name="${id}" class="ingredient">${name}${isle(id)}</span>
                    ${ingredientOptions(id)}
                </td>
            `;
        }).join('');
        const effectsHtml = effectIds.map(id => {
            const effect = effects[id]; // [name, poison, type, cost, pct]
            return `
                <span class="effect" data-id="${id},${!purity&&effect[1]?1:0}" style="font-weight:bold;color:${effect[1] === 0 ? 'green' : 'red'}">
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
    console.log('have: ', have.length, 'exclude: ', exclude.length);
    setTimeout(addHoverEffects, 100);
}

function arrayToObject(arr) {
    const [name, poison, type, cost, pct] = arr;
    return { name, poison, type, cost, pct };
}

function calcPurity(effectIds){
    if(effectIds.every(e => effects[e][1] === 0)) return 1;
    if(effectIds.every(e => effects[e][1] !== 0)) return 2;
    return 0;
}

function filterPreGeneratedRecipes(alchemySkill, recipeSize, freq, si) {
    return preGeneratedRecipes[recipeSize]
        .filter(pregen => {
            const [ingredients] = pregen;
            if (pregen[2] > alchemySkill) return false;
            if (freq === 5) {
                return ingredients.some(i => customIngredients.has(i));
            }
            return !ingredients.some(i => allIngredients[i][2] <= freq || (!si && allIngredients[i][3] === 1));
        })
        .map(([ingredients, effectIds, skill, purity, value]) => { 
            const usableEffects = getUsableEffectsForRecipe(ingredients, effectIds, alchemySkill);
            purity = calcPurity(usableEffects);
            value[1] = usableEffects.length;
            return [ingredients, usableEffects, skill, purity, value];
        })
        .filter(pregen => pregen[1].length >= 1);
        // Oblivion allows just 1 effect with 3,4 ingredients
        // There are no 1 effect recipes in pregen[3,4]
}

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

function syncMatches() {
    matches = matches.filter(([ingredients]) => {
        if (!ingredients.some(id => have.includes(id))) return false;
        if (ingredients.some(id => exclude.includes(id))) return false;
        return true;
    });
    if (dbg & 2) console.log(`syncMatches: matches=${matches.length}, have=${have.length}, exclude=${exclude.length}`);
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
    const freq = parseInt($('input[name="freq"]:checked').val(), 10) || 0;
    const si = $("#si").prop("checked");
    deleteRare(freq, si, false);
    have = allIngredients.map((_, i) => i).filter(i => !exclude.includes(i));
    refresh(true);
}

function addItem(id, element) {
    if (dbg & 2) console.log('addItem', id);
    if (!have.includes(id)) {
        console.log(`addItem(): ${id} ${relIngredient[id]}`);
        have.push(id);
        removeRare(id);
        const freq = parseInt($('input[name="freq"]:checked').val(), 10) || 0;
        if (freq === 5) {
            customIngredients.add(id);
            localStorage.setItem('oblivionCustomIngredients', JSON.stringify([...customIngredients]));
        }
        const recipeSize = parseInt($('input[name="recipeSize"]:checked').val(), 10) || 2;
        const alchemySkill = parseInt($('input[name="alch"]:checked').val(), 10) || 0;
        const si = $("#si").prop("checked");

        const matchSet = new Set(matches.map(m => JSON.stringify(m[0])));
    //  newMatches = filterPreGeneratedRecipes(alchemySkill, recipeSize, freq, si)
        newMatches = filterPreGeneratedRecipes(75, recipeSize, 1, 1)
            .filter(recipe => recipe[0].includes(id) && !recipe[0].some(i => exclude.includes(i)));
        const newMatchesLength = newMatches.length;
        newMatches = newMatches.filter(m => !matchSet.has(JSON.stringify(m[0])));
        matches = matches.concat(newMatches);
        console.log('newMatches=',newMatchesLength,'filteredNewMatches=',newMatches.length);

        syncMatches();
        offset = 0;
        refresh(false);
    }
}

function removeItem(id) {
    if (dbg & 2) console.log('removeItem', id);
    console.log(`removeItem(): ${id} ${relIngredient[id]}`);
    have = have.filter(h => h !== id);
    if (!exclude.includes(id)) exclude.push(id);
    if (customIngredients.delete(id)) {
        localStorage.setItem('oblivionCustomIngredients', JSON.stringify([...customIngredients]));
    }
    syncMatches();
    offset = 0;
    refresh(false);
}

function removeRare(id) {
    exclude = exclude.filter(e => e !== id);
}

function deleteRare(freq, si, resetHave = false) {
    exclude = [];
    if (freq === 5) {
        allIngredients.forEach((_, index) => {
            if (!customIngredients.has(index)) {
                exclude.push(index);
            }
        });
    } else {
        allIngredients.forEach((ingredient, index) => {
            if (ingredient[2] <= freq || (!si && ingredient[3] === 1)) {
                exclude.push(index);
            }
        });
    }
    if (resetHave) {
        have = allIngredients.map((_, i) => i).filter(i => !exclude.includes(i));
    } else {
        have = have.filter(i => !exclude.includes(i));
    }
    syncMatches();
    if (dbg & 1) console.log(`deleteRare: freq=${freq}, si=${si}, have=${have.length}, exclude=${exclude.length}, customIngredients=${customIngredients.size}`);
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
            <button class="add-ingredient" data-id="${id}"><img src="${addItemIcon}"/></button>
            <span class="ingredient" data-name="${id}">${relIngredient[id]}${isle(id)}</span><br/>
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

// Type constants
const NOTYPE = 0;
const STDTYPE = 1;
const MAGTYPE = 2;
const DURTYPE = 3;

// Equipment factors
const equipFacs = {
    [STDTYPE]: {
        Calc: 0.35,
        CalcDur: 0.35,
        CalcMag: 1.4,
        RetDur: 1,
        RetMag: 0.5,
        Alem: 2
    },
    [MAGTYPE]: {
        Calc: 0.3,
        RetMag: 0.5,
        Alem: 2
    },
    [DURTYPE]: {
        Calc: 0.25,
        RetDur: 0.35,
        Alem: 2
    }
};

function calculateEffectStrength(effectId) {
    const [name, poison, type, cost, pct] = effects[parseInt(effectId,10)];

    // const equip_str  = [0, 0.1, 0.25, 0.5, 0.75, 1., 1.25]; now in equipment select

    // Get inputs from HTML
    const skill = parseFloat(document.getElementById('skill').value) || 75;
    const luck = parseFloat(document.getElementById('luck').value) || 50;
    const mortar = parseFloat(document.getElementById('mortar').value);
    const retort = parseFloat(document.getElementById('retort').value);
    const alembic = parseFloat(document.getElementById('alembic').value);
    const calcinator = parseFloat(document.getElementById('calcinator').value);

    // Equipment strengths
    const equipStr = {
        MP: mortar,
        Ret: retort,
        Alem: alembic,
        Calc: calcinator
    };

    // Modified alchemy skill
    const modAlc = skill + 0.4 * (luck - 50);

    // Initialize result
    let mag, dur, baseMag, baseDur, sideMag, sideDur;

    // Handle NOTYPE
    if (type === NOTYPE) {
        return { mag: 1, dur: 1, baseMag: 1, baseDur: 1, sideMag: 1, sideDur: 1 };
    }

    // Base strength calculation
//    $str = ($mod_alc + $equip_str[$equip['MP']]*25.)/($this->cost/10.);
    let str = (modAlc + equipStr.MP * 25) / (cost / 10);
    if (type === STDTYPE) {
        mag = Math.pow(str / 4, 1 / 2.28);
        dur = 4 * mag;
    } else if (type === MAGTYPE) {
        mag = Math.pow(str, 1 / 1.28);
        dur = 1;
    } else {
        dur = str;
        mag = 1;
    }
    baseMag = mag;
    baseDur = dur;

    // Adjust for equipment
    if (type === STDTYPE) {
        if (!poison) {
            mag = baseMag;
            if (equipStr.Ret) {
                mag += baseMag * equipFacs[type].CalcMag * equipStr.Calc;
            } else {
                mag += baseMag * equipFacs[type].Calc * equipStr.Calc;
            }
            mag += baseMag * equipFacs[type].RetMag * equipStr.Ret;

            dur = baseDur;
            dur += baseDur * equipFacs[type].CalcDur * equipStr.Calc;
            dur += baseDur * equipFacs[type].RetDur * equipStr.Ret;
        } else {
            mag = baseMag * Math.pow(1 + equipFacs[type].Calc * equipStr.Calc, 2);
            dur = baseDur * Math.pow(1 + equipFacs[type].Calc * equipStr.Calc, 2);
        }
    } else if (type === DURTYPE) {
        dur = baseDur;
        dur += baseDur * equipFacs[type].Calc * equipStr.Calc;
        if (!poison) {
            dur += baseDur * equipFacs[type].RetDur * equipStr.Ret;
        }
    } else {
        mag = baseMag;
        if (poison) {
            mag += baseMag * equipFacs[type].Calc * equipStr.Calc;
        } else if (equipStr.Ret && equipStr.Calc) {
            mag += baseMag * equipFacs[type].Calc * equipStr.Calc * equipFacs[type].RetMag * equipStr.Ret;
        } else {
            mag += baseMag * equipFacs[type].Calc * equipStr.Calc;
            mag += baseMag * equipFacs[type].RetMag * equipStr.Ret;
        }
    }

    // Round values
    mag = Math.max(1, Math.floor(mag + 0.5001));
    dur = Math.max(1, Math.floor(dur + 0.5001));

    // Side effects for potions
    // if (!poison) {
        sideMag = mag;
        sideDur = dur;
    // } else {
    if (poison) {
        if (type === MAGTYPE) {
            sideMag = mag - baseMag * equipFacs[type].Alem * equipStr.Alem;
        } else if (type === DURTYPE) {
            sideDur = dur - baseDur * equipFacs[type].Alem * equipStr.Alem;
        } else {
            sideMag = baseMag * (1 + equipFacs[type].Calc * equipStr.Calc) *
                  (1 + equipFacs[type].Calc * equipStr.Calc - equipFacs[type].Alem * equipStr.Alem);
            sideDur = baseDur * (1 + equipFacs[type].Calc * equipStr.Calc) *
                  (1 + equipFacs[type].Calc * equipStr.Calc - equipFacs[type].Alem * equipStr.Alem);
        }
        sideMag = Math.max(1, Math.floor(sideMag + 0.5001));
        sideDur = Math.max(1, Math.floor(sideDur + 0.5001));
    }

    return { mag, dur, baseMag, baseDur, sideMag, sideDur };
}

function getEffectTooltip(effectId, doSide = 0) {
    const [name, poison, type, cost, pct] = effects[effectId];
    const findPoison = false; // Potion mode

    if (type === NOTYPE) {
        return "";
    }

    const { mag, dur, sideMag, sideDur } = calculateEffectStrength(effectId);
    let finalMag, finalDur;

    // Select mag/dur based on doSide and poison
    if (!doSide || (doSide === 1 && poison === findPoison)) {
        finalMag = mag;
        finalDur = dur;
    } else {
        finalMag = sideMag;
        finalDur = sideDur;
    }

    let out = " (";
    if (type === STDTYPE || type === MAGTYPE) {
        out += finalMag;
        out += pct ? '%' : 'pt';
    }
    if (type === STDTYPE) {
        out += ', ';
    }
    if (type === STDTYPE || type === DURTYPE) {
        out += finalDur + 's';
    }
    out += ")";
    out += doSide ? ' <smaller>Side Effect</smaller>' : '';
    // console.log(out);
    return out;
}

// hoverEffect.call(document.querySelector('#xyz .effect'));
// hoverEffect.call($("#xyz .effect")[0]) // unwrap jquery


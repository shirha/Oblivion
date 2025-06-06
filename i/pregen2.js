// pregenerate.js (run in Node.js or adapt for browser)
function intersect(...arrays) {
    if (arrays.length === 0) return [];
    const result = arrays[0].filter(item => arrays.every(arr => arr.includes(item)));
    return result;
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

function purity(effectIds){
    if(effectIds.every(e => effects[e][2] === 1)) return 1;
    if(effectIds.every(e => effects[e][2] === 0)) return 2;
    return 0;
}

function worth(effectIds, ingredients) {
    return [0, effectIds.length, 
            ingredients.reduce((sum, id) => sum + allIngredients[id][2], 0),
            ingredients.reduce((str,num) => str + num.toString().padStart(3, "0"), '')];
}

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

function findMatchesForPreGeneration(recipeSize) {
    const result = [];
    const allAvailable = allIngredients.map((_, i) => i); // All ingredients

    // Helper functions (copied from oblivion.js)
    function getUsableEffects(ingredientId, skill) {
        if (!allIngredients[ingredientId]) return [];
        const effects = allIngredients[ingredientId][1];
        if (skill < 25) return effects.slice(0, 1); // Novice
        if (skill < 50) return effects.slice(0, 2); // Apprentice
        if (skill < 75) return effects.slice(0, 3); // Journeyman
        return effects; // Expert/Master
    }

    function getPairwiseEffects(ingredientIds, effectArrays) {
        const effects = new Set();
        for (let i = 0; i < ingredientIds.length - 1; i++) {
            for (let j = i + 1; j < ingredientIds.length; j++) {
                const pairEffects = intersect(effectArrays[i], effectArrays[j]);
                for (const effectId of pairEffects) {
                    if (canUseEffect(effectId, 75, ingredientIds[i], ingredientIds[j])) {
                        effects.add(effectId);
                    }
                }
            }
        }
        return [...effects].sort((a, b) => a - b); // Sort for consistent comparison
    }

    function isRedundantRecipe(ingredientIds, recipeEffects) {
        for (let subsetSize = 2; subsetSize < ingredientIds.length; subsetSize++) {
            const subsets = getCombinations(ingredientIds, subsetSize);
            for (const subset of subsets) {
                const subsetEffectArrays = subset.map(id => getUsableEffects(id, 75));
                const subsetEffects = getPairwiseEffects(subset, subsetEffectArrays);
                if (subsetEffects.length === recipeEffects.length && 
                    subsetEffects.every((e, i) => e === recipeEffects[i])) {
                    return true;
                }
            }
        }
        return false;
    }

    function getCombinations(arr, size) {
        const result = [];
        function combine(start, current) {
            if (current.length === size) {
                result.push([...current]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                current.push(arr[i]);
                combine(i + 1, current);
                current.pop();
            }
        }
        combine(0, []);
        return result;
    }

    function getValidSkillLevels(ingredients, effectIds) {
        const skillLevels = [0, 25, 50, 75];
        return skillLevels.filter(skill => {
            const effectArrays = ingredients.map(id => getUsableEffects(id, skill));
            const validEffects = getPairwiseEffects(ingredients, effectArrays);
            return validEffects.length > 0;
        });
    }

    // let count = 0;
    function highestSkillNeeded(ingredientIds,effectIds) {
        const skillLevels = [0, 25, 50, 75];
        const skills = [];
        for(effect of effectIds) {
            for (id of ingredientIds) {
                skills.push(allIngredients[id][1].indexOf(effect));
            }
        }
        // if(count++ > 10) throw new Error();
        // console.log(JSON.stringify(skills),skillLevels[Math.max(...skills)]);
        return skillLevels[Math.max(...skills)];
    }

    // Generate recipes
    for (let i = 0; i < allAvailable.length - 1; i++) {
        const i0 = allAvailable[i];
        const e0 = getUsableEffects(i0, 75);
        for (let j = i + 1; j < allAvailable.length; j++) {
            const i1 = allAvailable[j];
            const e1 = getUsableEffects(i1, 75);
            const commonEffects = intersect(e0, e1).filter(effectId => 
                canUseEffect(effectId, 75, i0, i1));

            if (commonEffects.length > 0 && recipeSize === 2) {
                const value = worth(commonEffects, [i0, i1]);
                const skillLevels = highestSkillNeeded([i0, i1], commonEffects);
                result.push([[i0, i1], commonEffects, skillLevels, purity(commonEffects), value]);
            }

            if (recipeSize >= 3) {
                for (let k = j + 1; k < allAvailable.length; k++) {
                    const i2 = allAvailable[k];
                    const e2 = getUsableEffects(i2, 75);
                    const threeEffects = getPairwiseEffects([i0, i1, i2], [e0, e1, e2]);

                    if (threeEffects.length > 0 && recipeSize === 3) {
                        if (!isRedundantRecipe([i0, i1, i2], threeEffects)) {
                            const value = worth(threeEffects, [i0, i1, i2]);
                            const skillLevels = highestSkillNeeded([i0, i1, i2], threeEffects);
                            result.push([[i0, i1, i2], threeEffects, skillLevels, purity(threeEffects), value]);
                        }
                    }

                    if (recipeSize === 4) {
                        for (let m = k + 1; m < allAvailable.length; m++) {
                            const i3 = allAvailable[m];
                            const e3 = getUsableEffects(i3, 75);
                            const fourEffects = getPairwiseEffects([i0, i1, i2, i3], [e0, e1, e2, e3]);

                            if (fourEffects.length > 0 && !isRedundantRecipe([i0, i1, i2, i3], fourEffects)) {
                                const value = worth(fourEffects, [i0, i1, i2, i3]);
                                const skillLevels = highestSkillNeeded([i0, i1, i2, i3], fourEffects);
                                result.push([[i0, i1, i2, i3], fourEffects, skillLevels, purity(fourEffects), value]);
                            }
                        }
                    }
                }
            }
        }
    }
    console.log("findMatches returning", result.length, "recipes for size", recipeSize);
    return result;
}

// Generate for all recipe sizes
const preGeneratedRecipes = {
    2: findMatchesForPreGeneration(2),
    3: findMatchesForPreGeneration(3),
    4: findMatchesForPreGeneration(4)
};

const fs = require('fs');
const zlib = require('zlib');
// After generating preGeneratedRecipes
const json = JSON.stringify(preGeneratedRecipes);
const compressed = zlib.gzipSync(json);
fs.writeFileSync('recipes.json.gz', compressed);

// fs.writeFileSync('recipes.json', JSON.stringify(preGeneratedRecipes));
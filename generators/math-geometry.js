// Générateur de questions : Géométrie (aire, périmètre, volume, Pythagore)

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRectangleArea(difficulty) {
    const l = randomInt(2, difficulty <= 2 ? 15 : 50);
    const w = randomInt(2, difficulty <= 2 ? 15 : 50);
    return {
        question: `Calcule l'aire d'un rectangle de longueur ${l} m et de largeur ${w} m.`,
        answer: (l * w).toString(),
        hint: `Aire du rectangle = longueur × largeur\nA = ${l} × ${w} = ${l * w} m²`,
        unit: 'm²',
        type: 'number'
    };
}

function generateRectanglePerimeter(difficulty) {
    const l = randomInt(2, difficulty <= 2 ? 15 : 50);
    const w = randomInt(2, difficulty <= 2 ? 15 : 50);
    return {
        question: `Calcule le périmètre d'un rectangle de longueur ${l} m et de largeur ${w} m.`,
        answer: (2 * (l + w)).toString(),
        hint: `Périmètre du rectangle = 2 × (longueur + largeur)\nP = 2 × (${l} + ${w}) = 2 × ${l + w} = ${2 * (l + w)} m`,
        unit: 'm',
        type: 'number'
    };
}

function generateTriangleArea(difficulty) {
    const base = randomInt(3, difficulty <= 2 ? 15 : 40);
    const height = randomInt(2, difficulty <= 2 ? 12 : 30);
    const result = (base * height) / 2;
    return {
        question: `Calcule l'aire d'un triangle de base ${base} cm et de hauteur ${height} cm.`,
        answer: result.toString(),
        hint: `Aire du triangle = (base × hauteur) ÷ 2\nA = (${base} × ${height}) ÷ 2 = ${base * height} ÷ 2 = ${result} cm²`,
        unit: 'cm²',
        type: 'number'
    };
}

function generateCircleArea(difficulty) {
    const r = randomInt(2, difficulty <= 2 ? 10 : 25);
    const result = Math.round(Math.PI * r * r * 100) / 100;
    return {
        question: `Calcule l'aire d'un cercle de rayon ${r} cm. (arrondis à 2 décimales, utilise π ≈ 3.14159)`,
        answer: result.toString(),
        hint: `Aire du cercle = π × rayon²\nA = π × ${r}² = π × ${r * r} = ${result} cm²\n\nRappel : π ≈ 3.14159`,
        unit: 'cm²',
        type: 'number'
    };
}

function generateCirclePerimeter(difficulty) {
    const r = randomInt(2, difficulty <= 2 ? 10 : 25);
    const result = Math.round(2 * Math.PI * r * 100) / 100;
    return {
        question: `Calcule le périmètre (circonférence) d'un cercle de rayon ${r} cm. (arrondis à 2 décimales)`,
        answer: result.toString(),
        hint: `Périmètre du cercle = 2 × π × rayon\nP = 2 × π × ${r} = ${result} cm\n\nRappel : π ≈ 3.14159`,
        unit: 'cm',
        type: 'number'
    };
}

function generateCubeVolume(difficulty) {
    const a = randomInt(2, difficulty <= 2 ? 10 : 20);
    return {
        question: `Calcule le volume d'un cube de côté ${a} cm.`,
        answer: (a * a * a).toString(),
        hint: `Volume du cube = côté³\nV = ${a}³ = ${a} × ${a} × ${a} = ${a * a * a} cm³`,
        unit: 'cm³',
        type: 'number'
    };
}

function generateBoxVolume(difficulty) {
    const l = randomInt(2, difficulty <= 2 ? 10 : 25);
    const w = randomInt(2, difficulty <= 2 ? 10 : 25);
    const h = randomInt(2, difficulty <= 2 ? 10 : 20);
    return {
        question: `Calcule le volume d'un parallélépipède (boîte) de ${l} cm × ${w} cm × ${h} cm.`,
        answer: (l * w * h).toString(),
        hint: `Volume = longueur × largeur × hauteur\nV = ${l} × ${w} × ${h} = ${l * w * h} cm³`,
        unit: 'cm³',
        type: 'number'
    };
}

function generateCylinderVolume(difficulty) {
    const r = randomInt(2, difficulty <= 2 ? 8 : 15);
    const h = randomInt(3, difficulty <= 2 ? 12 : 25);
    const result = Math.round(Math.PI * r * r * h * 100) / 100;
    return {
        question: `Calcule le volume d'un cylindre de rayon ${r} cm et de hauteur ${h} cm. (arrondis à 2 décimales)`,
        answer: result.toString(),
        hint: `Volume du cylindre = π × rayon² × hauteur\nV = π × ${r}² × ${h} = π × ${r * r} × ${h} = ${result} cm³`,
        unit: 'cm³',
        type: 'number'
    };
}

function generatePythagoras(difficulty) {
    // Triplets de Pythagore
    const triplets = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[7,24,25],[9,12,15],[12,16,20],[15,20,25]];
    const t = triplets[randomInt(0, triplets.length - 1)];
    const mult = difficulty <= 2 ? 1 : randomInt(1, 3);
    const a = t[0] * mult;
    const b = t[1] * mult;
    const c = t[2] * mult;
    
    const type = randomInt(0, 2);
    if (type === 0) {
        return {
            question: `Un triangle rectangle a des côtés de ${a} cm et ${b} cm. Quelle est la longueur de l'hypoténuse ?`,
            answer: c.toString(),
            hint: `Théorème de Pythagore : a² + b² = c²\n${a}² + ${b}² = c²\n${a*a} + ${b*b} = c²\n${a*a + b*b} = c²\nc = √${a*a + b*b} = ${c} cm`,
            unit: 'cm',
            type: 'number'
        };
    } else {
        return {
            question: `Un triangle rectangle a une hypoténuse de ${c} cm et un côté de ${a} cm. Quelle est la longueur de l'autre côté ?`,
            answer: b.toString(),
            hint: `Théorème de Pythagore : a² + b² = c²\nDonc b² = c² - a²\nb² = ${c}² - ${a}² = ${c*c} - ${a*a} = ${c*c - a*a}\nb = √${c*c - a*a} = ${b} cm`,
            unit: 'cm',
            type: 'number'
        };
    }
}

function generateSquareArea(difficulty) {
    const a = randomInt(2, difficulty <= 2 ? 15 : 40);
    return {
        question: `Calcule l'aire d'un carré de côté ${a} cm.`,
        answer: (a * a).toString(),
        hint: `Aire du carré = côté²\nA = ${a}² = ${a * a} cm²`,
        unit: 'cm²',
        type: 'number'
    };
}

function generate(difficulty = 3) {
    const generators = [
        generateRectangleArea, generateRectanglePerimeter,
        generateTriangleArea, generateCircleArea, generateCirclePerimeter,
        generateCubeVolume, generateBoxVolume, generateCylinderVolume,
        generatePythagoras, generateSquareArea
    ];
    const gen = generators[randomInt(0, generators.length - 1)];
    const q = gen(difficulty);
    q.category = 'geometrie';
    q.categoryLabel = 'Géométrie';
    return q;
}

module.exports = { generate };

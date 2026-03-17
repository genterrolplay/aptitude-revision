// Générateur de questions : Conversions d'unités

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const conversions = {
    longueur: [
        { from: 'mm', to: 'cm', factor: 0.1 },
        { from: 'cm', to: 'mm', factor: 10 },
        { from: 'cm', to: 'm', factor: 0.01 },
        { from: 'm', to: 'cm', factor: 100 },
        { from: 'm', to: 'km', factor: 0.001 },
        { from: 'km', to: 'm', factor: 1000 },
        { from: 'cm', to: 'km', factor: 0.00001 },
        { from: 'km', to: 'cm', factor: 100000 },
        { from: 'mm', to: 'm', factor: 0.001 },
        { from: 'm', to: 'mm', factor: 1000 },
    ],
    masse: [
        { from: 'g', to: 'kg', factor: 0.001 },
        { from: 'kg', to: 'g', factor: 1000 },
        { from: 'mg', to: 'g', factor: 0.001 },
        { from: 'g', to: 'mg', factor: 1000 },
        { from: 'kg', to: 't', factor: 0.001 },
        { from: 't', to: 'kg', factor: 1000 },
    ],
    volume: [
        { from: 'mL', to: 'L', factor: 0.001 },
        { from: 'L', to: 'mL', factor: 1000 },
        { from: 'cL', to: 'L', factor: 0.01 },
        { from: 'L', to: 'cL', factor: 100 },
        { from: 'dL', to: 'L', factor: 0.1 },
        { from: 'L', to: 'dL', factor: 10 },
    ],
    surface: [
        { from: 'cm²', to: 'm²', factor: 0.0001 },
        { from: 'm²', to: 'cm²', factor: 10000 },
        { from: 'm²', to: 'km²', factor: 0.000001 },
    ],
    temps: [
        { from: 'min', to: 'h', factor: 1/60 },
        { from: 'h', to: 'min', factor: 60 },
        { from: 's', to: 'min', factor: 1/60 },
        { from: 'min', to: 's', factor: 60 },
    ]
};

const hints = {
    longueur: "Rappel : 1 km = 1000 m = 100'000 cm = 1'000'000 mm\nPour convertir, multiplie ou divise par 10, 100 ou 1000.",
    masse: "Rappel : 1 t = 1000 kg = 1'000'000 g\nPour convertir, multiplie ou divise par 1000.",
    volume: "Rappel : 1 L = 10 dL = 100 cL = 1000 mL\nPour convertir, multiplie ou divise par 10, 100 ou 1000.",
    surface: "Rappel : 1 m² = 10'000 cm²\nAttention : les conversions de surface utilisent le carré du facteur !",
    temps: "Rappel : 1 h = 60 min, 1 min = 60 s"
};

function generate(difficulty = 3) {
    const categories = Object.keys(conversions);
    const cat = categories[randomInt(0, categories.length - 1)];
    const convList = conversions[cat];
    const conv = convList[randomInt(0, convList.length - 1)];
    
    let value;
    if (conv.factor >= 1) {
        value = randomInt(1, difficulty <= 2 ? 10 : difficulty <= 4 ? 100 : 1000);
    } else {
        value = randomInt(1, difficulty <= 2 ? 100 : difficulty <= 4 ? 10000 : 100000);
    }
    
    const result = value * conv.factor;
    const resultStr = Number.isInteger(result) ? result.toString() : parseFloat(result.toPrecision(10)).toString();
    
    return {
        question: `${value} ${conv.from} = ? ${conv.to}`,
        answer: resultStr,
        hint: hints[cat],
        category: 'unites',
        categoryLabel: 'Changement d\'unités',
        type: 'number'
    };
}

module.exports = { generate };

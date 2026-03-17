// Générateur de questions : Pourcentages

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePercentOf(difficulty) {
    const percentages = difficulty <= 2 
        ? [10, 20, 25, 50, 75, 100]
        : difficulty <= 4
        ? [5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 80]
        : [3, 7, 8, 12, 15, 17, 22, 28, 33, 35, 42, 55, 65, 72, 85, 92];
    
    const percent = percentages[randomInt(0, percentages.length - 1)];
    const bases = difficulty <= 2 
        ? [50, 100, 200, 500, 1000]
        : difficulty <= 4
        ? [60, 80, 120, 150, 200, 250, 300, 400, 480, 500, 750, 800, 1000]
        : [45, 78, 120, 175, 230, 360, 425, 480, 560, 680, 750, 840, 950, 1200, 1500];
    
    const base = bases[randomInt(0, bases.length - 1)];
    const result = (percent / 100) * base;
    const resultStr = Number.isInteger(result) ? result.toString() : result.toFixed(2);
    
    return {
        question: `${percent}% de ${base} = ?`,
        answer: resultStr,
        hint: `Pour calculer ${percent}% de ${base} :\n1. Divise ${percent} par 100 → ${percent/100}\n2. Multiplie par ${base} → ${percent/100} × ${base} = ${resultStr}\n\nAstuce : ${percent}% = ${percent}/100`,
        type: 'number'
    };
}

function generateFindPercent(difficulty) {
    const percent = randomInt(5, 95);
    const base = randomInt(2, 20) * 10;
    const part = (percent / 100) * base;
    
    return {
        question: `${part} est quel pourcentage de ${base} ? (réponds en %)`,
        answer: percent.toString(),
        hint: `Pour trouver le pourcentage :\n1. Divise la partie par le total : ${part} ÷ ${base} = ${(part/base).toFixed(4)}\n2. Multiplie par 100 : ${(part/base).toFixed(4)} × 100 = ${percent}%\n\nFormule : (partie ÷ total) × 100`,
        type: 'number'
    };
}

function generatePercentIncrease(difficulty) {
    const percent = [5, 10, 15, 20, 25, 30, 50][randomInt(0, 6)];
    const original = randomInt(2, 20) * 10;
    const increase = (percent / 100) * original;
    const result = original + increase;
    
    return {
        question: `Un prix de ${original} CHF augmente de ${percent}%. Quel est le nouveau prix ?`,
        answer: result.toString(),
        hint: `1. Calcule l'augmentation : ${percent}% de ${original} = ${increase}\n2. Ajoute au prix original : ${original} + ${increase} = ${result} CHF\n\nOu directement : ${original} × ${(100 + percent)/100} = ${result}`,
        type: 'number'
    };
}

function generatePercentDecrease(difficulty) {
    const percent = [5, 10, 15, 20, 25, 30, 50][randomInt(0, 6)];
    const original = randomInt(2, 20) * 10;
    const decrease = (percent / 100) * original;
    const result = original - decrease;
    
    return {
        question: `Un article coûte ${original} CHF. Avec une réduction de ${percent}%, combien paie-t-on ?`,
        answer: result.toString(),
        hint: `1. Calcule la réduction : ${percent}% de ${original} = ${decrease}\n2. Soustrais du prix : ${original} - ${decrease} = ${result} CHF\n\nOu directement : ${original} × ${(100 - percent)/100} = ${result}`,
        type: 'number'
    };
}

function generate(difficulty = 3) {
    const generators = [generatePercentOf, generatePercentOf, generateFindPercent, generatePercentIncrease, generatePercentDecrease];
    const gen = generators[randomInt(0, generators.length - 1)];
    const q = gen(difficulty);
    q.category = 'pourcentages';
    q.categoryLabel = 'Pourcentages';
    return q;
}

module.exports = { generate };

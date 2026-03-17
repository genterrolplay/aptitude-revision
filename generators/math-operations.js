// Générateur de questions : Opérations simples (+, -, ×, ÷)

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAddition(difficulty) {
    let a, b;
    if (difficulty <= 2) { a = randomInt(1, 50); b = randomInt(1, 50); }
    else if (difficulty <= 4) { a = randomInt(10, 500); b = randomInt(10, 500); }
    else { a = randomInt(100, 9999); b = randomInt(100, 9999); }
    
    return {
        question: `${a} + ${b} = ?`,
        answer: (a + b).toString(),
        hint: "Additionne les unités d'abord, puis les dizaines, les centaines, etc. N'oublie pas les retenues.",
        type: 'number'
    };
}

function generateSubtraction(difficulty) {
    let a, b;
    if (difficulty <= 2) { a = randomInt(10, 100); b = randomInt(1, a); }
    else if (difficulty <= 4) { a = randomInt(100, 1000); b = randomInt(10, a); }
    else { a = randomInt(500, 9999); b = randomInt(100, a); }
    
    return {
        question: `${a} - ${b} = ?`,
        answer: (a - b).toString(),
        hint: "Soustrais les unités d'abord, puis les dizaines. Si le chiffre du haut est plus petit, emprunte au chiffre suivant.",
        type: 'number'
    };
}

function generateMultiplication(difficulty) {
    let a, b;
    if (difficulty <= 2) { a = randomInt(2, 12); b = randomInt(2, 12); }
    else if (difficulty <= 4) { a = randomInt(2, 12); b = randomInt(10, 99); }
    else { a = randomInt(10, 99); b = randomInt(10, 99); }
    
    return {
        question: `${a} × ${b} = ?`,
        answer: (a * b).toString(),
        hint: `Rappel des livrets : décompose si nécessaire. Par exemple, ${a} × ${b} = ${a} × ${Math.floor(b/10)*10} + ${a} × ${b%10}.`,
        type: 'number'
    };
}

function generateDivision(difficulty) {
    let b, result;
    if (difficulty <= 2) { b = randomInt(2, 12); result = randomInt(2, 12); }
    else if (difficulty <= 4) { b = randomInt(2, 12); result = randomInt(10, 50); }
    else { b = randomInt(2, 25); result = randomInt(10, 100); }
    
    const a = b * result;
    
    return {
        question: `${a} ÷ ${b} = ?`,
        answer: result.toString(),
        hint: `Cherche combien de fois ${b} rentre dans ${a}. Tu peux aussi te demander : ${b} × ? = ${a}`,
        type: 'number'
    };
}

function generate(difficulty = 3) {
    const generators = [generateAddition, generateSubtraction, generateMultiplication, generateDivision];
    const gen = generators[randomInt(0, generators.length - 1)];
    const q = gen(difficulty);
    q.category = 'operations';
    q.categoryLabel = 'Opérations simples';
    return q;
}

module.exports = { generate, generateAddition, generateSubtraction, generateMultiplication, generateDivision };

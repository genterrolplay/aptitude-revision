// Générateur de questions : Fractions et décimaux

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) { [a, b] = [b, a % b]; }
    return a;
}

function generateDecimalToFraction(difficulty) {
    // Generate a fraction, convert to decimal, ask for fraction
    const denominators = [2, 4, 5, 8, 10, 16, 20, 25, 50, 100];
    const denom = denominators[randomInt(0, Math.min(difficulty + 1, denominators.length - 1))];
    const numer = randomInt(1, denom * 3);
    const decimal = (numer / denom).toFixed(4).replace(/\.?0+$/, '');
    const g = gcd(numer, denom);
    
    return {
        question: `Convertis en fraction : ${decimal} = ?/? (écris sous la forme numérateur/dénominateur)`,
        answer: `${numer/g}/${denom/g}`,
        hint: `Pour convertir ${decimal} en fraction :\n1. Compte les décimales (ex: 0.25 a 2 décimales)\n2. Mets le nombre sans virgule au numérateur\n3. Mets la puissance de 10 correspondante au dénominateur\n4. Simplifie la fraction`,
        type: 'fraction'
    };
}

function generateFractionToDecimal(difficulty) {
    const denominators = [2, 4, 5, 8, 10, 16, 20, 25];
    const denom = denominators[randomInt(0, Math.min(difficulty + 1, denominators.length - 1))];
    const numer = randomInt(1, denom * 2);
    const g = gcd(numer, denom);
    const simplifiedNum = numer / g;
    const simplifiedDen = denom / g;
    const result = (simplifiedNum / simplifiedDen);
    const resultStr = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
    
    return {
        question: `Convertis en décimal : ${simplifiedNum}/${simplifiedDen} = ?`,
        answer: resultStr,
        hint: `Divise le numérateur par le dénominateur : ${simplifiedNum} ÷ ${simplifiedDen}.\nPar exemple : 4/16 = 4 ÷ 16 = 0.25`,
        type: 'number'
    };
}

function generateSimplifyFraction(difficulty) {
    const base_numer = randomInt(1, 10);
    const base_denom = randomInt(2, 12);
    const multiplier = randomInt(2, difficulty <= 2 ? 5 : 10);
    const numer = base_numer * multiplier;
    const denom = base_denom * multiplier;
    const g = gcd(numer, denom);
    
    return {
        question: `Simplifie la fraction : ${numer}/${denom} = ?/? (écris sous la forme numérateur/dénominateur)`,
        answer: `${numer/g}/${denom/g}`,
        hint: `Trouve le plus grand commun diviseur (PGCD) de ${numer} et ${denom}, puis divise le numérateur et le dénominateur par ce nombre.\nEssaie de diviser par 2, 3, 5... etc.`,
        type: 'fraction'
    };
}

function generateFractionCompare(difficulty) {
    const denom1 = randomInt(2, 10);
    const denom2 = randomInt(2, 10);
    const numer1 = randomInt(1, denom1);
    const numer2 = randomInt(1, denom2);
    const val1 = numer1 / denom1;
    const val2 = numer2 / denom2;
    
    let answer;
    if (Math.abs(val1 - val2) < 0.0001) answer = '=';
    else if (val1 > val2) answer = '>';
    else answer = '<';
    
    return {
        question: `Compare les fractions : ${numer1}/${denom1} ... ${numer2}/${denom2}\n(réponds avec <, > ou =)`,
        answer: answer,
        hint: `Met les fractions au même dénominateur pour les comparer.\nDénominateur commun = ${denom1} × ${denom2} = ${denom1*denom2}\n${numer1}/${denom1} = ${numer1*denom2}/${denom1*denom2}\n${numer2}/${denom2} = ${numer2*denom1}/${denom1*denom2}`,
        type: 'comparison'
    };
}

function generate(difficulty = 3) {
    const generators = [generateDecimalToFraction, generateFractionToDecimal, generateSimplifyFraction, generateFractionCompare];
    const gen = generators[randomInt(0, generators.length - 1)];
    const q = gen(difficulty);
    q.category = 'fractions';
    q.categoryLabel = 'Fractions et décimaux';
    return q;
}

module.exports = { generate };

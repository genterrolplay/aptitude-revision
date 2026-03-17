// Générateur de questions : Français (orthographe, conjugaison, vocabulaire, compréhension)

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const orthographeQuestions = [
    { q: "Quelle est la bonne orthographe ?", options: ["appercevoir", "apercevoir", "apperçevoir", "aperçevoir"], answer: "apercevoir", hint: "Un seul 'p' et pas de cédille : apercevoir." },
    { q: "Quelle est la bonne orthographe ?", options: ["aquérir", "acquérir", "acquérrir", "aquerir"], answer: "acquérir", hint: "Acquérir prend 'cqu' et un accent aigu." },
    { q: "Complète : Il a ___ ses amis hier.", options: ["vu", "vue", "vus", "vues"], answer: "vu", hint: "Avec l'auxiliaire 'avoir', le participe passé ne s'accorde pas si le COD est après le verbe." },
    { q: "Quelle est la bonne orthographe ?", options: ["nécessaire", "nécéssaire", "nécessère", "nécéssère"], answer: "nécessaire", hint: "Nécessaire : un seul 'c', deux 's'." },
    { q: "Complète : Les fleurs que j'ai ___ sont belles.", options: ["cueilli", "cueillie", "cueillis", "cueillies"], answer: "cueillies", hint: "Avec 'avoir', le participe passé s'accorde avec le COD placé avant : 'les fleurs' (féminin pluriel)." },
    { q: "Quelle est la bonne orthographe ?", options: ["enveloppe", "enveloppe", "enveloppé", "envelope"], answer: "enveloppe", hint: "Enveloppe avec deux 'p' et un 'e' final." },
    { q: "Complète : Elle s'est ___ les mains.", options: ["lavé", "lavée", "lavés", "lavées"], answer: "lavé", hint: "Avec un pronom réfléchi + COD après le verbe ('les mains'), pas d'accord." },
    { q: "Quelle est la bonne orthographe ?", options: ["parralèle", "parallèle", "parallele", "parrallèle"], answer: "parallèle", hint: "Parallèle : deux 'l', un seul 'r'." },
    { q: "Complète : Elles se sont ___ au téléphone.", options: ["parlé", "parlée", "parlés", "parlées"], answer: "parlé", hint: "'Se parler' est un verbe transitif indirect (parler À quelqu'un), donc pas d'accord." },
    { q: "Quelle est la bonne orthographe ?", options: ["rhythme", "rythme", "rythm", "rithme"], answer: "rythme", hint: "Rythme : 'y' et 'th' au milieu." },
    { q: "Complète : La pomme que j'ai ___ était délicieuse.", options: ["mangé", "mangée", "mangés", "mangées"], answer: "mangée", hint: "Avec 'avoir', accord avec le COD placé avant : 'la pomme' (féminin singulier)." },
    { q: "Quelle forme est correcte ?", options: ["Je me rappelle de cet événement", "Je me rappelle cet événement", "Je me souviens cet événement"], answer: "Je me rappelle cet événement", hint: "On dit 'se rappeler quelque chose' (transitif direct) mais 'se souvenir DE quelque chose'." },
    { q: "Quelle est la bonne orthographe ?", options: ["dévelopmment", "développement", "developement", "développment"], answer: "développement", hint: "Développement : deux 'p', deux 'e' avec accents, 'ment' à la fin." },
    { q: "Quelle orthographe est correcte ?", options: ["language", "langage", "langagge", "languaje"], answer: "langage", hint: "Langage : un seul 'g' au milieu, pas de 'u'." },
    { q: "Complète : Les enfants ___ dans le jardin.", options: ["joue", "joues", "jouent", "jouez"], answer: "jouent", hint: "Les enfants = 3e personne du pluriel → -ent." },
    { q: "Quelle est la bonne orthographe ?", options: ["abscence", "absence", "absense", "abscense"], answer: "absence", hint: "Absence : 's' après le 'b', pas de 'c'." },
    { q: "Complète : Nous ___ au cinéma demain.", options: ["iront", "irons", "allons aller", "irons"], answer: "irons", hint: "Futur simple du verbe 'aller' à la 1re personne du pluriel : nous irons." },
    { q: "Quelle est la bonne orthographe ?", options: ["acceuil", "accueil", "acceuille", "acueil"], answer: "accueil", hint: "Accueil : 'cc' puis 'ueil' (attention à l'ordre u-e-i-l)." },
    { q: "Quelle phrase est correcte ?", options: ["C'est moi qui a raison", "C'est moi qui ai raison", "C'est moi qui est raison"], answer: "C'est moi qui ai raison", hint: "'Qui' reprend 'moi' (1re personne) → le verbe se conjugue à la 1re personne : ai." },
    { q: "Quelle est la bonne orthographe ?", options: ["exagérer", "éxagérer", "exagèrer", "éxagèrer"], answer: "exagérer", hint: "Exagérer : pas d'accent sur le 'e' initial, accent aigu sur le 2e 'e'." },
    { q: "Complète : Il faut que je ___ mes devoirs.", options: ["fais", "fasse", "fait", "ferais"], answer: "fasse", hint: "Après 'il faut que' on utilise le subjonctif : que je fasse." },
    { q: "Complète avec 'a' ou 'à' : Il ___ donné son livre ___ Marie.", options: ["a / à", "à / a", "a / a", "à / à"], answer: "a / à", hint: "'a' sans accent = verbe avoir. 'à' avec accent = préposition." },
    { q: "Complète avec 'ou' ou 'où' : ___ vas-tu ?", options: ["Ou", "Où"], answer: "Où", hint: "'Où' avec accent = lieu/direction. 'Ou' sans accent = alternative (ou bien)." },
    { q: "Complète avec 'ce' ou 'se' : ___ matin, il ___ lève tôt.", options: ["Ce / se", "Se / ce", "Ce / ce", "Se / se"], answer: "Ce / se", hint: "'Ce' = déterminant (ce matin). 'Se' = pronom réfléchi (se lever)." },
    { q: "Complète avec 'son' ou 'sont' : Ils ___ partis avec ___ sac.", options: ["sont / son", "son / sont", "sont / sont", "son / son"], answer: "sont / son", hint: "'Sont' = verbe être (ils sont). 'Son' = possessif (son sac)." },
    { q: "Complète avec 'ces' ou 'ses' : ___ livres sont à lui, ___ cahiers sont à moi.", options: ["Ses / ces", "Ces / ses", "Ses / ses", "Ces / ces"], answer: "Ses / ces", hint: "'Ses' = possessif (ses livres = les siens). 'Ces' = démonstratif (ces cahiers-là)." },
    { q: "Quel mot est un synonyme de 'rapide' ?", options: ["lent", "véloce", "lourd", "calme"], answer: "véloce", hint: "Véloce signifie rapide, prompt." },
    { q: "Quel mot est un antonyme de 'généreux' ?", options: ["avare", "gentil", "aimable", "riche"], answer: "avare", hint: "Avare est le contraire de généreux." },
    { q: "Quel est le pluriel de 'travail' ?", options: ["travails", "travaux", "travailes", "travauxes"], answer: "travaux", hint: "Les mots en -ail font généralement leur pluriel en -aux : un travail → des travaux." },
    { q: "Quel est le féminin de 'acteur' ?", options: ["acteure", "actrice", "acteuse", "actrisse"], answer: "actrice", hint: "Acteur → actrice (comme directeur → directrice)." },
];

const comprehensionTextes = [
    {
        texte: "Pierre travaille sur un chantier de construction depuis 3 ans. Chaque matin, il commence à 7h et termine à 16h avec une pause d'une heure à midi. Il est spécialisé dans la maçonnerie et aime particulièrement les travaux de finition. Son chef d'équipe, Marc, apprécie son sérieux et sa ponctualité.",
        questions: [
            { q: "À quelle heure Pierre commence-t-il sa journée ?", options: ["6h", "7h", "8h", "9h"], answer: "7h", hint: "Relis la deuxième phrase du texte." },
            { q: "Combien d'heures Pierre travaille-t-il par jour (sans la pause) ?", options: ["7 heures", "8 heures", "9 heures", "10 heures"], answer: "8 heures", hint: "De 7h à 16h = 9h, moins 1h de pause = 8h." },
            { q: "Quelle est la spécialité de Pierre ?", options: ["La plomberie", "La maçonnerie", "L'électricité", "La peinture"], answer: "La maçonnerie", hint: "Relis la troisième phrase." },
            { q: "Comment s'appelle le chef d'équipe de Pierre ?", options: ["Pierre", "Paul", "Marc", "Jean"], answer: "Marc", hint: "Relis la dernière phrase du texte." },
        ]
    },
    {
        texte: "La Suisse compte 26 cantons. Le canton de Vaud, avec Lausanne comme chef-lieu, est l'un des plus grands. Il est situé dans la partie francophone du pays, appelée Romandie. Le lac Léman, partagé entre la Suisse et la France, borde ses rives au sud. L'économie du canton repose notamment sur les services, la technologie et le tourisme.",
        questions: [
            { q: "Combien de cantons compte la Suisse ?", options: ["20", "24", "26", "28"], answer: "26", hint: "C'est mentionné dans la première phrase." },
            { q: "Quel est le chef-lieu du canton de Vaud ?", options: ["Genève", "Berne", "Lausanne", "Zurich"], answer: "Lausanne", hint: "Relis la deuxième phrase." },
            { q: "Comment s'appelle la partie francophone de la Suisse ?", options: ["L'Alémanie", "La Romandie", "La Francophonie", "L'Helvétie"], answer: "La Romandie", hint: "Relis la troisième phrase." },
            { q: "Avec quel pays la Suisse partage-t-elle le lac Léman ?", options: ["L'Italie", "L'Allemagne", "L'Autriche", "La France"], answer: "La France", hint: "Relis la quatrième phrase." },
        ]
    },
    {
        texte: "L'apprentissage en Suisse dure généralement entre 2 et 4 ans selon le métier. Pendant cette période, l'apprenti partage son temps entre l'entreprise formatrice et l'école professionnelle. En moyenne, un apprenti passe 3 à 4 jours par semaine en entreprise et 1 à 2 jours à l'école. À la fin de la formation, il obtient un Certificat Fédéral de Capacité (CFC).",
        questions: [
            { q: "Combien de temps dure un apprentissage en Suisse ?", options: ["1 à 2 ans", "2 à 4 ans", "3 à 5 ans", "4 à 6 ans"], answer: "2 à 4 ans", hint: "C'est indiqué dans la première phrase." },
            { q: "Combien de jours par semaine un apprenti passe-t-il en entreprise ?", options: ["1 à 2 jours", "2 à 3 jours", "3 à 4 jours", "5 jours"], answer: "3 à 4 jours", hint: "Relis la troisième phrase." },
            { q: "Quel diplôme obtient-on à la fin de l'apprentissage ?", options: ["Un baccalauréat", "Un CFC", "Un master", "Un brevet"], answer: "Un CFC", hint: "C'est mentionné dans la dernière phrase : Certificat Fédéral de Capacité." },
        ]
    },
    {
        texte: "Sur un chantier, la sécurité est primordiale. Chaque ouvrier doit porter un casque, des chaussures de sécurité et un gilet réfléchissant. Les échafaudages doivent être vérifiés quotidiennement avant toute utilisation. En cas d'accident, il faut immédiatement appeler le numéro d'urgence 144 et sécuriser la zone. Le responsable sécurité du chantier, Mme Dupont, organise une formation chaque mois.",
        questions: [
            { q: "Quels équipements de protection sont obligatoires ? (choisis le plus complet)", options: ["Casque uniquement", "Casque et chaussures", "Casque, chaussures de sécurité et gilet", "Gilet uniquement"], answer: "Casque, chaussures de sécurité et gilet", hint: "Relis la deuxième phrase pour la liste complète." },
            { q: "À quelle fréquence les échafaudages doivent-ils être vérifiés ?", options: ["Chaque semaine", "Chaque mois", "Quotidiennement", "Chaque année"], answer: "Quotidiennement", hint: "Relis la troisième phrase." },
            { q: "Quel numéro appeler en cas d'urgence ?", options: ["112", "117", "118", "144"], answer: "144", hint: "C'est le numéro mentionné dans le texte." },
            { q: "Qui est responsable de la sécurité sur le chantier ?", options: ["M. Martin", "Mme Dupont", "M. Dupont", "Mme Martin"], answer: "Mme Dupont", hint: "Relis la dernière phrase." },
        ]
    },
    {
        texte: "Le béton est un matériau de construction composé principalement de ciment, de sable, de gravier et d'eau. Le dosage standard pour un béton courant est d'environ 350 kg de ciment pour 1 m³. Le temps de séchage complet peut atteindre 28 jours, bien que le béton soit déjà suffisamment dur après 7 jours pour supporter des charges légères. La température idéale pour le coulage se situe entre 5°C et 30°C.",
        questions: [
            { q: "Quels sont les composants principaux du béton ?", options: ["Ciment et eau uniquement", "Ciment, sable, gravier et eau", "Sable et gravier uniquement", "Ciment et sable uniquement"], answer: "Ciment, sable, gravier et eau", hint: "Relis la première phrase pour la composition complète." },
            { q: "Combien de kg de ciment faut-il pour 1 m³ de béton ?", options: ["200 kg", "250 kg", "350 kg", "500 kg"], answer: "350 kg", hint: "Relis la deuxième phrase." },
            { q: "Au bout de combien de jours le béton est-il complètement sec ?", options: ["7 jours", "14 jours", "21 jours", "28 jours"], answer: "28 jours", hint: "Relis la troisième phrase." },
            { q: "Quelle est la plage de température idéale pour couler du béton ?", options: ["0°C à 20°C", "5°C à 30°C", "10°C à 35°C", "15°C à 40°C"], answer: "5°C à 30°C", hint: "C'est indiqué dans la dernière phrase." },
        ]
    }
];

const conjugaisonQuestions = [
    { q: "Conjugue 'être' au présent : Nous ___", options: ["somme", "sommes", "somes", "êtres"], answer: "sommes", hint: "Être au présent : je suis, tu es, il est, nous sommes, vous êtes, ils sont." },
    { q: "Conjugue 'avoir' au présent : Ils ___", options: ["on", "ont", "ons", "avons"], answer: "ont", hint: "Avoir au présent : j'ai, tu as, il a, nous avons, vous avez, ils ont." },
    { q: "Conjugue 'finir' au passé composé : J'ai ___", options: ["fini", "finis", "finit", "finié"], answer: "fini", hint: "Le participe passé de 'finir' est 'fini'." },
    { q: "Conjugue 'prendre' au futur : Tu ___", options: ["prendras", "prenderas", "prendera", "prendra"], answer: "prendras", hint: "Futur de 'prendre' : je prendrai, tu prendras, il prendra..." },
    { q: "Conjugue 'aller' à l'imparfait : Nous ___", options: ["allons", "allions", "alions", "allais"], answer: "allions", hint: "Imparfait de 'aller' : j'allais, tu allais, il allait, nous allions..." },
    { q: "Conjugue 'voir' au passé composé : Elle a ___", options: ["vu", "vue", "vut", "voiré"], answer: "vu", hint: "Le participe passé de 'voir' est 'vu'." },
    { q: "Conjugue 'faire' au présent : Vous ___", options: ["faisez", "faites", "faîtes", "faitez"], answer: "faites", hint: "Faire au présent : je fais, tu fais, il fait, nous faisons, vous faites, ils font." },
    { q: "Conjugue 'pouvoir' au conditionnel : Je ___", options: ["pourrais", "pourais", "pouvais", "peux"], answer: "pourrais", hint: "Conditionnel de 'pouvoir' : je pourrais (deux 'r')." },
    { q: "Conjugue 'venir' au passé composé : Ils sont ___", options: ["venu", "venus", "venuts", "venir"], answer: "venus", hint: "Avec 'être', le participe passé s'accorde avec le sujet. 'Ils' = masculin pluriel → venus." },
    { q: "Conjugue 'devoir' au futur : Nous ___", options: ["devrons", "devons", "devrons", "deverons"], answer: "devrons", hint: "Futur de 'devoir' : je devrai, tu devras, il devra, nous devrons..." },
    { q: "Conjugue 'savoir' au subjonctif présent : Il faut que tu ___", options: ["sais", "saches", "saches", "saves"], answer: "saches", hint: "Subjonctif de 'savoir' : que je sache, que tu saches..." },
    { q: "Conjugue 'mettre' au passé composé : J'ai ___", options: ["mis", "mit", "mettré", "mettu"], answer: "mis", hint: "Le participe passé de 'mettre' est 'mis'." },
];

function generateOrthographe() {
    const q = orthographeQuestions[randomInt(0, orthographeQuestions.length - 1)];
    const shuffled = [...q.options].sort(() => Math.random() - 0.5);
    return {
        question: q.q,
        options: shuffled,
        answer: q.answer,
        hint: q.hint,
        category: 'francais',
        categoryLabel: 'Français',
        subcategory: 'orthographe',
        type: 'multiple_choice'
    };
}

function generateConjugaison() {
    const q = conjugaisonQuestions[randomInt(0, conjugaisonQuestions.length - 1)];
    const shuffled = [...q.options].sort(() => Math.random() - 0.5);
    return {
        question: q.q,
        options: shuffled,
        answer: q.answer,
        hint: q.hint,
        category: 'francais',
        categoryLabel: 'Français',
        subcategory: 'conjugaison',
        type: 'multiple_choice'
    };
}

function generateComprehension() {
    const texte = comprehensionTextes[randomInt(0, comprehensionTextes.length - 1)];
    const questionData = texte.questions[randomInt(0, texte.questions.length - 1)];
    const shuffled = [...questionData.options].sort(() => Math.random() - 0.5);
    
    return {
        question: `📖 Lis le texte suivant :\n\n"${texte.texte}"\n\n${questionData.q}`,
        options: shuffled,
        answer: questionData.answer,
        hint: questionData.hint,
        category: 'francais',
        categoryLabel: 'Français',
        subcategory: 'comprehension',
        type: 'multiple_choice'
    };
}

function generate(difficulty = 3) {
    const generators = [generateOrthographe, generateOrthographe, generateConjugaison, generateConjugaison, generateComprehension];
    return generators[randomInt(0, generators.length - 1)]();
}

module.exports = { generate };

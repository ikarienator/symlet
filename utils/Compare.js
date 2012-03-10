var
    list = [
        '.+', '+', '.-', '-', '*', '/', '^', 'call'
    ],
    funcs = [
        'sqrt', 'exp', 'log', 'sin', 'cos', 'tan', 'acos', 'asin', 'atan', 'sinc', 'sh', 'ch', 'th'
    ],
    opComplexity = {
        '.+': 2,
        '.-': 3,
        '+': 5,
        '-': 6,
        '*': 10,
        '/': 20,
        '^': 30
    },
    funcComplexity = {
        'exp': 1,
        'log': 2,
        'sqrt': 4,
        'sin': 10,
        'sinc': 11,
        'cos': 12,
        'sh': 13,
        'ch': 14,
        'th': 15,
        'sincD': 16,
        'tan': 17,
        'atan': 18,
        'asin': 20,
        'acos': 21
    };

function complexity (ast) {
    if (ast.complexity) {
        return ast.complexity;
    }
    if (ast[0] === 'num') {
        return ast.complexity = 1;
    } else if (ast[0] === 'ident') {
        return ast.complexity = 2;
    } else if (ast[0] == 'call') {
        return ast.complexity = funcComplexity[ast[1]] + complexity(ast[2]);
    }
    var c = opComplexity[ast[0]], m = 1;
    for (var i = 1; i < ast.length; i++) {
        c += complexity(ast[i]) * m;
        m /= 1.1;
    }
    return ast.complexity = c;
}

function astComp (ast1, ast2) {
    if (complexity(ast1) < complexity(ast2)) return -1;
    if (ast2.complexity < ast1.complexity) return 1;
    if (ast1[0] != ast2[0]) {
        for (var i = 0; i < list.length; i++) {
            if (ast1[0] == list[i]) return -1;
            if (ast2[0] == list[i]) return 1;
        }
    }
    if (ast1[0] === 'call') {
        if (ast1[1] != ast2[1]) {
            for (var i = 0; i < funcs.length; i++) {
                if (ast1[1] == funcs[i]) return -1;
                if (ast2[1] == funcs[i]) return 1;
            }
        }
    } else if (ast1[0] === 'ident' || ast1[0] === 'num') {
        if (ast1[1] < ast2[1]) return -1;
        if (ast1[1] > ast2[1]) return 1;
        return 0;
    } else {
        var comp = astComp(ast1[1], ast2[1]);
        if (comp) {
            return comp;
        }
    }
    for (var i = 2; i < ast1.length; i++) {
        var comp = astComp(ast1[i], ast2[i]);
        if (comp) {
            return comp;
        }
    }
    return 0;
}
function isNumber (x) {
    return Object.prototype.toString.call(x) === '[object Number]';
}

function isInf (x) {
    return x === 'inf' || x === '+inf' || x === '-inf';
}

function isFiniteNumber (x) {
    return Object.prototype.toString.call(x) === '[object Number]' && isFinite(x);
}
function testPositive (ast, va, value) {

}

function testFinite (ast, va, value) {

}

function neg (inf) {
    if (isFiniteNumber(inf)) {
        return -inf;
    } else {
        return neg.list[inf];
    }
}
neg.list = {
    'inf': 'inf',
    '+inf': '-inf',
    '-inf': '+inf',
    'finite': 'finite'
};


/**
 * @returns number || 'inf' || '+inf' || '-inf' || 'finite'
 */
function limit (ast, va, value, depth, limitCache) {
    limitCache = limitCache || {};
//    if (limitCache[cache.find(ast)]) {
//        return limitCache[cache.find(ast)];
//    }
//    limitCache[cache.find(ast)] =
    return doLimit(ast, va, value, depth, limitCache);
}

function doLimit (ast, va, value, depth, limitCache) {
    if (depth > 10) {
        throw 'not concluded';
    }
    depth = depth || 0;
    switch (ast[0]) {
        case '.+':
            return limit(ast[1], va, value, depth, limitCache);
        case '.-':
            ast = limit(ast[1], va, value, depth, limitCache);
            switch (ast) {
                case 'inf':
                    return 'inf';
                case '+inf':
                    return '-inf';
                case '-inf':
                    return '+inf';
                case 'finite':
                    return 'finite';
                default:
                    return -ast;
            }
        case '+':
            var ast1 = limit(ast[1], va, value, depth, limitCache),
                ast2 = limit(ast[2], va, value, depth, limitCache);
            if (isFiniteNumber(ast1) && isFiniteNumber(ast2)) {
                return ast1 + ast2;
            } else if (ast1 === '+inf' && ast2 === '-inf') {
                ast1 = limit(['/', ['call', 'log', ast[1]], ['call', 'log', ['.-', ast[2]]]], va, value, depth + 1, limitCache);
                if (isFiniteNumber(ast1)) {
                    return Math.log(ast1);
                }
            } else if (ast1 === '-inf' && ast2 === '+inf') {
                ast1 = limit(['/', ['call', 'log', ast[2]], ['call', 'log', ['.-', ast[1]]]], va, value, depth + 1, limitCache);
                if (isFiniteNumber(ast1)) {
                    return Math.log(ast1);
                }
            } else if (ast1 === 'inf' && ast2 === 'inf') {
                ast1 = limit(['*', simplify(['call', 'log', ast[2]]), simplify(['call', 'log', ast[1]])], va, value, depth + 1, limitCache);
                if (isFiniteNumber(ast1)) {
                    return Math.log(ast1);
                }
            } else if (ast1 === ast2 && (ast1 === '+inf' || ast1 === '-inf')) {
                return ast1;
            } else if (ast1 === '+inf' || ast2 === '+inf') {
                return '+inf';
            } else if (ast1 === '-inf' || ast2 === '-inf') {
                return '-inf';
            } else {
                return 'finite';
            }
        case '-':
            return limit(['+', ast[1], ['.-', ast[2]]], va, value, depth, limitCache);
        case '*':
            var ast1 = limit(ast[1], va, value, depth, limitCache),
                ast2 = limit(ast[2], va, value, depth, limitCache);
            if (ast1 === 0) {
                if (isInf(ast2)) {
                    return limit(['/', ast[1], simplify(['/', ['num', 1], ast[2]])], va, value, depth + 1);
                } else {
                    return 0;
                }
            } else if (isFiniteNumber(ast1)) {
                if (isInf(ast2)) {
                    if (ast1 > 0) {
                        return ast2;
                    } else {
                        return neg(ast2);
                    }
                } else if (ast2 === 'finite') {
                    return 'finite';
                } else {
                    return ast1 * ast2;
                }
            } else if (ast1 === 'finite') {
                if (ast2 === 0) {
                    return 0;
                } else if (isFiniteNumber(ast2)) {
                    return ast1;
                } else {
                    return 'inf'; // Separate this
                }
            } else {
                if (ast2 === 0) {
                    return limit(['/', ast[2], simplify(['/', ['num', 1], ast[1]])], va, value, depth + 1, limitCache);
                } else if (isFiniteNumber(ast2)) {
                    if (ast1 > 0) {
                        return ast2;
                    } else {
                        return neg(ast2);
                    }
                } else if (ast2 === 'finite') {
                    return 'inf'; // Separate this
                } else {
                    if (ast1 == 'inf' || ast2 == 'inf') {
                        return 'inf';
                    } else if (ast1 == '-inf' ^ ast2 == '-inf') {
                        return '-inf';
                    } else {
                        return '+inf';
                    }
                }
            }
        case '/':
            var ast1 = limit(simplify(ast[1]), va, value, depth, limitCache),
                ast2 = limit(simplify(ast[2]), va, value, depth, limitCache);
            if (isFiniteNumber(ast1) && isFiniteNumber(ast2)) {
                if (ast2 === 0) {
                    if (ast1 === 0) {
                        return limit(['/', simplify(derivExp(ast[1], va)), simplify(derivExp(ast[2], va))], va, value, depth + 1, limitCache);
                    } else {
                        return 'inf';
                    }
                } else {
                    return ast1 / ast2;
                }
            } else if (isInf(ast1)) {
                if (isInf(ast2)) {
                    return limit(['/', simplify(derivExp(['/', ['num', 1], ast[1]], va)), simplify(derivExp(['/', ['num', 1], ast[2]], va))], va, value, depth + 1, limitCache);
                } else if (isFiniteNumber(ast2)) {
                    if (ast2 === 0) {
                        return 'inf';
                    } else if (ast1 === 'inf') {
                        return 'inf';
                    } else if (ast2 > 0) {
                        return ast1;
                    } else {
                        return ast1 === '+inf' ? '-inf' : '+inf';
                    }
                } else {
                    return 'inf';
                }
            } else if (isFiniteNumber(ast1) || ast1 === 'finite') {
                if (isInf(ast2)) {
                    if (isFiniteNumber(ast1)) {
                        if (ast2 === 'inf') {
                            return 'inf';
                        } else if (ast1 > 0) {
                            return ast2;
                        } else {
                            return ast2 === '+inf' ? '-inf' : '+inf';
                        }
                    } else {
                        return 'inf';
                    }
                } else { // if (ast2 === 'finite')
                    return 'finite';
                }
            } else {
                throw 'how ?';
            }
        case '^' :
            var ast1 = limit(simplify(ast[1]), va, value, depth, limitCache),
                ast2 = limit(simplify(ast[2]), va, value, depth, limitCache);
            if (isFiniteNumber(ast1)) {
                if (isFiniteNumber(ast2)) {
                    if (ast1 === 1) {
                        return 1;
                    } else if (ast1 === 0 && ast2 === 0) {
                        return limit(['call', 'exp', ['*', ast[2], ['call', 'log', ast[1]]]], va, value, depth, limitCache);
                    } else if (ast1 < 0) {
                        var rat = toRational(ast2);
                        if (rat[0] % 2 === 0 || rat[1] % 2 === 0) {

                        }
                    }
                    return Math.pow(ast1, ast2);
                } else if (ast2 === 'finite') {
                    if (ast1 === 0) {
                        return 0;
                    } else if (ast1 === 1) {
                        return 1;
                    } else {
                        return 'finite';
                    }
                } else if (ast2 === '+inf') {
                    if (Math.abs(ast1) < 1) {
                        return 0;
                    } else if (ast1 === 1) {
                        return limit(['call', 'exp', ['*', ast[2], ['call', 'log', ast[1]]]], va, value, depth, limitCache);
                    } else if (ast1 > 1) {
                        return '+inf';
                    } else {
                        return 'inf';
                    }
                } else if (ast2 === '-inf') {
                    if (Math.abs(ast1) > 1) {
                        return 0;
                    } else if (ast1 === 1) {
                        return limit(['call', 'exp', ['*', ast[2], ['call', 'log', ast[1]]]], va, value, depth, limitCache);
                    } else if (ast1 > 0) {
                        return '+inf';
                    } else {
                        return 'inf';
                    }
                } else if (ast2 === 'inf') {
                    if (ast1 === 0) {
                        return 0;
                    }
                }
            } else {

            }
            return limit(['call', 'exp', ['*', ast[2], ['call', 'log', ast[1]]]], va, value, depth, limitCache);
        case 'num' :
            return ast[1];
        case 'ident' :
            return value;
        case 'call' :
            var ast2 = limit(simplify(ast[2]), va, value, depth, limitCache);
            if (isFiniteNumber(ast2)) {
                ast2 = evaluate(['call', ast[1], ['num', ast2]]);
                if (ast2 === Infinity) {
                    return '+inf';
                } else if (ast2 === -Infinity) {
                    return '-inf';
                } else if (ast2 === NaN) {
                    return 'inf';
                } else {
                    return ast2;
                }
            } else if (ast2 === '+inf') {
                return limit.pinfMap[ast[1]];
            } else if (ast2 === '-inf') {
                return limit.minfMap[ast[1]];
            } else if (ast2 === 'inf') {
                return limit.infMap[ast[1]];
            } else if (ast2 === 'finite') {
                return 'finite';
            }
        default:
            throw 'Malform ast';
    }
}

limit.pinfMap = {
    'sin': 'finite',
    'cos': 'finite',
    'tan': 'inf',
    'acos': 'inf',
    'asin': 'inf',
    'atan': Math.PI * 0.5,
    'sqrt': '+inf',
    'exp': '+inf',
    'log': '+inf',
    'sinc': 0,
    'sh': '+inf',
    'ch': '+inf',
    'th': '+inf'
};

limit.minfMap = {
    'sin': 'finite',
    'cos': 'finite',
    'tan': 'inf',
    'acos': 'inf',
    'asin': 'inf',
    'atan': -Math.PI * 0.5,
    'sqrt': '-inf',
    'exp': 0,
    'log': '-inf',
    'sinc': 0,
    'sh': '-inf',
    'ch': '+inf',
    'th': '-inf'
};

limit.infMap = {
    'sin': 'finite',
    'cos': 'finite',
    'tan': 'inf',
    'acos': 'inf',
    'asin': 'inf',
    'atan': 'finite',
    'sqrt': 'inf',
    'exp': 'inf',
    'log': 'inf',
    'sinc': 0,
    'sh': 'inf',
    'ch': '+inf',
    'th': 'inf'
}
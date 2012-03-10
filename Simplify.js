window.cache = new ASTCache();
var rules = [
    ['call', 'log', ['^', '#1', '#2']],
    ['*', ['call', 'log', '#1'], '#2']
];

var explodeCache = {},
    factorCache = {};

function simplifyFactor(ast) {
    if (factorCache[cache.find(ast)]) {
        return factorCache[cache.find(ast)];
    }
    return factorCache[cache.find(ast)] = doSimplifyFactor(ast);
}
function doSimplifyFactor(ast) {
    if (fixed(ast)) {
        return ['num', evaluate(ast)];
    }
    switch (ast[0]) {
        case '.+':
            return simplifyFactor(ast[1]);
        case '.-':
            while (ast[1][0] === '.-') {
                ast = ast[1][1];
            }
            return ['.-', simplifyFactor(ast[1])];
            break;
        case '+':
        case '-':
        case '*':
        case '/':
            // Simplfy only the factor
            return [ast[0], simplifyFactor(ast[1]), simplifyFactor(ast[2])];
        case '^':
            return [ast[0], simplifyFactor(ast[1]), simplifyFactor(ast[2])];
        case 'num':
            throw 'This is not going to happen';
        case 'ident':
            return ast;
        case 'call':
            var ast2 = simplify(ast[2]);
            switch (ast[1]) {
                case 'sqrt':
                    return simplifyFactor(['^', ast[2], ['num', 0.5]]);
                case 'log':
                    if (ast2[0] === '^') {
                        return ['*', ast2[2], simplifyFactor(['call', 'log', ast2[1]])];
                    } else if (ast2[0] === '*') {
                        return ['+', simplifyFactor(['call', 'log', ast2[2]]), simplifyFactor(['call', 'log', ast2[1]])];
                    } else if (ast2[0] === '/') {
                        return ['-', simplifyFactor(['call', 'log', ast2[2]]), simplifyFactor(['call', 'log', ast2[1]])];
                    } else {
                        return [ast[0], ast[1], ast2];
                    }
                case 'exp':
//                    return simplifyFactor(['^', ['num', Math.E], ast2]);
                    if (ast2[0] === '.-') {
                        return ['^', simplifyFactor(['call', 'exp', ast2[1]]), ['num', -1]];
                    } else if (ast2[0] === '+') {
                        return ['*', simplifyFactor(['call', 'exp', ast2[1]]), simplifyFactor(['call', 'exp', ast2[1]])];
                    } else if (ast2[0] === '-') {
                        return ['/', simplifyFactor(['call', 'exp', ast2[1]]), simplifyFactor(['call', 'exp', ast2[1]])];
                    } else if (ast2[0] === '*') {
                        return simplifyFactor(['^', ['call', 'exp', ast2[1]], ast2[2]]);
                    } else if (ast2[0] === 'call') {
                        if (ast2[1] === 'log') {
                            return simplifyFactor(ast2[2]);
                        }
                    } else {
                        return [ast[0], ast[1], ast2];
                    }
                default:
                    return [ast[0], ast[1], ast2];
            }

        default:
            throw 'Malform ast';
    }
}

function doExplode(ast) {
    var ast1, ast2;
    switch (ast[0]) {
        case '.+':
            return canonical(ast[1]);
        case '.-':
            ast = canonical(ast[1]);
            ast[0] = -ast[0];
            return ast;
        case 'num':
        case 'ident':
        case 'call':
            return [1, [1, ast]];
        case '+':
            ast1 = canonical(ast[1]);
            ast2 = canonical(ast[2]);
            return ast1.concat(ast2);
        case '-':
            ast1 = canonical(ast[1]).slice(0);
            ast2 = canonical(ast[2]);
            for (var i = 0; i < ast2.length; i += 2) {
                ast1.push(-ast2[i], ast2[i + 1]);
            }
            return ast1;
        case '*':
            ast1 = canonical(ast[1]);
            ast2 = canonical(ast[2]);
            var sum = [];
            for (var i = 0; i < ast1.length; i += 2) {
                var t0 = ast1[i],
                    t1 = ast1[i + 1];
                for (var j = 0; j < ast2.length; j += 2) {
                    sum.push(t0 * ast2[j], t1.concat(ast2[j + 1]));
                }
            }
            return sum;
        case '/':
            return canonical(['*', ast[1], ['^', ast[2], ['num', -1]]]);
        case '^':
            if (ast[2][0] === 'num') {
                var pow = ast[2][1], base = ast[1];
                while (base[0] === '^' && base[2][0] === 'num') {
                    pow *= ast[1][2][1];
                    base = base[1];
                }
                ast = [1, [pow, base]];
            } else {
                ast = [1, [1, ast]];
            }
            return ast;
        default:
            throw 'Malform ast';
    }
    return ast;
}

function canonical(ast) {
    var astId = cache.find(ast);
    if (explodeCache[astId]) {
        return explodeCache[astId];
    }
    return explodeCache[astId] = doExplode(ast);
}

function product(list) {
    if (list.length === 0) {
        return ['num', 1];
    }
    var negAll = true;
    for (var i = 0; i < list.length; i += 2) {
        if (list[i] > 0) {
            negAll = false;
            break;
        }
    }

    var result, term;
    for (var i = 0; i < list.length; i += 2) {
        if (list[i] === 0) {
            continue;
        }
        term = list[i + 1];
        if (negAll) {
            if (list[i] === -1) {
                result = result ? ['*', result, term] : term;
            } else {
                result = result ? ['*', result, ['^', term, ['num', -list[i]]]] : ['^', term, ['num', -list[i]]];
            }
        } else {
            if (list[i] === 1) {
                result = result ? ['*', result, term] : term;
            } else if (list[i] === -1 && result) {
                result = ['/', result, term];
            } else if (list[i] < 0 && result) {
                result = ['/', result, ['^', term, ['num', -list[i]]]];
            } else {
                result = result ? ['*', result, ['^', term, ['num', list[i]]]] : ['^', term, ['num', list[i]]];
            }
        }
    }
    if (negAll) {
        return result ? ['/', ['num', 1], result] : ['num', 1];
    } else {
        return result || ['num', 1];
    }

}

function summation(list) {
    if (list.length === 0) {
        return ['num', 0];
    }
    var negAll = true;
    for (var i = 0; i < list.length; i += 2) {
        if (list[i] > 0) {
            negAll = false;
            break;
        }
    }

    var result, term;
    for (var i = 0; i < list.length; i += 2) {
        if (list[i] === 0) {
            continue;
        }
        if (list[i + 1].length) {
            term = product(list[i + 1]);
            if (negAll) {
                if (list[i] === -1) {
                    result = result ? ['+', result, term] : term;
                } else {
                    result = result ? ['+', result, ['*', ['num', -list[i]], term]] : ['*', ['num', -list[i]], term];
                }
            } else {
                if (list[i] === 1) {
                    result = result ? ['+', result, term] : term;
                } else if (list[i] === -1 && result) {
                    result = ['-', result, term];
                } else if (list[i] < 0 && result) {
                    result = ['-', result, ['*', ['num', -list[i]], term]];
                } else {
                    result = result ? ['+', result, ['*', ['num', list[i]], term]] : ['*', ['num', list[i]], term];
                }
            }
        } else {
            if (negAll) {
                result = result ? ['+', result, ['num', -list[i]]] : ['num', -list[i]];
            } else {
                result = result ? ['+', result, ['num', list[i]]] : ['num', list[i]];
            }
        }
    }
    if (negAll) {
        return result ? ['.-', result] : ['num', 0];
    } else {
        return result || ['num', 0];
    }

}

function sort(list) {
    var unsortedRows = [], rowInd = [], result = [];
    for (var i = 0; i < list.length; i += 2) {
        var comp = 0, row = list[i + 1], indices = [];
        for (var j = 0; j < row.length; j += 2) {
            comp += complexity(row[j + 1]);
            indices[j / 2] = j / 2;
        }
        rowInd[i / 2] = i / 2;
        indices.sort(function(a, b) {
            var cmp = astComp(row[a * 2 + 1], row[b * 2 + 1]);
            if (cmp) return cmp;
            return Math.abs(Math.log(Math.abs(row[a * 2]))) - Math.abs(Math.log(Math.abs(row[b * 2])));
        });
        var resultRow = [];
        for (var j = 0; j < indices.length; j++) {
            resultRow.push(row[indices[j] * 2], row[indices[j] * 2 + 1]);
        }
        resultRow.comp = comp;
        unsortedRows.push(resultRow);
    }
    rowInd.sort(function(a, b) {
        if (unsortedRows[a].comp === unsortedRows[b].comp) {
            return Math.abs(list[a * 2]) - Math.abs(list[b * 2]);
        } else {
            return unsortedRows[a].comp - unsortedRows[b].comp;
        }
    });
    for (var i = 0; i < rowInd.length; i++) {
        result.push(list[rowInd[i] * 2], unsortedRows[rowInd[i]]);
    }
    return result;
}

function deform(ast) {

}

function mergeConstant(list) {
    var constant = 1;
    for (var i = 0; i < list.length; i += 2) {
        if (list[i] === 0) {
            continue;
        } else {
            if (list[i + 1][0] === 'num') {
                constant *= Math.pow(list[i + 1][1], list[i]);
            } else {
                break;
            }
        }
    }
    return [1, ['num', constant]].concat(list.slice(i));
}

function optTerm(list) {
    if (list.length === 0) {
        return [];
    }
    list = mergeConstant(list);
    var curr, last = simplifyFactor(list[1]), lastAst = cache.find(last), pow = list[0], result = [];
    for (var i = 2; i < list.length; i += 2) {
        while (i < list.length) {
            curr = simplifyFactor(list[i + 1]);
            if (lastAst != cache.find(curr)) {
                break;
            }
            pow += list[i];
            i += 2;
        }
        if (pow != 0) {
            result.push(pow, last);
            pow = 0;
        }
        if (i < list.length) {
            pow = list[i];
            last = curr;
            lastAst = cache.find(last);
        }
    }
    if (pow != 0) {
        result.push(pow, last);
    }
    return result;
}

function termId(term) {
    var result = [];
    for (var i = 0; i < term.length; i += 2) {
        result.push(term[i]);
        result.push(cache.find(term[i + 1]));
    }
    return result.join(',');
}

function optCanonical(list) {
    if (list.length === 0) {
        return [];
    }
    var curr, currCoeff,
        last = optTerm(list[1]), coeff = list[0];
    if (last [0] === 1 && last[1][0] === 'num') {
        coeff *= last[1][1];
        last = last.slice(2);
    }
    var lastAst = termId(last), result = [];
    for (var i = 2; i < list.length; i += 2) {
        while (i < list.length) {
            curr = optTerm(list[i + 1]), currCoeff = list[i];
            if (curr[0] === 1 && curr[1][0] === 'num') {
                currCoeff *= curr[1][1];
                curr = curr.slice(2);
            }
            if (lastAst != termId(curr)) {
                break;
            }
            coeff += currCoeff;
            i += 2;
        }
        if (coeff !== 0) {
            result.push(coeff, last);
            coeff = 0;
        }
        if (i < list.length) {
            coeff = currCoeff;
            last = curr;
            lastAst = termId(last);
        }
    }
    if (coeff != 0) {
        result.push(coeff, last);
    }
    return result;
}

factorize = function(ast) {

}

simplify = function(ast) {
    var oldAst = ast;
    ast = simplifyFactor(ast);
    ast = canonical(ast);
    ast = sort(ast);
    ast = optCanonical(ast);
    ast = summation(ast);
    cache.join(oldAst, ast);
    return ast;
}
/**
 * Simplify
 */
(function() {
    var simplify;
    function complexity(ast) {
        if (ast.complexity) {
            return ast.complexity;
        }
        if (ast[0] == 'num') {
            return 1;
        }
        var c = 2;
        for (var i = 1; i < ast.length; i++) {
            c += complexity(ast[i]);
        }
        return ast.complexity = c;
    }

    function fixed(ast) {
        if (ast[0] == 'ident') {
            return !(ast[1] == 'x' || ast[1] == 'y' || ast[1] == 't');
        }
        for (var i = 1; i < ast.length; i++) {
            if (!fixed(ast[i])) {
                return false;
            }
        }
        return true;
    }

    function evaluate(ast) {
        switch (ast[0]) {
            case 'ident' :
                if (ast[1] == 'PI') {
                    return 3.141592653589793;
                } else if (ast[1] == 'E') {
                    return 2.718281828459045;
                } else {
                    return NaN;
                }
            case 'num':
                return ast[1];
            case '.+':
                return evaluate(ast[1]);
            case '.-':
                return -evaluate(ast[1]);
            case '+':
                return evaluate(ast[1]) + evaluate(ast[2]);
            case '-':
                return evaluate(ast[1]) - evaluate(ast[2]);
            case '*':
                return evaluate(ast[1]) * evaluate(ast[2]);
            case '/':
                return evaluate(ast[1]) / evaluate(ast[2]);
            case '^':
                return Math.pow(evaluate(ast[1]), evaluate(ast[2]));
            case 'call':
                var arg = evaluate(ast[2]);
                switch (ast[1]) {
                    case 'sin':
                        return Math.sin(arg);
                    case 'cos':
                        return Math.cos(arg);
                    case 'tan':
                        return Math.tan(arg);
                    case 'acos':
                        return Math.acos(arg);
                    case 'asin':
                        return Math.asin(arg);
                    case 'atan':
                        return Math.atan(arg);
                    case 'sqrt':
                        return Math.sqrt(arg);
                    case 'exp':
                        return Math.exp(arg);
                    case 'log':
                        return Math.log(arg);
                    case 'sinc':
                        if (arg == 0) return 1;
                        return Math.sin(arg) / arg;
                    case 'sincD':
                        if (arg == 0) return 0;
                        return Math.cos(arg) / arg - Math.sin(arg) / (arg * arg);
                    case 'sh':
                        var exp = Math.exp(arg);
                        return (exp - 1 / exp) / 2;
                    case 'ch':
                        var exp = Math.exp(arg);
                        return (exp + 1 / exp) / 2;
                    case 'th':
                        var exp = Math.exp(2 * arg);
                        return 1 - 2 / (exp + 1);
                }
        }
    }

    function expand(ast, flip) {
        if (ast[0] == '+') {
            return expand(ast[1], flip).concat(expand(ast[2], flip));
        } else if (ast[0] == '-') {
            return expand(ast[1], flip).concat(expand(ast[2], !flip));
        } else if (ast[0] == '.+') {
            return expand(ast[1], flip);
        } else if (ast[1] == '.-') {
            return expand(ast[1], !flip);
        } else {
            if (flip) {
                return [
                    ['.-', ast]
                ];
            } else {
                return [ast];
            }
        }
    }

    function summation(list) {
        if (list.length == 0) {
            return ['num', 0];
        }
        var result = list[0];
        for (var i = 1; i < list.length; i++) {
            if (list[i][0] == '.-') {
                result = ['-', result, list[i][1]];
            } else {
                result = ['+', result, list[i]];
            }

        }
        return result;
    }

    function factorize(ast, flip) {
        if (ast[0] == '.-') {
            var list = factorize(ast[1], flip);
            list[0] = ['.-', list[0]];
            return list;
        }
        if (ast[0] == '*') {
            return factorize(ast[1], false).concat(factorize(ast[2], false));
        } else if (ast[0] == '/') {
            return factorize(ast[1], false).concat(factorize(ast[2], true));
        } else {
            if (flip) {
                if (ast[0] == '^') {
                    [
                        ['^', ast[1], ['num', -ast[2]]]
                    ]
                }
                return [
                    ['^', ast, ['num', -1]]
                ];
            } else {
                return [ast];
            }
        }
    }

    function connect(list) {
        if (list.length == 0) {
            return ['num', 1];
        }
        var result = list[0];
        for (var i = 1; i < list.length; i++) {
            if (list[i][0] == '^' && list[i][2][0] == 'num') {
                if (list[i][2][1] == -1) {
                    result = ['/', result, list[i][1]];
                } else if (list[i][2][1] < 0) {
                    result = ['/', result, ['^', list[i][1], ['num', -list[i][2][1]]]];
                } else {
                    result = ['*', result, list[i]];
                }
            } else {
                result = ['*', result, list[i]];
            }
        }
        return result;
    }

    function simplifyFactor(ast) {
        if (fixed(ast)) {
            return ['num', evaluate(ast)];
        }
        if (ast[0] == 'ident') {
            return ast;
        }
        if (ast[0] == '+' || ast[0] == '-') {
            ast = simplify(ast);
        }
        while (ast[0] == '.+') {
            ast = ast[1];
        }
        while (ast[0] == '.-' && ast[1][0] == '.-') {
            ast = ast[1][1];
        }
        if (ast[0] == '.-' && ast[1][0] == 'num') {
            ast = ['num', -ast[1][1]];
        }
        if (ast[0] == '^') {
            if (ast[1][0] == 'ident' && ast[1][1] == 'E') {
                return ['call', 'exp', ast[2]];
            }
            ast = ['^', simplify(ast[1]), simplify(ast[2])];
            if (ast[1][0] == 'num') {
                if (ast[1][1] == 0) {
                    return ['num', 0];
                } else if (ast[1][1] == 1) {
                    return ['num', 1];
                }
            }
            if (ast[2][0] == 'num') {
                if (ast[2][1] == 0) {
                    return ['num', 1];
                } else if (ast[2][1] == 1) {
                    ast = ast[1];
                }
                if (ast[1][0] == '.-') {
                    if (Math.floor(ast[2][1]) == ast[2][1]) {
                        if (ast[2][1] % 2 == 1) {
                            ast = ['.-', ['^', ast[1][1], ast[2]]];
                        } else {
                            ast = ['^', ast[1][1], ast[2]];
                        }
                    }
                }
            }
        }
        if (ast[0] == 'call') {
            var arg = ast[2],
                simp = simplify(arg);
            if (complexity(simp) < complexity(arg)) {
                ast = ['call', ast[1], simp];
            }
            if (ast[1] == 'log') {
                if (ast[2][0] == '^') {
                    ast = ['*', ast[2][2], ['call', 'log', ast[2][1]]];
                }
            }
            return ast;
        }

        return ast;
    }

    function simplifyTerm(ast) {
        var newFactor;
        do {
            if (fixed(ast)) {
                return ['num', evaluate(ast)];
            }
            newFactor = false;
            var list = factorize(ast, false);
            if (list.length > 1) {
                for (var i = 0, j = 0; i < list.length; i++) {
                    list[i] = simplifyFactor(list[i]);
                    if (list[i][0] == '*' || list[i][0] == '/') {
                        newFactor = true;
                    }
                    if (list[i][0] == 'num') {
                        if (list[i][1] === 0) {
                            return ['num', 0];
                        }
                        else if (list[i][1] != 1) {
                            list[j++] = list[i];
                        }
                    } else {
                        list[j++] = list[i];
                    }
                }
                if (j == 0) {
                    return ['num', 1];
                }
                list.length = j;
            } else {
                ast = simplifyFactor(list[0]);
                if (ast[0] == '*' || ast[0] == '/') {
                    newFactor = true;
                    continue;
                }
            }
            if (list.length > 1) {
                var value = 1;
                for (var i = 0; i < list.length; i++) {
                    if (list[i][0] == '.-') {
                        value = -value;
                        list[i] = list[i][1];
                    }
                }
                list.sort(function(a, b) {
                    return complexity(a) - complexity(b);
                });
                for (var i = 0; i < list.length; i++) {
                    if (list[i][0] == 'num') {
                        value *= list[i][1];
                    } else {
                        break;
                    }
                }
                if (i || value != 1) {
                    list.splice(0, i);
                    ast = connect(list)
                    if (value != 1) {
                        if (value == 0) {
                            return ['num', 0];
                        } else if (value == -1) {
                            ast = ['.-', ast];
                        } else if (value > 0) {
                            ast = ['*', ['num', value], ast];
                        } else {
                            ast = ['.-', ['*', ['num', -value], ast]];
                        }
                    }
                } else {
                    ast = connect(list);
                }
            } else {
                ast = simplifyFactor(list[0]);
                if (ast[0] == '*' || ast[0] == '/') {
                    newFactor = true;
                }
            }
        } while (newFactor);
        return ast;
    }

    window.simplifyExp = simplify = function(ast) {
        if (fixed(ast)) {
            return ['num', evaluate(ast)];
        }
        var list = expand(ast);
        if (list.length > 1) {
            for (var i = 0, j = 0; i < list.length; i++) {
                list[i] = simplifyTerm(list[i]);
                if (list[i][0] != 'num' || list[i][1] != 0) {
                    list[j++] = list[i];
                }
            }
            if (j == 0) {
                return ['num', 0];
            }
            list.length = j;
        } else {
            return simplifyTerm(list[0]);
        }
        if (list.length > 1) {
            list.sort(function(a, b) {
                return complexity(a) - complexity(b);
            });
            var value = 0;
            for (var i = 0; i < list.length; i++) {
                if (list[i][0] == 'num') {
                    value += list[i][1];
                } else {
                    break;
                }
            }
            if (i) {
                if (value == 0) {
                    list.splice(0, i);
                } else {
                    list.splice(0, i, ['num', value]);
                }
            }
            return summation(list);
        } else {
            return simplifyTerm(list[0]);
        }
    }
})();

/**
 * Derivative
 */
(function () {
    var deriv;

    function deriveFunc (func, arg, va) {
        switch (func) {
            case 'sin':
                return ['call', 'cos', arg];
            case 'cos':
                return ['.-', ['call', 'sin', arg]];
            case 'tan':
                return ['/', ['num', 1], ['*', ['call', 'cos', arg], ['call', 'cos', arg]]];
            case 'acos':
                return ['.-', ['/', ['num', 1], ['call', 'sqrt', ['-', ['num', 1], ['^', arg, 2]]]]];
            case 'asin':
                return ['/', ['num', 1], ['call', 'sqrt', ['-', ['num', 1], ['^', arg, 2]]]];
            case 'atan':
                return ['/', ['num', 1], ['+', ['num', 1], ['^', arg, ['num', 2]]]];
            case 'sqrt':
                return ['/', ['num', 0.5], ['call', 'sqrt', arg]];
            case 'exp':
                return ['call', 'exp', arg];
            case 'log':
                return ['/', ['num', 1], arg];
            case 'sinc':
                return deriv(['/', ['call', 'sin', arg], arg], va);
            case 'sh':
                return ['call', 'ch', arg];
            case 'ch':
                return ['call', 'sh', arg];
            case 'th':
                return ['/', ['num', 1], ['*', ['call', 'ch', arg], ['call', 'ch', arg]]];
        }
    }

    window.derivExp = deriv = function (ast, va) {
        if (ast[0] === '.+' || ast[0] === '.-') {
            return [ast[0], deriv(ast[1], va)];
        } else if (ast[0] == '+' || ast[0] == '-') {
            return [ast[0], deriv(ast[1], va), deriv(ast[2], va)];
        } else if (ast[0] == '*') {
            return ['+', ['*', deriv(ast[1], va), ast[2]], ['*', ast[1], deriv(ast[2], va)]];
        } else if (ast[0] == '/') {
            return ['-', ['/', deriv(ast[1], va), ast[2]], ['*', ast, ['/', deriv(ast[2], va), ast[2]]]];
        } else if (ast[0] == '^') {
            if (ast[2][0] == 'num') {
                return ['*', ['*', ast[2], ['^', ast[1], ['-', ast[2], ['num', 1]]]], deriv(ast[1], va)];
            } else {
                return ['*', ast, ['+', ['*', ast[2], ['/', deriv(ast[1], va) , ast[1]]], ['*', ['call', 'log', ast[1]], deriv(ast[2], va)]]];
            }
        } else if (ast[0] == 'num') {
            return ['num', 0];
        } else if (ast[0] == 'ident') {
            return ['num', ast[1] == va ? 1 : 0];
        } else if (ast[0] == 'call') {
            return ['*', deriveFunc(ast[1], ast[2], va), deriv(ast[2], va)]
        }
    }
})();
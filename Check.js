/**
 * Checking
 */
(function () {
    var
        functionList = [
            'sin', 'cos', 'tan', 'acos', 'asin', 'atan', 'sqrt', 'exp', 'log', 'sinc', 'sh', 'ch', 'th'
        ],
        varList = [
            'x', 'y', 't'
        ],
        constList = [
            'E', 'PI'
        ];

    function expr (ast) {
        switch (ast[0]) {
            case '.+':
            case '.-':
                if (ast.length === 2) {
                    expr(ast[1]);
                } else {
                    throw 'Malform ast';
                }
                break;
            case '+':
            case '-':
            case '*':
            case '/':
            case '^':
                if (ast.length === 3) {
                    expr(ast[1]);
                    expr(ast[2]);
                } else {
                    throw 'Malform ast';
                }
                break;
            case 'num':
                if (ast.length !== 2 || isNaN(ast[1])) {
                    throw 'Malform ast';
                }
                break;
            case 'ident':
                if (ast.length !== 2) {
                    throw 'Malform ast';
                }
                for (var i in varList) {
                    if (varList[i] === ast[1]) {
                        return;
                    }
                }
                for (var i in constList) {
                    if (constList[i] === ast[1]) {
                        return;
                    }
                }
                throw 'Unknown identifier "' + ast[1] + '"';
                break;
            case 'call':
                if (ast.length !== 3) {
                    throw 'Malform ast';
                }
                for (var i in functionList) {
                    if (functionList[i] === ast[1]) {
                        return expr(ast[2]);
                    }
                }
                throw 'Unknown function "' + ast[1] + '"';
            default:
                throw 'Malform ast';
        }
    }

    window.checkExp = function (ast) {
        expr(ast);
    }
})();
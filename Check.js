
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

    function expr(ast) {
        if (ast[0] === '.+' || ast[0] === '.-') {
            if (ast.length === 2) {
                expr(ast[1]);
            } else {
                throw 'Malform ast';
            }
        } else if (ast[0] === '+' || ast[0] === '-' || ast[0] === '*' || ast[0] === '/' || ast[0] === '^') {
            if (ast.length === 3) {
                expr(ast[1]);
                expr(ast[2]);
            } else {
                throw 'Malform ast';
            }
        } else if (ast[0] === 'num') {
            if (ast.length !== 2 || isNaN(ast[1])) {
                throw 'Malform ast';
            }
        } else if (ast[0] === 'ident') {
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
        } else if (ast[0] === 'call') {
            if (ast.length !== 3) {
                throw 'Malform ast';
            }
            for (var i in functionList) {
                if (functionList[i] === ast[1]) {
                    return expr(ast[2]);
                }
            }
            throw 'Unknown function "' + ast[1] + '"';
        }
    }

    window.checkExp = function (ast) {
        expr(ast);
    }
})();
function fixed (ast) {
    if (ast[0] === 'ident') {
        return !(ast[1] === 'x' || ast[1] === 'y' || ast[1] === 't');
    }
    for (var i = 1; i < ast.length; i++) {
        if (!fixed(ast[i])) {
            return false;
        }
    }
    return true;
}

function evaluate (ast) {
    switch (ast[0]) {
        case 'ident' :
            if (ast[1] === 'PI') {
                return 3.141592653589793;
            } else if (ast[1] === 'E') {
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
                    if (arg === 0) return 1;
                    return Math.sin(arg) / arg;
                case 'sincD':
                    if (arg === 0) return 0;
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
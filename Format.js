/**
 * Formating
 */
(function () {
    var displayName = {
        'acos': '\\cos^{-1}',
        'asin': '\\sin^{-1}',
        'atan': '\\tan^{-1}',
        'sh': '\\operatorname{sh}',
        'ch': '\\operatorname{ch}',
        'th': '\\operatorname{th}',
        'sh': '\\operatorname{sh}',
        'sinc': '\\operatorname{sinc}',
        'sincD': '\\operatorname{sinc}\'',
        'log': '\\ln'
    };

    window.formatExp = function format (ast, type) {
        if (ast[0] === '.+' || ast[0] === '.-') {
            if (ast[1][0] == '+' || ast[1][0] == '-') {
                if (type == 'latex') {
                    return '\\' + ast[0][1] + '(' + format(ast[1], type) + ')';
                } else {
                    return ast[0][1] + '(' + format(ast[1], type) + ')';
                }
            } else {
                return ast[0][1] + format(ast[1], type);
            }
        } else if (ast[0] == '+') {
            return format(ast[1], type) + ' + ' + format(ast[2], type);
        } else if (ast[0] == '-') {
            if (ast[2][0] == '+' || ast[2][0] == '-') {
                return format(ast[1], type) + ' - (' + format(ast[2], type) + ')';
            } else {
                return format(ast[1], type) + ' - ' + format(ast[2], type);
            }
        } else if (ast[0] == '*') {
            if (type) {
                if (ast[1][0] == 'num' && (ast[2][0] == 'ident' || ast[2][0] == 'call' || ast[2][0] == '^')) {
                    return format(ast[1], type) + ' ' + format(ast[2], type);
                }
            }
            var part1 = (ast[1][0] == '+' || ast[1][0] == '-') ? '(' + format(ast[1], type) + ')' : format(ast[1], type),
                part2 = (ast[2][0] == '+' || ast[2][0] == '-') ? '(' + format(ast[2], type) + ')' : format(ast[2], type);
            if (type) {
                return part1 + '  \\cdot ' + part2;
            } else {
                return part1 + ' * ' + part2;
            }
        } else if (ast[0] == '/') {
            if ((ast[1][0] == '+' || ast[1][0] == '-') ||
                (ast[2][0] == '+' || ast[2][0] == '-' || ast[2][0] == '*' || ast[2][0] == '/')) {
                return '\\frac{' + format(ast[1], type) + '}{' + format(ast[2], type) + '}';
            }
            return format(ast[1], type) + ' / ' + format(ast[2], type);
        } else if (ast[0] == '^') {
            var part1 = (ast[1][0] == 'call' && ast[1][1] != 'sqrt' || ast[1][0] == '.+' || ast[1][0] == '.-' || ast[1][0] == '+' || ast[1][0] == '-' || ast[1][0] == '*' || ast[1][0] == '/' || ast[1][0] == '^') ? '(' + format(ast[1], type) + ')' : format(ast[1], type),
                part2 = format(ast[2], type);
            if (type) {
                return part1 + '^{' + part2 + '}';
            } else {
                return 'pow(' + part1 + ',' + part2 + ')';
            }
        } else if (ast[0] == 'ident') {
            if (type == 'latex') {
                if (ast[1] == 'PI') {
                    return '\PI';
                } else if (ast[1] == 'E') {
                    return '\E';
                }
            }
            return ast[1];
        } else if (ast[0] == 'num') {
            return ast[1];
        } else if (ast[0] == 'call') {
            if (type == 'latex') {
                if (ast[1] == 'exp') {
                    return 'e^{' + format(ast[2], type) + '}';
                } else if (ast[1] == 'sqrt') {
                    return '\\sqrt{' + format(ast[2], type) + '}';
                } else {
                    return (displayName[ast[1]] || '\\' + ast[1] ) + ' ' +
                        (ast[2][0] == 'ident' || ast[2][0] == 'num' || ast[2][0] == 'call' || ast[2][0] == '^' ? format(ast[2], type) : '(' + format(ast[2], type) + ')');
                }
            }
            return ast[1] + '(' + format(ast[2], type) + ')';
        }
    }
})();

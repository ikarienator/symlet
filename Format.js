/**
 * Formating
 */
(function() {
    var displayName = {
        'acos': 'cos<sup>-1</sup>',
        'asin': 'sin<sup>-1</sup>',
        'atan': 'tan<sup>-1</sup>',
        'log': 'ln'
    };

    var ots = Array.prototype.toString;
    Array.prototype.toString = function() {
        try {
            checkExp(this);
            return formatExp(this)
        } catch (e) {
            return ots.call(this);
        }
    }

    window.formatExp = function format(ast, screen) {
        if (ast[0] === '.+' || ast[0] === '.-') {
            if (ast[1][0] == '+' || ast[1][0] == '-') {
                return ast[0][1] + '(' + format(ast[1], screen) + ')';
            } else {
                return ast[0][1] + format(ast[1], screen);
            }
        } else if (ast[0] == '+') {
            return format(ast[1], screen) + ' + ' + format(ast[2], screen);
        } else if (ast[0] == '-') {
            if (ast[2][0] == '+' || ast[2][0] == '-') {
                return format(ast[1], screen) + ' - (' + format(ast[2], screen) + ')';
            } else {
                return format(ast[1], screen) + ' - ' + format(ast[2], screen);
            }
        } else if (ast[0] == '*') {
            if (screen) {
                if (ast[1][0] == 'num' && (ast[2][0] == 'ident' || ast[2][0] == 'call' || ast[2][0] == '^')) {
                    return format(ast[1], screen) + ' ' + format(ast[2], screen);
                }
            }
            var part1 = (ast[1][0] == '+' || ast[1][0] == '-') ? '(' + format(ast[1], screen) + ')' : format(ast[1], screen),
                part2 = (ast[2][0] == '+' || ast[2][0] == '-') ? '(' + format(ast[2], screen) + ')' : format(ast[2], screen);
            if (screen) {
                return part1 + ' &middot; ' + part2;
            } else {
                return part1 + ' * ' + part2;
            }
        } else if (ast[0] == '/') {
            var part1 = (ast[1][0] == '+' || ast[1][0] == '-') ? '(' + format(ast[1], screen) + ')' : format(ast[1], screen),
                part2 = (ast[2][0] == '+' || ast[2][0] == '-' || ast[2][0] == '*' || ast[2][0] == '/') ? '(' + format(ast[2], screen) + ')' : format(ast[2], screen);
            return part1 + ' / ' + part2;
        } else if (ast[0] == '^') {
            var part1 = (ast[1][0] == 'call' && ast[1][1] != 'sqrt' || ast[1][0] == '.+' || ast[1][0] == '.-' || ast[1][0] == '+' || ast[1][0] == '-' || ast[1][0] == '*' || ast[1][0] == '/' || ast[1][0] == '^') ? '(' + format(ast[1], screen) + ')' : format(ast[1], screen),
                part2 = format(ast[2], screen);
            if (screen) {
                return part1 + '<sup>' + part2 + '</sup>';
            } else {
                return 'pow(' + part1 + ',' + part2 + ')';
            }
        } else if (ast[0] == 'ident') {
            if (screen) {
                if (ast[1] == 'PI') {
                    return '<i>π</i>';
                } else if (ast[1] == 'E') {
                    return '<i>e</i>';
                }
                return '<i>' + ast[1] + '</i>';
            }
            return ast[1];
        } else if (ast[0] == 'num') {
            return ast[1];
        } else if (ast[0] == 'call') {
            if (screen) {
                if (ast[1] == 'exp') {
                    return '<i>e</i><sup>' + format(ast[2], screen) + '</sup>';
                } else if (ast[1] == 'sqrt') {
                    return '√(' + format(ast[2], screen) + ')';
                } else {
                    return (displayName[ast[1]] || ast[1]) +
                        (ast[2][0] == 'ident' || ast[2][0] == 'num' || ast[2][0] == '^' ? format(ast[2], screen) : '(' + format(ast[2], screen) + ')');
                }
            }
            return ast[1] + '(' + format(ast[2], screen) + ')';
        }
    }
})();

/**
 * Parsing
 */
(function () {
    function stream (string) {
        this.string = string.split('');
        this.position = 0;
    }

    stream.prototype = {
        skipws: function () {
            while (this.position < this.string.length) {
                var ch = this.string[this.position];
                if (ch == ' ' || ch == '\t' || ch == '\n' || ch == '\b' || ch == '\r') {
                    this.position++;
                    continue;
                }
                break;
            }
            return this.position === this.string.length;
        },
        get: function () {
            return this.string[this.position++];
        },
        peek: function () {
            return this.string[this.position];
        },
        eof: function () {
            return this.position === this.string.length;
        }
    };

    function expr (stream) {
        var t = term(stream), value;
        value = t;
        while (!stream.skipws()) {
            if (stream.peek() === '+') {
                stream.get();
                t = term(stream);
                value = ['+', value, t];
            }
            else if (stream.peek() === '-') {
                stream.get();
                t = term(stream);
                value = ['-', value, t];
            } else {
                break;
            }
        }
        return value;
    }

    function term (stream) {
        var p = posNeg(stream), value;
        value = p;
        while (!stream.skipws()) {
            if (stream.peek() === '*') {
                stream.get();
                p = posNeg(stream);
                value = ['*', value, p];
            }
            else if (stream.peek() === '/') {
                stream.get();
                p = posNeg(stream);
                value = ['/', value, p];
            } else {
                break;
            }
        }
        return value;
    }

    function posNeg (stream) {
        if (stream.skipws()) {
            throw 'Factor expected.';
        }
        var p = stream.peek();
        if (p === '+' || p === '-') {
            stream.get();
            stream.skipws();
            return ['.' + p, pow(stream)];
        }
        return pow(stream);
    }

    function pow (stream) {
        var p = factor(stream), value;
        value = p;
        while (!stream.skipws()) {
            if (stream.peek() === '^') {
                stream.get();
                p = pow(stream);
                value = ['^', value, p];
            }
            else {
                break;
            }
        }
        return value;
    }

    function factor (stream) {
        if (stream.skipws()) {
            throw 'Factor expected.';
        }
        var p = stream.peek();
        if (stream.skipws()) {
            throw 'Factor expected.';
        }
        if (p === '(') {
            stream.get();
            stream.skipws();
            var value = expr(stream);
            if (stream.skipws() || stream.peek() !== ')') {
                throw '")" expected.';
            }
            stream.get();
            return value;
        }
        if ('0' <= p && p <= '9' || p === '.') {
            return number(stream);
        }
        if ('a' <= p && p <= 'z' || 'A' <= p && p <= 'Z' || p === '_') {
            var value = ident(stream);
            if (stream.eof()) {
                return value;
            }
            if (stream.peek() === '(') {
                stream.get();
                var ex = expr(stream);
                if (stream.eof() || stream.peek() !== ')') {
                    throw '")" expected.';
                }
                stream.get();
                return ['call', value[1], ex];
            } else {
                return value;
            }
        }
        throw 'Factor expected.';
    }

    function fract (stream) {
        if (stream.eof()) {
            return 0;
        }
        var p = stream.peek(), val = 0, rad = 1;
        if (p === '.') {
            stream.get();
            p = stream.peek();
            if ('0' <= p && p <= '9') {
                while ('0' <= p && p <= '9') {
                    stream.get();
                    val *= 10;
                    val += +p;
                    p = stream.peek();
                    rad *= 10;
                }
                return val / rad;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    function expon (stream) {
        if (stream.eof()) {
            return 1;
        }
        var p = stream.peek(), val = 0, neg = false;
        if (p === 'e' || p === 'E') {
            stream.get();
            p = stream.peek();
            if (p === '+' || p === '-') {
                stream.get();
                neg = p === '-';
                p = stream.peek();
            }
            if ('0' <= p && p <= '9') {
                while ('0' <= p && p <= '9') {
                    stream.get();
                    val *= 10;
                    val += +p;
                    p = stream.peek();
                }
                if (neg) {
                    return Math.exp(-Math.LOG10E * val);
                } else {
                    return Math.exp(Math.LOG10E * val);
                }
            } else {
                throw 'Ill-formated number';
            }
        } else {
            return 1;
        }
    }

    function number (stream) {
        var p = stream.peek(), val = 0;
        if (p === '.') {
            val = fract(stream);
            if (val === 0) {
                throw 'Ill-formated number';
            }
            val *= expon(stream);
        } else if ('0' <= p && p <= '9') {
            while ('0' <= p && p <= '9') {
                stream.get();
                val *= 10;
                val += +p;
                p = stream.peek();
            }
            val += fract(stream);
            val *= expon(stream);
        } else {
            throw 'Ill-formated number';
        }
        return ['num', val];
    }

    function ident (stream) {
        if (stream.eof()) throw 'Identifier expected';
        var p = stream.peek(), value = [];
        if ('a' <= p && p <= 'z' || 'A' <= p && p <= 'Z' || a === '_') {
            value.push(p);
            stream.get();
            p = stream.peek();
            while ('a' <= p && p <= 'z' || 'A' <= p && p <= 'Z' || '0' <= p && p <= '9' || p === '_') {
                stream.get();
                value.push(p);
                p = stream.peek();
            }
            return ['ident', value.join('')];
        } else {
            throw 'Identifier expected';
        }
    }

    window.parseExp = function (expression) {
        var chars = expression,
            s = new stream(chars),
            value;
        try {
            value = expr(s);
            if (!s.skipws()) {
                throw 'EOF expected';
            }
            return value;
        } catch (e) {
            throw e + ' at ' + stream.position;
        }
    }
})();
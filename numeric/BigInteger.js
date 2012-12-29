/**
 * Big Integer
 * @constructor
 */
function BigInteger() {
    // 0 .. 32767 to avoid overflow in multiplication
    this.array = [];
    this.negative = false;
}

Math.sign = function (number) {
    if (number < 0) {
        return -1;
    } else if (number > 0) {
        return 1;
    } else {
        return 0;
    }
};

BigInteger.DIGITS = "0123456789";

/**
 *
 * @param {Number} number
 * @return {BigInteger}
 */
BigInteger.fromNumber = function (number) {
    number = number >> 0;
    var result = new BigInteger(), i = 0;
    if (number < 0) {
        number = -number;
        result.negative = true;
    }
    while (number) {
        result.array[i++] = number & 32767;
        number >>= 15;
    }
    return result;
};

/**
 *
 * @param {String} string
 * @return {BigInteger}
 */
BigInteger.fromString = function (string) {
    var integer = new BigInteger(),
        length = string.length;
    if (string[0] === '-') {
        integer.negative = true;
        string = string.substr(1);
    }
    for (var i = length % 4; i <= length; i += 4) {
        integer._mult_1(10000);
        if (i >= 4) {
            integer._add_1(+string.substring(i - 4, i));
        } else {
            integer._add_1(+string.substring(0, i));
        }
    }
    return integer;
};

BigInteger.prototype = {
    /**
     * Clone the current integer
     * @return {BigInteger}
     */
    clone: function () {
        var result = new BigInteger();
        result.array = this.array.slice(0);
        result.negative = this.negative;
        return result;
    },

    /**
     * To string
     * @return {String}
     */
    toString: function () {
        if (this.array.length === 0) {
            return '0';
        } else if (this.array.length === 1) {
            return this.array[0].toString();
        }
        var result = this.getDigits(10000), i, j, a, b,
            digits = BigInteger.DIGITS;
        for (i = 0, j = result.length - 1; i < j; i++, j--) {
            a = result[i];
            b = result[j];
            result[j] = digits[a / 1000 >> 0] + digits[a / 100 % 10 >> 0] + digits[a / 10 % 10 >> 0] + digits[a % 10];
            result[i] = digits[b / 1000 >> 0] + digits[b / 100 % 10 >> 0] + digits[b / 10 % 10 >> 0] + digits[b % 10];
        }
        if (i === j) {
            a = result[i];
            result[i] = digits[a / 1000 >> 0] + digits[a / 100 % 10 >> 0] + digits[a / 10 % 10 >> 0] + digits[a % 10];
        }
        result[0] = +result[0];
        if (this.negative) {
            result.unshift("-");
        }
        return result.join('');
    },

    /**
     * Get digits from big integer. Regardless of the sign
     * @param base
     * @return {Array}
     */
    getDigits: function (base) {
        var array, result, num;
        if (base == 32767) {
            return this.array.slice(0);
        } else if (base == 32) {
            array = this.array;
            result = [];
            result.length = array.length * 3;
            for (i = 0; i < array.length; i++) {
                num = array[i];
                result[i * 3] = num & 31;
                result[i * 3 + 1] = (num >> 5) & 31;
                result[i * 3 + 2] = (num >> 10) & 31;
            }
            return result;
        } else if (base == 8) {
            array = this.array;
            result = [];
            result.length = array.length * 5;
            for (i = 0; i < array.length; i++) {
                num = array[i];
                result[i * 5] = num & 7;
                result[i * 5 + 1] = (num >> 3) & 7;
                result[i * 5 + 2] = (num >> 6) & 7;
                result[i * 5 + 3] = (num >> 9) & 7;
                result[i * 5 + 4] = (num >> 12) & 7;
            }
            return result;
        }

        array = this.array.slice();
        result = [];
        while (array.length > 0) {
            for (var i = array.length - 1, carry = 0; i >= 0; i--) {
                array[i] += carry << 15;
                carry = array[i] % base;
                array[i] /= base;
                array[i] >>= 0;
            }
            while (array.length > 0 && array[array.length - 1] === 0) {
                array.length--;
            }
            result.push(carry);
        }
        while (result.length > 0 && result[result.length - 1] === 0) {
            result.length--;
        }
        return result;
    },

    /**
     * Recalculate carry and shrink the size of the array.
     * @return {BigInteger}
     */
    normalize: function () {
        var array = this.array,
            len = array.length,
            carry = 0;
        for (var i = 0; i < len; i++) {
            carry += array[i];
            array[i] = carry & 32767;
            carry >>= 15;
        }
        while (carry) {
            array[i++] = carry & 32767;
            carry >>= 15;
        }
        while (array.length > 1 && array[array.length] === 0) {
            array.length--;
        }
        return this;
    },

    /**
     * 1 for positive number,
     * 0 for zero, and
     * -1 for negative number.
     * @return {Number}
     */
    sign: function () {
        if (this.array.length == 0) {
            return 0;
        }
        return this.negative ? -1 : 1;
    },

    /**
     * Return the sign of `this` - `num`
     * @param {Number|BigInteger} num
     * @return {Number}
     */
    cmp: function (num) {
        this.normalize();
        if (typeof num === 'number') {
            num = BigInteger.fromNumber(num);
        } else {
            num.normalize();
        }
        var sgn1 = this.sign(),
            sgn2 = num.sign();
        if (sgn1 != sgn2) {
            return Math.sign(sgn1 - sgn2);
        }
        if (sgn1 == 0) {
            return 0;
        }
        if (sgn1 == 1) {
            return this.abscmp(num);
        }
        return -this.abscmp(num);
    },

    /**
     *
     * @param num
     * @return {Number}
     */
    abscmp: function (num) {
        this.normalize();
        if (typeof num === 'number') {
            num = BigInteger.fromNumber(num);
        } else {
            num.normalize();
        }
        if (this.array.length != num.array.length) {
            return Math.sign(this.array.length - num.array.length);
        }
        for (var i = this.array.length; i >= 0; i--) {
            if (this.array[i] != num.array[i]) {
                return Math.sign(this.array[i] - num.array[i]);
            }
        }
        return 0;
    },

    /**
     * "operator+="
     * Add a number to the current one.
     * @param {Number|BigInteger} num
     */
    add: function (num) {
        return this._add_min(num, false);
    },

    /**
     * "operator-="
     * Add a number to the current one.
     * @param {Number|BigInteger} num
     */
    minus: function (num) {
        return this._add_min(num, true);
    },

    /**
     * Add or minus a number
     * @param {BigInteger|Number} num
     * @param {Boolean} minus
     * @return {Boolean}
     * @private
     */
    _add_min: function (num, minus) {
        var temp;
        if (typeof num === 'number') {
            num >>= 0;
            if (num === 0) {
                return this;
            }
            if (minus) {
                return this._add_min(-num, false);
            }
            if (this.negative ^ (num < 0)) {
                // Now we want to add
                return this._add_1(num);
            } else {
                num = BigInteger.fromNumber(num);
                // continues
            }
        }

        if (num instanceof BigInteger) {
            if (minus) {
                num.negative = !num.negative;
                this._add_min(num, false);
                num.negative = !num.negative;
                return this;
            }
            if (this.negative ^ num.negative) {
                return this._add_bi(num);
            } else {
                switch (this.abscmp(num)) {
                    case 0:
                        this.array.length = 0;
                        this.negative = false;
                        return this;
                    case 1:
                        return this._minus_bi(num);
                    default:
                        temp = this.clone();
                        this.array.length = 0;
                        this.array.push.apply(this.array, num.array);
                        this.negative = num.negative;
                        return this._minus_bi(temp);
                }
            }
        }
        throw new Error("Invalid type");
    },

    /**
     * @private
     * Add num to this. Regardless of sign.
     * @param {BigInteger} num
     */
    _add_bi: function (num) {
        var i, carry,
            array = this.array,
            len = array.length,
            array2 = num.array,
            len2 = array2.length;
        if (len < len2) {
            array.length = len2;
            i = len;
            while (i < len2) {
                array[i++] = 0;
            }
        }
        for (i = 0, carry = 0; i < len2; i++) {
            carry += array[i] + array2[i];
            array[i] = carry & 32767;
            carry >>= 15;
        }
        if (carry) {
            array[i] = carry & 32767;
        }
        return this;
    },

    /**
     * @private
     * Add num to this. Regardless of sign.
     * @param {Number} num
     */
    _add_1: function (num) {
        var array = this.array,
            len = array.length;
        for (var i = 0, carry = num; i < len; i++) {
            carry += array[i];
            array[i] = carry & 32767;
            carry >>= 15;
        }
        while (carry) {
            array[i++] = carry & 32767;
            carry >>= 15;
        }
        return this;
    },

    /**
     * @private
     * @param {BigInteger} num a BigInteger whose absolute value is smaller than `this`
     */
    _minus_bi: function (num) {
        var array = this.array,
            array2 = num.array,
            len2 = array.length,
            i, carry = 0;
        for (i = 0, carry; i < len2; i++) {
            carry += array[i] - array2[i];
            array[i] = carry & 32767;
            carry >>= 15;
        }
        while (carry) {
            carry += array[i];
            array[i] = carry & 32767;
            carry >>= 15;
        }
    },

    /**
     * "operator*="
     * Multiply a number to the current one.
     * @param {Number|BigInteger} num
     */
    mult: function (num) {
        if (this.array.length == 0) {
            return this;
        }
        if (typeof num === 'number') {
            if (num == 0) {
                this.array = [];
                this.negative = false;
                return this;
            }
            if (num < 0) {
                this.negative = !this.negative;
            }
            return this._mult_1(num);
        } else if (num instanceof BigInteger) {
            if (num.negative) {
                this.negative = !this.negative;
            }
            return this._mult_bi(num);
        }
        throw new Error("Invalid type");
    },

    /**
     * @private
     * @param {BigInteger} num
     */
    _mult_bi: function (num) {
        if (num.array.length == 0) {
            this.array.length = 0;
            this.negative = false;
            return this;
        }
        if (num.array.length == 1) {
            return this._mult_1(num.array[0]);
        }
        var maxlen = num.array.length + this.array.length;
        maxlen = 1 << Math.ceil(Math.log(maxlen) / Math.log(2));
        if (num.array.length * this.array.length > 200 * maxlen * Math.log(maxlen)) {
            return this._mult_huge(num);
        }
        var target = this.array,
            array = target.slice(0),
            len = array.length,
            array2 = num.array,
            len2 = array2.length, i, j,
            outlen = len + len2 - 1,
            carry,
            left;
        target.length = outlen;
        for (i = 0; i < outlen; i++) {
            target[i] = 0;
        }
        for (i = 0; i < len; i++) {
            left = array[i];
            if (left > 0) {
                for (j = 0, carry = 0; j < len2; j++) {
                    carry += target[i + j] + left * array2[j];
                    target[i + j] = carry & 32767;
                    carry >>= 15;
                }
                while (carry) {
                    if (i + j >= target.length) {
                        target[i + j] = 0;
                    }
                    carry += target[i + j];
                    target[i + j] = carry & 32767;
                    carry >>= 15;
                }
            }
        }
        this.normalize();
        return this;
    },

    /**
     * @private
     * @param {Number} num
     */
    _mult_1: function (num) {
        num >>= 0;
        var array = this.array,
            len = array.length;
        for (var i = 0, carry = 0; i < len; i++) {
            carry += array[i] * num;
            array[i] = carry & 32767;
            carry >>= 15;
        }
        while (carry) {
            array[i++] = carry & 32767;
            carry >>= 15;
        }
    },

    /**
     * @private
     * Multiply numbers using FFT.
     * @param {BigInteger} num
     * @return {BigInteger}
     */
    _mult_huge: function (num) {
        var digits1 = this.getDigits(32),
            digits2 = num.getDigits(32),
            maxlen = digits1.length + digits2.length,
            carry, j;
        maxlen = 1 << Math.ceil(Math.log(maxlen) / Math.log(2));
        var fft1 = fft(digits1, maxlen),
            fft2 = fft(digits2, maxlen),
            i, len = fft1.length,
            re;
        for (i = 0; i < len; i += 2) {
            re = fft1[i] * fft2[i] - fft1[i + 1] * fft2[i + 1];
            fft1[i + 1] = fft1[i] * fft2[i + 1] + fft1[i + 1] * fft2[i];
            fft1[i] = re;
        }
        digits1 = ifft(fft1, len);
        for (i = 0, carry = 0; i < maxlen; i++) {
            carry += Math.round(digits1[i]);
            digits1[i] = carry & 31;
            carry >>= 5;
        }
        while (carry) {
            digits1[i++] = carry & 31;
            carry >>= 5;
        }
        this.array.length = 0;
        for (i = 0, j = 0; i < digits1.length; i += 3, j++) {
            this.array[j] = digits1[i];
            if (i + 1 < digits1.length) {
                this.array[j] |= digits1[i + 1] << 5;
                if (i + 2 < digits1.length) {
                    this.array[j] |= digits1[i + 2] << 10;
                }
            }
        }
        return this;
    }
};
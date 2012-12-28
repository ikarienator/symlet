/**
 * Bit Integer
 * @constructor
 */
function BigInteger() {
    // 0 .. 32767 to avoid overflow in multiplication
    this.array = [0];
}


BigInteger.DIGITS = "0123456789";
/**
 *
 * @param {Array} array
 * @return {BigInteger}
 */
BigInteger.fromArray = function (array) {
    var integer = new BigInteger();
    integer.array = array.slice(0);
    integer.normalize();
    return integer;
};

BigInteger.fromNumber = function (integer) {
    integer = Math.round(integer);
    var result = new BigInteger(), i = 0;
    while (integer) {
        result.array[i++] = integer & 32767;
        integer >>= 15;
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
    clone: function () {
        var result = new BigInteger();
        result.array = this.array.slice(0);
        return result;
    },

    /**
     *
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
        return result.join('');
    },

    getDigits: function (base) {
        var array, result, num;
        if (base == 32767) {
            return this.array.slice();
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

    cmp: function (num) {
        this.normalize();
        num.normalize();
        if (this.array.length != num.array.length) {
            return this.array.length - num.array.length;
        }
        for (var i = this.array.length; i >= 0; i--) {
            if (this.array[i] != num.array[i]) {
                return this.array[i] - num.array[i];
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
        if (typeof num === 'number') {
            return this._add_1(num);
        } else if (num instanceof BigInteger) {
            return this._add_bi(num);
        }
        throw new Error("Invalid type");
    },

    /**
     * @private
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
     * "operator*="
     * Multiply a number to the current one.
     * @param {Number|BigInteger} num
     */
    mult: function (num) {
        if (typeof num === 'number') {
            return this._mult_1(num);
        } else if (num instanceof BigInteger) {
            return this._mult_bi(num);
        }
        throw new Error("Invalid type");
    },

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
        ifft(fft1, len);
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
    },

    /**
     * @private
     * @param {BigInteger} num
     */
    _mult_bi: function (num) {
        if (num.array.length == 0) {
            this.array = [];
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
    }
};
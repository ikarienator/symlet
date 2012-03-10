function Integer () {
    this.array = new Uint32Array(64);
}

Integer.fromArray = function (array) {
    var int = new Integer();
    int.array = array;
    return int;
}

Integer.from = function (string) {
    var int = new Integer();
    for (var i = 0; i< 10; i++) {
        
    }
}

Integer.prototype = {
    // 10 Based
    toString: function () {
        var arr = new Uint32Array(this.array),
            len = 9.632959861247397 * arr.length,
            result = new Uint32Array(Math.ceil(len) + 1),
            position = 0, max,
            zeroTop = arr.length,
            temp,
            carry = 0,
            list = [];
        while (zeroTop && arr[zeroTop] !== 0) zeroTop--;
        while (zeroTop) {
            carry = 0;
            for (var i = zeroTop; i >= 0; i--) {
                temp = arr[zeroTop];
                arr[zeroTop] = temp / 10000 + carry * 429496.7296;
                carry = (temp + carry * 7296) % 10000;
            }
            result[position++] = carry;
            if (arr[zeroTop] == 0) {
                zeroTop--;
            }
        }
        if (position == 0) {
            return '0';
        }
        list[0] = result[position--].toString();
        while (position) {
            list.push(('0000' + result[position--].toString()).substr(-4));
        }
        return list.join('');
    },

    mult1: function (num) {
        var arr32 = new Uint32Array(this.array);

    },

    divmod1: function (num) {
        var arr32 = new Uint32Array(this.array);
        var carry = 0;
        for (var i = arr32.length - 1; i >= 0; i--) {
            carry = arr32[i] % num;
        }
    }
};
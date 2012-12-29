// TODO: Not finished
NumberTheoreticTransform = {};
NumberTheoreticTransform.egcd = function (a, b) {
    var x = 0, lastX = 1,
        y = 1, lastY = 0,
        q, c;
    while (b) {
        q = a / b >> 0;
        c = b;
        b = a % b;
        a = c;
        c = x;
        x = lastX - q * x;
        lastX = c;
        c = y;
        y = lastY - q * y;
        lastY = c;
    }
    return [a, lastX, lastY];
};

NumberTheoreticTransform.inverseMod = function (a, m) {
    var eg = FastNumberTheoreticTransform.egcd(a, m);
    if (eg[0] == 1) {
        return (eg[1] % m + m) % m;
    } else {
        return 0;
    }
};

NumberTheoreticTransform.powerMod = function (a, n, m) {
    if (n < 0) {
        a = FastNumberTheoreticTransform.inverseMod(a, m);
    }
    a %= m;
    if (a < 0) {
        a += m;
    }
    if (a == 0) {
        return 0;
    }
    if (m == 1) {
        return 0;
    }
    if (a == 1) {
        return 1;
    }
    if (n == 0) {
        return 1;
    }
    if (n == 1) {
        return a;
    }
    var result = 1, d = a;
    while (n) {
        if (n & 1) {
            result *= d;
            result %= m;
        }
        d *= d;
        d %= m;
        n >>= 1;
    }
    return result;
};


function FastNumberTheoreticTransform(length, element_range) {
    var n = this.length = length,
        nrange = element_range * element_range * length;
    var modular = 65537, log = 65536, root = 3;
    if (nrange >= modular) {
        log <<= 1;
        while (nrange >= modular) {
            modular <<= 1;
            root <<= 1;
        }
    }
}

FastNumberTheoreticTransform.types = [
    {n: 65536, m: 65537, a: 3}/*65537*/
];

function ntt(list, m, a, mult) {
    var i, j, n = list.length, b, c,
        list2 = [];
    list2.length = n;
    for (i = 0, b = 1; i < n; i++) {
        var acc = 0;
        for (j = 0, c = 1; j < n; j++) {
            acc += list[j] * c;
            acc %= m;
            c *= b;
            c %= m;
        }
        acc *= mult;
        acc %= m;
        list2[i] = acc;
        b *= a;
        b %= m;
    }
    return list2;
}
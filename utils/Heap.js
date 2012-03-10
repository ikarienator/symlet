function Heap (cmp, arr) {
    this.array = arr || [];
    this.cmp = cmp = cmp || function (a, b) {
        return a < b;
    }
    if (arr) {
        // O(n) time make-heap
        var len = arr.length, p;
        for (var j = ( arr.length - 1 ) >> 1; j >= 0; j--) {
            var i = j;
            p = arr[j];
            while (i < len && ((i << 1) + 1 < len && cmp(arr[(i << 1) + 1], p) || (i << 1) + 2 < len && cmp(arr[(i << 1) + 2], p))) {
                if ((i << 1) + 2 >= len || cmp(arr[(i << 1) + 1], arr[(i << 1) + 2])) {
                    arr[i] = arr[(i << 1) + 1];
                    i = (i << 1) + 1;
                } else {
                    arr[i] = arr[(i << 1) + 2];
                    i = (i << 1) + 2;
                }
            }
            arr[i] = p;
        }
    }
}

Heap.prototype = {
    push: function (x) {
        var arr = this.array,
            i = arr.length, p,
            cmp = this.cmp;
        while (i && cmp(x, arr[p = ((i - 1) >> 1)])) {
            arr[i] = arr[p];
            i = p;
        }
        arr[i] = x;
    },
    pop: function () {
        var arr = this.array,
            len = arr.length,
            p = arr[len - 1],
            ret = arr[0],
            i = 0,
            cmp = this.cmp;
        if (arr.length <= 1) {
            return arr.pop();
        }
        while (i < len && ((i << 1) + 1 < len && cmp(arr[(i << 1) + 1], p) || (i << 1) + 2 < len && cmp(arr[(i << 1) + 2], p))) {
            if ((i << 1) + 2 >= len || cmp(arr[(i << 1) + 1], arr[(i << 1) + 2])) {
                arr[i] = arr[(i << 1) + 1];
                i = (i << 1) + 1;
            } else {
                arr[i] = arr[(i << 1) + 2];
                i = (i << 1) + 2;
            }
        }
        arr[i] = p;
        arr.length--;
        return ret;
    }
}

Object.defineProperty(Heap.prototype, 'length', function () {
    return this.array.length;
});
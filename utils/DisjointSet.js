/**
 * @class DisjointSet
 * @constructor
 */
function DisjointSet (cmp) {
    this.diff = 0;
    this.parent = [];
    this.rank = [];
    this.cmp = cmp || function (a, b) {
        return a < b ? -1 : a == b ? 0 : 1;
    };
    this.max = 0;
}

DisjointSet.prototype = {
    add: function () {
        this.diff++;
        this.parent[this.max] = this.max;
        this.rank[this.max] = 0;
        return this.max++;
    },

    find: function (a) {
        if (this.parent[a] == a)
            return a;
        return this.parent[a] = this.find(this.parent[a]);
    },

    join: function (a, b) {
        a = this.find(a);
        b = this.find(b);
        if (a == b) {
            return;
        } else {
            this.diff--;
        }
        var cmp = this.cmp(a, b);
        if (cmp > 0 || cmp == 0 && this.rank[a] > this.rank[b]) {
            this.parent[b] = a;
        } else {
            this.parent[a] = b;
        }
        if (cmp == 0 && this.rank[a] == this.rank[b]) {
            this.rank[b]++;
        }
    }
};
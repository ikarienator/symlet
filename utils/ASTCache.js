function ASTCache () {
    var me = this;
    me.djSet = new DisjointSet(function (a, b) {
        astComp(me.astList[a], me.astList[b]);
    });
    me.trieTree = {};
    me.astList = [];
}

ASTCache.prototype = {
    get: function (index) {
        return this.astList[index];
    },

    find: function (ast) {
        var i, ln, key;
        if (!(ast instanceof Array)) {
            return ast;
        }
        var curr = this.trieTree;
        for (i = 0, ln = ast.length; i < ln; i++) {
            key = this.find(ast[i]);
            if (!curr[key]) {
                curr[key] = {};
            }
            curr = curr[key];
        }
        if (!('__id' in curr)) {
            curr.__id = this.djSet.add();
            this.astList[curr.__id] = ast;
        }
        return curr.__id;
    },

    findSimplified: function (ast) {
        var me = this;
        return me.astList[me.djSet.find(me.find(ast))];
    },

    join: function (ast1, ast2) {
        this.djSet.join(this.find(ast1), this.find(ast2));
    },

    eq: function (ast1, ast2) {
        return this.djSet.find(this.find(ast1)) == this.djSet.find(this.find(ast2));
    }
};
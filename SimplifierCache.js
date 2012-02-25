function SimplifierCache() {
    this.djSet = new DisjointSet();
    this.trieTree = {};
    this.astList = [];
}

SimplifierCache.prototype = {
    find: function(ast) {
        var i, ln, key;
        if (!ast.length) {
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
        if (!curr.id) {
            curr.id = this.djSet.add();
            this.astList[curr.id] = ast;
        }
        return curr.id;
    },
    union: function(ast1, ast2) {
        this.djSet.union(this.find(ast1), this.find(ast2));
    },
    eq: function(ast1, ast2) {
        return this.djSet.find(this.find(ast1)) == this.djSet.find(this.find(ast2));
    }
};
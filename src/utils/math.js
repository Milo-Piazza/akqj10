var choose = (() => {
    var cache = {};
    function _choose(n, k) {
        if (n in cache && k in cache[n]) {
            return cache[n][k];
        }
        if (k === 0 || k === n) {
            return 1;
        }
        var res = _choose(n-1, k-1) + _choose(n-1, k);
        if (!(n in cache)) {
            cache[n] = {};
        }
        cache[n][k] = res;
        return res;
    }
    return _choose;
})();

export {choose};
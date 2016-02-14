function emptyString() {
    return "";
}
function flipArgs(f) {
    return (a, b) => f(b, a);
}
function identity(x) {
    return x;
}

// memoize caches only the last 1 call to f
function memoize(f) {
    var a = null, // cached arguments
        r = null; // cached result
    return function () {
        var b = Array.prototype.slice.call(arguments);
        if (!(a && a.length === b.length && a.every(function (_, i) { return a[i] === b[i]; }))) { // shallow compare arrays (a, b)
            a = b;
            r = f.apply(null, a);
        }
        return r;
    };
}

module.exports = {
    emptyString: emptyString,
    flipArgs: flipArgs,
    identity: identity,
    memoize: memoize
};

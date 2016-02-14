function clamp(a, b, value) {
    var min = Math.min(a, b),
        max = Math.max(a, b);
    return Math.max(min, Math.min(max, value));
}

function createLinearInterpolator(domain, range) {
    var m = (range[1] - range[0]) / (domain[1] - domain[0]),
        b = range[0] - domain[0] * m;
    return function (x) {
        return m * x + b;
    };
}

function roundWith(f, x, exp) {
    var factor = Math.pow(10, exp || 0);
    return f(x / factor) * factor;
}
var floor = roundWith.bind(null, Math.floor),
    ceil  = roundWith.bind(null, Math.ceil);

// niceRange([Number, Number]) -> [Number, Number]
// returns a new range, rounded to nearest "nice" numbers that enclose the given range
// example: [3, 97] -> [0, 100]
function niceRange(range) {
    // snap to `b` if the distance from `origin` to `a` is at least `percent` of the distance from `origin` to `b`
    function snap(percent, origin, a, b) {
        return a !== b && (a - origin) / (b - origin) >= percent ? b : a;
    }
    var min = Math.min(range[0], range[1]),
        max = Math.max(range[0], range[1]),
        decades = Math.log(max - min) / Math.log(10),
        maxA = ceil(max, Math.floor(decades) - 1),
        maxB = ceil(max, Math.ceil(decades) - 1),
        minA = floor(min, Math.floor(decades) - 1),
        minB = floor(min, Math.ceil(decades) - 1),
        nice = [
            snap(0.95, max, minA, minB),
            snap(0.95, min, maxA, maxB)
        ];
    return range[1] < range[0] ? nice.reverse() : nice;
}

module.exports = {
    clamp: clamp,
    createLinearInterpolator: createLinearInterpolator,
    niceRange: niceRange
};

const R = require("ramda");
const DATE = require("../utilities/date-utilities");
const {identity, memoize} = require("../utilities/function-utilities");
const {createLinearInterpolator, niceRange} = require("../utilities/number-utilities");

const X_LENGTH = 550; // maximum days out

var xDimension = memoize(function () {
        var domain = [0, X_LENGTH],
            range = [X_LENGTH, 0];
        return {
            className: "x",
            name: "Days Out",
            domain: domain,
            range: range,
            rangeFromDomain: createLinearInterpolator(domain, range),
            domainFromRange: createLinearInterpolator(range, domain),
            ticks: [0, 30, 60, 90, 180, 365, X_LENGTH],
            tickLabelFromDomain: identity,
            labelFromDomain: identity
        };
    }),
    _yDimension = memoize(function (matrix, baseDate) {
        var domain = [0, matrix.length - 1],
            range = [matrix.length - 1, 0],
            _baseDate = DATE.fromString(baseDate),
            dateFromDomain = dateID => DATE.add("day", dateID, _baseDate),
            domainFromDate = date => DATE.diff("day", _baseDate, date);
        return {
            className: "y",
            name: "Hotel Date",
            domain: domain,
            range: range,
            rangeFromDomain: createLinearInterpolator(domain, range),
            domainFromRange: createLinearInterpolator(range, domain),
            ticks: DATE.range("month", dateFromDomain(domain[0]), dateFromDomain(domain[1])).map(domainFromDate),
            tickLabelFromDomain: function (dateID) {
                var date = dateFromDomain(dateID),
                    format = date.getMonth() === 0 && date.getDate() === 1 ? "yyyy" : "mmm";
                return DATE.format(format, date);
            },
            labelFromDomain: dateID => DATE.format("ddd mmm d, yyyy", dateFromDomain(dateID)),
            dateFromDomain: dateFromDomain,
            domainFromDate: domainFromDate
        };
    }),
    yDimension = memoize(function (matrix, baseDate, scrollY, viewHeight) {
        var _y = _yDimension(matrix, baseDate),
            viewRangeMin = Math.min.apply(null, _y.range) - scrollY;
        return Object.assign({
                viewRange: [viewRangeMin, viewRangeMin + viewHeight]
            },
            _y
        );
    }),
    zDimension = memoize(function (max) {
        var domain = niceRange([0, max]),
            range = [160, 0],
            tickDivisions = 4,
            tickStep = domain[1] / tickDivisions;
        return {
            name: "Room Nights",
            domain: domain,
            range: range,
            rangeFromDomain: createLinearInterpolator(domain, range),
            invertedRangeFromDomain: createLinearInterpolator(domain, R.reverse(range)),
            ticks: R.range(0, tickDivisions + 1).map(i => Math.round(i * tickStep)),
            tickLabelFromDomain: identity,
            labelFromDomain: identity
        };
    }),
    vDimension = memoize(function (matrix, baseDate, selectedV) {
        var x = xDimension(),
            y = _yDimension(matrix, baseDate);
        return {
            className: "v",
            name: "As-Of Date",
            domain: x.domain,
            range: x.range,
            rangeFromDomain: x.rangeFromDomain,
            domainFromRange: x.domainFromRange,
            ticks: y.ticks.map(yValue => yValue - selectedV),
            tickLabelFromDomain: (vValue => y.tickLabelFromDomain(vValue + selectedV)),
            labelFromDomain: y.labelFromDomain,
            viewRange: x.range
        };
    }),
    yzVectorForX = memoize(function (x, matrix) {
        return matrix.map(row => row[x]);
    }),
    vzVectorForV = function (v, matrix) {
        return matrix.slice(v, v + X_LENGTH).map((row, i) => row[i]);
    },
    vzVectorForSelectedV = memoize(vzVectorForV),
    vzVectorForComparedV = memoize(vzVectorForV),
    comparedDateID = function (dateFromDateID, dateIDFromDate, dateID) {
        return dateIDFromDate(DATE.add("year", -1, dateFromDateID(dateID)));
    },
    vFromXAndY = function (x, y) {
        return typeof x === "number" && typeof y === "number" ? y - x : null;
    };

var select = {};

select.xDimension = function (state) {
    return xDimension();
};
select.yDimension = function (state) {
    return state.values ? yDimension(state.values.matrix, state.values.baseDate, state.ui.scrollY, state.ui.viewHeight) : null;
};
select.zDimension = function (state) {
    return state.values ? zDimension(state.values.max) : null;
};
select.selectedV = function (state) {
    return vFromXAndY(state.ui.selectedX, state.ui.selectedY);
};
select.vDimension = function (state) {
    var selectedV = select.selectedV(state);
    return state.values ? vDimension(state.values.matrix, state.values.baseDate, selectedV) : null;
};
select.comparedY = function (state) {
    var y = select.yDimension(state);
    return y ? comparedDateID(y.dateFromDomain, y.domainFromDate, state.ui.selectedY) : null;
};
select.comparedV = function (state) {
    var selectedV = select.selectedV(state),
        y = select.yDimension(state);
    return y ? comparedDateID(y.dateFromDomain, y.domainFromDate, selectedV) : null;
};
select.yzVectorForSelectedX = function (state) {
    return state.values ? yzVectorForX(state.ui.selectedX, state.values.matrix) : null;
};
select.xzVectorForSelectedY = function (state) {
    return state.values ? state.values.matrix[state.ui.selectedY] : null;
};
select.xzVectorForComparedY = function (state) {
    return state.values ? state.values.matrix[select.comparedY(state)] : null;
};
select.vzVectorForSelectedV = function (state) {
    var selectedV = select.selectedV(state);
    return state.values ? vzVectorForSelectedV(selectedV, state.values.matrix) : null;
};
select.vzVectorForComparedV = function (state) {
    var comparedV = select.comparedV(state);
    return state.values ? vzVectorForComparedV(comparedV, state.values.matrix) : null;
};
select.yxzMatrix = function (state) {
    return state.values ? state.values.matrix : null;
};

module.exports = select;

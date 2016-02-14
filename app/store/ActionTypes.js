const R = require("ramda");

var ActionTypes = R.mapObjIndexed((v, k) => k, {
        RECEIVE_VALUES: null,   // {matrix, max, baseDate}
        SELECT_POSITION: null,  // {x, y, constrainV}
        SCROLL_VIEW: null       // {dy}
    });

module.exports = ActionTypes;

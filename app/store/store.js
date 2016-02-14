const R = require("ramda");
const ActionTypes = require("./ActionTypes");
const createStore = require("../utilities/createStore");
const {clamp} = require("../utilities/number-utilities");

var initialState = {
        values: null,
        ui: {
            viewHeight: 366 + 90, // ensure 1 year + 90 days is visible
            selectedX: 0,
            selectedY: null,
            scrollY: -550 + 90 // default scroll shows up to 90 days out
        }
    };

function reduceValues(values, action) {
    switch (action.type) {
    case ActionTypes.RECEIVE_VALUES:
        return action.data;
    default:
        return values;
    }
}
function reduceUI(ui, action, values) {
    switch (action.type) {
    case ActionTypes.RECEIVE_VALUES:
        return ui.selectedY === null ?
                R.merge(ui, {
                    selectedY: R.findLastIndex(a => a && a[0] !== undefined, action.data.matrix) // set default Y
                })
            :
                ui;
    case ActionTypes.SELECT_POSITION:
        return action.data.constrainV && action.data.x ?
                R.merge(ui, {
                    selectedX: action.data.x,
                    selectedY: action.data.x + (ui.selectedY - ui.selectedX) // y = x + v where v = y - x
                })
            :
                R.merge(ui, {
                    selectedX: action.data.x === undefined ? ui.selectedX : action.data.x,
                    selectedY: action.data.y === undefined ? ui.selectedY : action.data.y
                });
    case ActionTypes.SCROLL_VIEW:
        return action.data.dy ?
                R.merge(ui, {
                    scrollY: clamp((ui.viewHeight) - values.matrix.length, 0, ui.scrollY + action.data.dy)
                })
            :
                ui;
    default:
        return ui;
    }
}
function reduce(state, action) {
    return {
        values: reduceValues(state.values, action),
        ui: reduceUI(state.ui, action, state.values)
    };
}

module.exports = createStore(reduce, initialState);

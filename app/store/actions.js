const R = require("ramda");
const ActionTypes = require("./ActionTypes");
const store = require("./store");

function applyAction(type, data, parameters) {
    store.apply(R.pickBy(v => v !== undefined, R.zipObj(["type", "data", "parameters"], arguments)));
}

module.exports = {
    receiveValues:  applyAction.bind(null, ActionTypes.RECEIVE_VALUES),
    selectPosition: applyAction.bind(null, ActionTypes.SELECT_POSITION),
    scrollView:     applyAction.bind(null, ActionTypes.SCROLL_VIEW)
};

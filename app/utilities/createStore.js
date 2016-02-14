const R = require("ramda");

function createStore(reduce, initialState) {
    var state = initialState,
        callbacks = [],
        isApplying = false,
        timeout = null;

    function dispatch() {
        callbacks.forEach(function (callback) {
            callback(state);
        });
    }

    return {
        connect: function (callback) {
            if (typeof callback !== "function") {
                throw new Error("Store.connect(callback): 'callback' must be a function");
            }
            callbacks = callbacks.concat(callback);
        },
        disconnect: function (callback) {
            callbacks = callbacks.filter(function (c) { return c !== callback; });
        },
        state: function () {
            return state;
        },
        apply: function (action) {
            if (isApplying) {
                throw new Error("Store.apply(action): cannot be called recursively");
            }
            var previousState = state;

            isApplying = true;
            state = reduce(state, action);
            isApplying = false;

            if (!R.equals(previousState, state) && !timeout) {
                timeout = setTimeout(function () {
                    timeout = null;
                    dispatch();
                }, 0);
            }
        }
    };
}

module.exports = createStore;

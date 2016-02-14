const DATE = require("../utilities/date-utilities");
const actions = require("../store/actions");

function xhr(httpMethod, url, responseType, body, resolve, reject) {
    function stateChanged(resolve, reject, e) {
        if (e.target.readyState === 4) {
            if (e.target.status === 200) {
                resolve(e.target.response || (e.target.responseType === "json" ? JSON.parse(e.target.responseText) : null));
            } else {
                reject(new Error(e.target.status + ": " + e.target.statusText));
            }
        }
    }
    var xhr = new XMLHttpRequest();
    xhr.open(httpMethod || "GET", url, true);
    xhr.responseType = responseType || null;
    xhr.send(body);
    xhr.addEventListener("readystatechange", stateChanged.bind(null, resolve, reject));
}

// takes a list of 3-tuples, where each tuple represents (row-index, column-index, value); returns a 2D array of the values
function matrixFromTuples(tuples, transform) {
    var [a, b, c, d, e, f] = transform || [1, 0, 0, 1, 0, 0];
    return tuples.reduce(
        function (matrix, tuple) {
            var x = tuple[1],
                y = tuple[0],
                x_ = a * x + c * y + e,
                y_ = b * x + d * y + f;
            var row = matrix[y_] || (matrix[y_] = []);
            row[x_] = tuple[2];
            return matrix;
        },
        []
    );
}
function arrayMax(array) {
    var max = -Infinity,
        v;
    for (v of array) {
        max = typeof v !== "number" ? max : v > max ? v : max;
    }
    return max;
}
function firstIndex(array) {
    if (!array.length) {
        return undefined;
    }
    var i = 0;
    while (array[i] === undefined) {
        i++;
    }
    return i;
}

function getExampleData() {
    xhr("GET", "./example-data.json", "json", null,
        function (data) {
            var _matrix = matrixFromTuples(data, [1, 1, 0, 1, 0, 0]),
                offset = firstIndex(_matrix),
                matrix = _matrix.slice(offset);

            actions.receiveValues({
                matrix: matrix,
                max: arrayMax(matrix.map(arrayMax)),
                baseDate: DATE.format("yyyy-mm-dd", DATE.add("day", offset, DATE.fromString("2014-01-01")))
            });
        },
        function (error) {
            console.warn(error);
        }
    );
}

module.exports = {
    getData: getExampleData
};

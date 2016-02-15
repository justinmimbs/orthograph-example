const React = require("react");
const {rectFromRanges} = require("../utilities/view-utilities");
const {pureRenderComponentFromStatelessComponent} = require("../utilities/react-utilities");
const {clamp} = require("../utilities/number-utilities");

// utilities

function localCoordsFromPageCoords(element, pageX, pageY) {
    var bounds = element.getBoundingClientRect(),
        left = bounds.left + window.scrollX,
        top = bounds.top + window.scrollY;
    return [pageX - left, pageY - top];
}

// splitBy((a -> Boolean), [a]) -> [[a]]
// example: (x => x === "-"), [1, 2, 3, "-", 4, 5, 6, "-", 7, 8, 9, 0] -> [[1, 2, 3], [4, 5, 6], [7, 8, 9, 0]]
function splitBy(predicate, array) {
    var lists = [],
        list = null,
        item;
    for (item of array) {
        if (predicate(item)) {
            list = null;
        } else {
            list || lists.push(list = []);
            list.push(item);
        }
    }
    return lists;
}
function coordListsFromArray(mapX, mapY, array) {
    var list = array.map((v, i) => v === undefined ? null : [mapX(v, i), mapY(v, i)]);
    return splitBy(coord => !(coord && typeof coord[0] === "number" && typeof coord[1] === "number"), list);
}
function baselinedCoordList(axis, value, coordList) {
    var first = coordList[0],
        last  = coordList[coordList.length - 1],
        pre  = axis === "x" ? [value, first[1]] : [first[0], value],
        post = axis === "x" ? [value,  last[1]] : [ last[0], value];
    return [pre].concat(coordList, [post]);
}
function pathDataFromCoordList(coordList) {
    return "M" + coordList.map(coord => coord.map(n => n.toFixed(1)).join(",")).join("L");
}

function isBetween(range, value) {
    return (range[0] <= value && value <= range[1])
        || (range[1] <= value && value <= range[0]);
}

// components

function ViewRectangle(props) {
    var rect = {
        x: props.rect.x,
        y: props.rect.y,
        width: props.rect.width + 1,
        height: props.rect.height + 1
    };
    return React.DOM.svg({
            width: rect.width,
            height: rect.height,
            viewBox: [rect.x, rect.y, rect.width, rect.height].join(" ")
        },
        props.children
    );
}
ViewRectangle.propTypes = {
    rect: React.PropTypes.shape({
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    }).isRequired
};

function ParallelLines(props) {
    return React.DOM.g({className: props.className || ""},
        props.values.map(function (value, i) {
            return React.DOM.line({
                key: i,
                x1: props.axis === "x" ? value : props.range[0],
                x2: props.axis === "x" ? value : props.range[1],
                y1: props.axis === "y" ? value : props.range[0],
                y2: props.axis === "y" ? value : props.range[1]
            });
        })
    );
}
ParallelLines.propTypes = {
    className: React.PropTypes.string,
    axis: React.PropTypes.oneOf(["x", "y"]).isRequired,
    values: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    range: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
};

function Grid(props) {
    return React.DOM.g({transform: "translate(" + (props.translate || [0, 0]).join(", ") + ")"},
        // reference lines
        React.createElement(ParallelLines, {
            className: "reference-lines",
            axis: "x",
            values: props.xValues,
            range: props.yRange
        }),
        React.createElement(ParallelLines, {
            className: "reference-lines",
            axis: "y",
            values: props.yValues,
            range: props.xRange
        })
    );
}
Grid.propTypes = {
    translate: React.PropTypes.arrayOf(React.PropTypes.number),
    xValues: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    yValues: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    xRange: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
    yRange: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
};

function LabeledTicks(props) {
    var axis = ["left", "right"].includes(props.orientation) ? "y" : "x",
        direction = ["top", "left"].includes(props.orientation) ? -1 : 1,
        labelFromDomain = props.labelFromDomain || (x => x),
        rangeFromDomain = props.rangeFromDomain || (x => x),
        viewRange = props.viewRange || [-Infinity, Infinity],
        ticks = props.values
            .map(value => ({unit: rangeFromDomain(value), label: labelFromDomain(value)}))
            .filter(tick => isBetween(viewRange, tick.unit));

    return React.DOM.g({transform: "translate(" + (props.translate || [0, 0]).join(", ") + ")"},
        React.createElement(ParallelLines, {className: "ticks", axis: axis, values: ticks.map(tick => tick.unit), range: [0, 4 * direction]}),
        ticks.some(tick => tick.label) ?
            React.DOM.g({className: ["labels", props.orientation].join(" ")},
                ticks.map(function (tick, j) {
                    return React.DOM.text({
                            key: j,
                            x: axis === "x" ? tick.unit : 8 * direction,
                            y: axis === "y" ? tick.unit : 8 * direction
                        },
                        tick.label
                    );
                })
            )
        :
            null
    );
}
LabeledTicks.propTypes = {
    translate: React.PropTypes.arrayOf(React.PropTypes.number),
    orientation: React.PropTypes.oneOf(["top", "right", "bottom", "left"]).isRequired,
    values: React.PropTypes.array.isRequired,
    labelFromDomain: React.PropTypes.func,
    rangeFromDomain: React.PropTypes.func,
    viewRange: React.PropTypes.arrayOf(React.PropTypes.number)
};

function LinePlot(props) {
    var coordLists = coordListsFromArray(props.mapX, props.mapY, props.array),
        d = coordLists.map(pathDataFromCoordList).join(" "); // leave gaps open
        //d = pathDataFromCoordList(Array.prototype.concat.apply([], coordLists)); // connect gaps
    return React.DOM.path({className: props.className || "", d: d});
}
LinePlot.propTypes = {
    className: React.PropTypes.string,
    array: React.PropTypes.array.isRequired,
    mapX: React.PropTypes.func.isRequired,
    mapY: React.PropTypes.func.isRequired
};

function LinePlotArea(props) {
    var baselineValue = (props.baselineAxis === "x" ? props.mapX : props.mapY).call(null, props.baselineValue),
        coordLists = coordListsFromArray(props.mapX, props.mapY, props.array),
        d = coordLists
            .map(baselinedCoordList.bind(null, props.baselineAxis, baselineValue))
            .map(pathDataFromCoordList)
            .join(" ");
    return React.DOM.path({className: props.className || "", d: d});
}
LinePlotArea.propTypes = {
    className: React.PropTypes.string,
    array: React.PropTypes.array.isRequired,
    mapX: React.PropTypes.func.isRequired,
    mapY: React.PropTypes.func.isRequired,
    baselineAxis: React.PropTypes.oneOf(["x", "y"]).isRequired,
    baselineValue: React.PropTypes.number.isRequired
};

function CenteredText(props) {
    var translate = props.translate || [0, 0];
    return React.DOM.text({
            className: props.className || "",
            transform: [
                ["translate(", [
                        translate[0] + props.rect.x + props.rect.width / 2,
                        translate[1] + props.rect.y + props.rect.height / 2
                    ].join(", "), ")"].join(""),
                ["rotate(", props.rotate || "0", ")"].join("")
            ].join(" ")
        },
        props.children
    );
}
CenteredText.propTypes = {
    className: React.PropTypes.string,
    translate: React.PropTypes.arrayOf(React.PropTypes.number),
    rotate: React.PropTypes.number,
    rect: React.PropTypes.shape({
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired
    }).isRequired
};

var BrushingRectangle = React.createClass({
        displayName: "BrushingRectangle",
        propTypes: {
            className: React.PropTypes.string,
            xRange: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
            yRange: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
            xRangeClamp: React.PropTypes.arrayOf(React.PropTypes.number),
            yRangeClamp: React.PropTypes.arrayOf(React.PropTypes.number),
            onBrush: React.PropTypes.func.isRequired
        },
        updateBrushCoords: function (pageX, pageY, start) {
            if (start) {
                this._pageX = pageX;
                this._pageY = pageY;
            }

            var rect = rectFromRanges(this.props.xRange, this.props.yRange),
                coords = localCoordsFromPageCoords(this.refs.rect, pageX, pageY),
                brushX = clamp.apply(null, (this.props.xRangeClamp || this.props.xRange).concat(coords[0] + rect.x)),
                brushY = clamp.apply(null, (this.props.yRangeClamp || this.props.yRange).concat(coords[1] + rect.y));

            if (this._brushX !== brushX || this._brushY !== brushY) {
                this.props.onBrush(brushX, brushY, pageX - this._pageX, pageY - this._pageY); // x, y, dx, dy
                this._brushX = brushX;
                this._brushY = brushY;
                this._pageX = pageX;
                this._pageY = pageY;
            }
        },
        handleMouseDown: function (e) {
            e.preventDefault();
            window.addEventListener("mouseup", this.handleMouseUp);
            window.addEventListener("mousemove", this.handleMouseMove);
            this.updateBrushCoords(e.pageX, e.pageY, true);
        },
        handleMouseMove: function (e) {
            this.updateBrushCoords(e.pageX, e.pageY, false);
        },
        handleMouseUp: function (e) {
            window.removeEventListener("mouseup", this.handleMouseUp);
            window.removeEventListener("mousemove", this.handleMouseMove);
        },
        render: function () {
            var props = this.props,
                rect = rectFromRanges(props.xRange, props.yRange),
                className = ["brushing-rectangle", props.className].filter(x => x).join(" ");
            return React.DOM.rect(Object.assign({ref: "rect", className: className, onMouseDown: this.handleMouseDown}, rect));
        }
    });

module.exports = {
    BrushingRectangle: BrushingRectangle,
    CenteredText: pureRenderComponentFromStatelessComponent(CenteredText),
    Grid: pureRenderComponentFromStatelessComponent(Grid),
    LabeledTicks: pureRenderComponentFromStatelessComponent(LabeledTicks),
    LinePlot: pureRenderComponentFromStatelessComponent(LinePlot),
    LinePlotArea: pureRenderComponentFromStatelessComponent(LinePlotArea),
    ViewRectangle: ViewRectangle
};

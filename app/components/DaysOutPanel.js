const React = require("react");
const {BrushingRectangle, Grid, LabeledTicks, LinePlot, LinePlotArea, ViewRectangle} = require("./graphing-components");
const {emptyString, flipArgs, memoize} = require("../utilities/function-utilities");
const {rectFromRanges} = require("../utilities/view-utilities");

const _flipArgs = memoize(flipArgs);

function DaysOutPanel(props) {
    var xViewRange = props.x.viewRange || props.x.range,
        yViewRange = props.y.viewRange || props.y.range,
        viewRect = rectFromRanges(xViewRange, yViewRange);

    return React.DOM.g({className: props.className},
        React.createElement(ViewRectangle, {rect: viewRect},
            React.createElement(Grid, {
                xValues: props.x.ticks.map(props.x.rangeFromDomain),
                xRange: props.x.range,
                yValues: props.y.ticks.map(props.y.rangeFromDomain),
                yRange: props.y.range
            }),
            React.createElement(LinePlot, {
                className: "line",
                array: props.data,
                mapX: props.x.invertedRangeFromDomain,
                mapY: _flipArgs(props.y.rangeFromDomain)
            }),
            React.createElement(LinePlotArea, {
                className: "area",
                array: props.data,
                mapX: props.x.invertedRangeFromDomain,
                mapY: _flipArgs(props.y.rangeFromDomain),
                baselineAxis: "x",
                baselineValue: props.x.domain[0]
            }),
            React.DOM.line({
                className: [props.y.className, "cursor"].join(" "),
                x1: props.x.range[0],
                x2: props.x.range[1],
                y1: props.y.rangeFromDomain(props.selectedY),
                y2: props.y.rangeFromDomain(props.selectedY)
            }),
            React.DOM.line({
                className: [props.y.className, "cursor", "compared"].join(" "),
                x1: props.x.range[0],
                x2: props.x.range[1],
                y1: props.y.rangeFromDomain(props.comparedY),
                y2: props.y.rangeFromDomain(props.comparedY)
            }),
            React.createElement(BrushingRectangle, {
                xRange: xViewRange,
                yRange: yViewRange,
                xRangeClamp: [0, 0],
                onBrush: props.onBrush
            })
        ),
        // scale lines
        React.createElement(LabeledTicks, {
            translate: [-viewRect.x, 0],
            values: props.x.ticks,
            orientation: "top",
            rangeFromDomain: props.x.invertedRangeFromDomain,
            viewRange: xViewRange
        }),
        React.createElement(LabeledTicks, {
            translate: [0, -viewRect.y],
            values: props.y.ticks,
            orientation: "left",
            rangeFromDomain: props.y.rangeFromDomain,
            labelFromDomain: emptyString,
            viewRange: yViewRange
        }),
        // title
        React.DOM.text({className: "title right", x: viewRect.width - 10, y: 10},
            props.title
        )
    );
}

module.exports = DaysOutPanel;

const React = require("react");
const {BrushingRectangle, Grid, LabeledTicks, LinePlot, LinePlotArea, ViewRectangle} = require("./graphing-components");
const {emptyString, flipArgs, memoize} = require("../utilities/function-utilities");
const {rectFromRanges} = require("../utilities/view-utilities");

const _flipArgs = memoize(flipArgs);

function AsOfDatePanel(props) {
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
                className: "line compared",
                array: props.dataB,
                mapX: _flipArgs(props.x.rangeFromDomain),
                mapY: props.y.rangeFromDomain
            }),
            React.createElement(LinePlot, {
                className: "line",
                array: props.data,
                mapX: _flipArgs(props.x.rangeFromDomain),
                mapY: props.y.rangeFromDomain
            }),
            React.createElement(LinePlotArea, {
                className: "area",
                array: props.data,
                mapX: _flipArgs(props.x.rangeFromDomain),
                mapY: props.y.rangeFromDomain,
                baselineAxis: "y",
                baselineValue: props.y.domain[0]
            }),
            React.DOM.line({
                className: [props.x.className, "cursor"].join(" "),
                x1: props.x.rangeFromDomain(props.selectedX),
                x2: props.x.rangeFromDomain(props.selectedX),
                y1: props.y.range[0],
                y2: props.y.range[1]
            }),
            React.createElement(BrushingRectangle, {
                xRange: xViewRange,
                yRange: yViewRange,
                yRangeClamp: [0, 0],
                onBrush: props.onBrush
            })
        ),
        // scale lines
        React.createElement(LabeledTicks, {
            translate: [0, 0],
            values: props.xSecondary.ticks,
            orientation: "top",
            rangeFromDomain: props.xSecondary.rangeFromDomain,
            labelFromDomain: emptyString
        }),
        React.createElement(LabeledTicks, {
            translate: [-viewRect.x, viewRect.height],
            values: props.x.ticks,
            orientation: "bottom",
            rangeFromDomain: props.x.rangeFromDomain,
            labelFromDomain: props.x.tickLabelFromDomain,
            viewRange: xViewRange
        }),
        React.createElement(LabeledTicks, {
            translate: [viewRect.width, -viewRect.y],
            values: props.y.ticks,
            orientation: "right",
            rangeFromDomain: props.y.rangeFromDomain
        }),
        // title
        React.DOM.text({className: "title", x: 10, y: 10},
            props.title
        )
    );
}

module.exports = AsOfDatePanel;

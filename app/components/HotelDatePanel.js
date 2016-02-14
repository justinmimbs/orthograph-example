const React = require("react");
const {BrushingRectangle, Grid, LabeledTicks, LinePlot, LinePlotArea} = require("./graphing-components");
const {emptyString, flipArgs, memoize} = require("../utilities/function-utilities");

const _flipArgs = memoize(flipArgs);

function HotelDatePanel(props) {
    return React.DOM.g({className: props.className},
        React.createElement(Grid, {
            xValues: props.x.ticks.map(props.x.rangeFromDomain),
            xRange: props.x.range,
            yValues: props.y.ticks.map(props.y.rangeFromDomain),
            yRange: props.y.range
        }),
        props.dataB ?
            React.createElement(LinePlot, {
                className: "line compared",
                array: props.dataB,
                mapX: _flipArgs(props.x.rangeFromDomain),
                mapY: props.y.rangeFromDomain
            })
        :
            null,
        props.data ?
            React.createElement(LinePlot, {
                className: "line",
                array: props.data,
                mapX: _flipArgs(props.x.rangeFromDomain),
                mapY: props.y.rangeFromDomain
            })
        :
            null,
        props.data ?
            React.createElement(LinePlotArea, {
                className: "area",
                array: props.data,
                mapX: _flipArgs(props.x.rangeFromDomain),
                mapY: props.y.rangeFromDomain,
                baselineAxis: "y",
                baselineValue: props.y.domain[0]
            })
        :
            null,
        React.DOM.line({
            className: [props.x.className, "cursor"].join(" "),
            x1: props.x.rangeFromDomain(props.selectedX),
            x2: props.x.rangeFromDomain(props.selectedX),
            y1: props.y.range[0],
            y2: props.y.range[1]
        }),
        React.createElement(BrushingRectangle, {
            xRange: props.x.range,
            yRange: props.y.range,
            yRangeClamp: [0, 0],
            onBrush: props.onBrush
        }),
        // scale lines
        React.createElement(LabeledTicks, {
            translate: [0, Math.max.apply(null, props.y.range)],
            values: props.x.ticks,
            orientation: "bottom",
            rangeFromDomain: props.x.rangeFromDomain,
            labelFromDomain: emptyString
        }),
        React.createElement(LabeledTicks, {
            translate: [Math.max.apply(null, props.x.range), 0],
            values: props.y.ticks,
            orientation: "right",
            rangeFromDomain: props.y.rangeFromDomain,
        }),
        // title
        React.DOM.text({className: "title", x: 10, y: 10},
            props.title
        )
    );
}

module.exports = HotelDatePanel;

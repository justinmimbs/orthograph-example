const React = require("react");
const {BrushingRectangle, Grid, LabeledTicks, ViewRectangle} = require("./graphing-components");
const {rectFromRanges} = require("../utilities/view-utilities");

function imageDataFromFunction(f, width, height) { // f = (x, y) -> [r, g, b, a]
    var imageData = new ImageData(width, height),
        x,
        y,
        i,
        rgba;
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            i = (y * width + x) * 4;
            rgba = f(x, y);
            imageData.data[i + 0] = 255 * rgba[0];
            imageData.data[i + 1] = 255 * rgba[1];
            imageData.data[i + 2] = 255 * rgba[2];
            imageData.data[i + 3] = 255 * rgba[3];
        }
    }
    return imageData;
}

function dataURIFromImageData(imageData) {
    var canvas = document.createElement("canvas"),
        context = canvas.getContext("2d");

    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
}

var MatrixDataPlot = React.createClass({
        displayName: "MatrixDataPlot",
        /*propTypes: {
            xMax: React.PropTypes.number.isRequired,
            yMax: React.PropTypes.number.isRequired,
            zMax: React.PropTypes.number.isRequired,
            data: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.number)).isRequired
        },*/
        shouldComponentUpdate: function (nextProps) {
            return this.props.xMax !== nextProps.xMax
                || this.props.yMax !== nextProps.yMax
                || this.props.zMax !== nextProps.zMax
                || this.props.data !== nextProps.data;
        },
        render: function () {
            var props = this.props,
                xMax = props.xMax,
                yMax = props.yMax,
                zMax = props.zMax,
                imageData = imageDataFromFunction(
                    function rgbaFromXY(x, y) {
                        var value = props.data[yMax - y] ? props.data[yMax - y][xMax - x] / zMax : null;
                        return !value ? [0.2, 0.2, 0.2, 0] : [0.2, 0.2, 0.2, value];
                    },
                    xMax,
                    yMax
                );
            return React.DOM.image({width: xMax, height: yMax, xlinkHref: dataURIFromImageData(imageData)});
        }
    });

function MatrixPanel(props) {
    var xViewRange = props.x.viewRange || props.x.range,
        yViewRange = props.y.viewRange || props.y.range,
        viewRect = rectFromRanges(xViewRange, yViewRange);

    return React.DOM.g(null,
        React.createElement(ViewRectangle, {rect: viewRect},
            React.createElement(Grid, {
                xValues: props.x.ticks.map(props.x.rangeFromDomain),
                xRange: props.x.range,
                yValues: props.y.ticks.map(props.y.rangeFromDomain),
                yRange: props.y.range
            }),
            React.createElement(MatrixDataPlot, {
                xMax: Math.max.apply(null, props.x.domain),
                yMax: Math.max.apply(null, props.y.domain),
                zMax: Math.max.apply(null, props.z.domain),
                data: props.data
            }),
            React.DOM.line({
                className: [props.x.className, "cursor"].join(" "),
                x1: props.x.rangeFromDomain(props.selectedX),
                x2: props.x.rangeFromDomain(props.selectedX),
                y1: props.y.range[0],
                y2: props.y.range[1]
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
            React.DOM.line({
                className: [props.v.className, "cursor"].join(" "),
                x1: props.x.range[0],
                x2: props.x.range[1],
                y1: props.y.rangeFromDomain(props.selectedV),
                y2: props.y.rangeFromDomain(props.selectedV + Math.abs(props.x.range[0] - props.x.range[1]))
            }),
            React.DOM.line({
                className: [props.v.className, "cursor", "compared"].join(" "),
                x1: props.x.range[0],
                x2: props.x.range[1],
                y1: props.y.rangeFromDomain(props.comparedV),
                y2: props.y.rangeFromDomain(props.comparedV + Math.abs(props.x.range[0] - props.x.range[1]))
            }),
            React.createElement(BrushingRectangle, {
                xRange: xViewRange,
                yRange: yViewRange,
                onBrush: props.onBrush
            })
        ),
        // scale lines
        React.createElement(LabeledTicks, {
            translate: [-viewRect.x, 0],
            values: props.x.ticks,
            orientation: "top",
            rangeFromDomain: props.x.rangeFromDomain,
            viewRange: xViewRange
        }),
        React.createElement(LabeledTicks, {
            translate: [-viewRect.x, viewRect.height],
            values: props.x.ticks,
            orientation: "bottom",
            rangeFromDomain: props.x.rangeFromDomain,
            viewRange: xViewRange
        }),
        React.createElement(LabeledTicks, {
            translate: [viewRect.width, -viewRect.y],
            values: props.y.ticks,
            orientation: "right",
            rangeFromDomain: props.y.rangeFromDomain,
            labelFromDomain: props.y.tickLabelFromDomain,
            viewRange: yViewRange
        })
    );
}

module.exports = MatrixPanel;

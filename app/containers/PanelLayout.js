const React = require("react");
const {BrushingRectangle, CenteredText} = require("../components/graphing-components");
const {rectFromRanges} = require("../utilities/view-utilities");
const AsOfDatePanel = require("../components/AsOfDatePanel");
const DaysOutPanel = require("../components/DaysOutPanel");
const HotelDatePanel = require("../components/HotelDatePanel");
const MatrixPanel = require("../components/MatrixPanel");
const store = require("../store/store");
const select = require("../store/select");
const actions = require("../store/actions");

var PanelLayout = React.createClass({
        displayName: "PanelLayout",
        stateChanged: function () {
            this.setState(store.state());
        },
        handleBrushHotelDate: function (x) {
            var xDimension = select.xDimension(this.state);
            actions.selectPosition({x: xDimension.domainFromRange(x)});
        },
        handleBrushDaysOut: function (x, y) {
            var yDimension = select.yDimension(this.state);
            actions.selectPosition({y: yDimension.domainFromRange(y)});
        },
        handleBrushMatrix: function (x, y) {
            var xDimension = select.xDimension(this.state),
                yDimension = select.yDimension(this.state);
            actions.selectPosition({
                x: xDimension.domainFromRange(x),
                y: yDimension.domainFromRange(y)
            });
        },
        handleBrushAsOfDate: function (x) {
            var vDimension = select.vDimension(this.state);
            actions.selectPosition({
                x: vDimension.domainFromRange(x),
                constrainV: true
            });
        },
        handleBrushScrollY: function (x, y, dx, dy) {
            actions.scrollView({dy: dy})
        },

        getInitialState: function () {
            return store.state();
        },
        componentDidMount: function () {
            store.connect(this.stateChanged);
        },
        componentWillUnmount: function () {
            store.disconnect(this.stateChanged)
        },
        render: function () {
            if (!this.state.values) {
                return null;
            }

            var gutter = {
                    width: 40,
                    height: 24
                },
                state = this.state,
                x = select.xDimension(state),
                y = select.yDimension(state),
                z = select.zDimension(state),
                v = select.vDimension(state),
                translate = function (coords) {
                    return "translate(" + coords.join(", ") + ")";
                },
                distance = function (range) {
                    return Math.abs(range[1] - range[0]);
                };

            return React.DOM.svg({
                    width: gutter.width * 3 + distance(x.range) + distance(z.range),
                    height: gutter.height * 5 + distance(z.range) * 2 + distance(y.viewRange)
                },
                // matrix
                React.DOM.g({transform: translate([gutter.width, gutter.height * 2 + distance(z.range)])},
                    React.createElement(CenteredText, {className: "axis-label", rect: rectFromRanges([0, -gutter.width], [0, distance(y.viewRange)]), rotate: -90},
                        y.name
                    ),
                    React.createElement(MatrixPanel, {
                            x: x,
                            y: y,
                            z: z,
                            v: v,
                            data: select.yxzMatrix(state),
                            selectedX: state.ui.selectedX,
                            selectedY: state.ui.selectedY,
                            comparedY: select.comparedY(state),
                            selectedV: select.selectedV(state),
                            comparedV: select.comparedV(state),
                            onBrush: this.handleBrushMatrix
                        }
                    )
                ),
                // hotel date
                React.DOM.g({transform: translate([gutter.width, gutter.height])},
                    React.createElement(CenteredText, {className: "axis-label", rect: rectFromRanges(x.range, [0, -gutter.height])},
                        x.name
                    ),
                    React.createElement(CenteredText, {className: "axis-label", rect: rectFromRanges([0, -gutter.width], z.range), rotate: -90},
                        z.name
                    ),
                    React.createElement(HotelDatePanel, {
                            className: y.className,
                            x: x,
                            y: z,
                            data: select.xzVectorForSelectedY(state),
                            dataB: select.xzVectorForComparedY(state),
                            selectedX: state.ui.selectedX,
                            title: y.name + ": " + y.labelFromDomain(state.ui.selectedY),
                            onBrush: this.handleBrushHotelDate
                        }
                    )
                ),
                // days out
                React.DOM.g({transform: translate([gutter.width * 2 + distance(x.range), gutter.height * 2 + distance(z.range)])},
                    React.createElement(CenteredText, {className: "axis-label", rect: rectFromRanges(z.range, [0, -gutter.height]), translate: [0, -gutter.height]},
                        z.name
                    ),
                    React.createElement(DaysOutPanel, {
                            className: x.className,
                            x: z,
                            y: y,
                            data: select.yzVectorForSelectedX(state),
                            selectedY: state.ui.selectedY,
                            comparedY: select.comparedY(state),
                            title: x.name + ": " + x.labelFromDomain(state.ui.selectedX),
                            onBrush: this.handleBrushDaysOut
                        }
                    )
                ),
                // scroll y
                React.DOM.g({transform: translate([gutter.width + distance(x.range), gutter.height * 2 + distance(z.range)])},
                    React.createElement(BrushingRectangle, {
                        xRange: [0, gutter.width],
                        yRange: [0, distance(y.viewRange)],
                        xRangeClamp: [0, 0],
                        yRangeClamp: [-Infinity, Infinity],
                        onBrush: this.handleBrushScrollY
                    })
                ),
                // as of date
                React.DOM.g({transform: translate([gutter.width, gutter.height * 3 + distance(z.range) + distance(y.viewRange)])},
                    React.createElement(CenteredText, {className: "axis-label", rect: rectFromRanges([0, distance(v.viewRange)], [0, gutter.height]), translate: [0, distance(z.range) + gutter.height]},
                        y.name
                    ),
                    React.createElement(CenteredText, {className: "axis-label", rect: rectFromRanges([0, -gutter.width], z.range), rotate: -90},
                        z.name
                    ),
                    React.createElement(AsOfDatePanel, {
                            className: v.className,
                            x: v,
                            y: z,
                            xSecondary: x,
                            data: select.vzVectorForSelectedV(state),
                            dataB: select.vzVectorForComparedV(state),
                            selectedX: state.ui.selectedX,
                            title: v.name + ": " + v.labelFromDomain(select.selectedV(state)),
                            onBrush: this.handleBrushAsOfDate
                        }
                    )
                )
            );
        }
    });

module.exports = PanelLayout;

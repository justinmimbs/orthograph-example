const React = require("react");
const R = require("ramda");

function pureRenderComponentFromStatelessComponent(f) {
    return React.createClass({
        displayName: f.name,
        propTypes: f.propTypes,
        defaultProps: f.defaultProps,
        shouldComponentUpdate: function (nextProps) {
            return !R.equals(this.props, nextProps);
        },
        render: function () {
            return f(this.props);
        }
    });
}

module.exports = {
    pureRenderComponentFromStatelessComponent: pureRenderComponentFromStatelessComponent
};

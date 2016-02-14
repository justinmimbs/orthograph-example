const React = require("react");
const ReactDOM = require("react-dom");
const PanelLayout = require("./containers/PanelLayout");
const services = require("./services/services");

function init() {
    services.getData();
    ReactDOM.render(React.createElement(PanelLayout), document.querySelector("#output"));
}

window.addEventListener("DOMContentLoaded", init);

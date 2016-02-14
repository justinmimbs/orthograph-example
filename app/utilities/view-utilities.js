function rectFromRanges(xRange, yRange) {
    return {
        width: Math.abs(xRange[1] - xRange[0]),
        height: Math.abs(yRange[1] - yRange[0]),
        x: Math.min.apply(null, xRange),
        y: Math.min.apply(null, yRange)
    };
}

module.exports = {
    rectFromRanges: rectFromRanges
};

# orthograph-example

Example of an orthographic presentation for data in three dimensions.

## The presentation

A central panel shows two dimensions of values plotted on a Cartesian plane, and a third dimension presented in a color scale (using grayscale in this example). The central panel serves as a bird's-eye view of the data, allowing for observation of patterns and an intuition for the dataset as a whole.

To also show the color-scale dimension spatially, the central panel is augmented by panels that plot slices of the dataset as line graphs. Each line graph is shown in its own color, and correspondingly colored "cursor" lines appear in other panels to denote their relationships.

On all panels, these cursors can be dragged to scrub through slices of data.

## The example

This example tracks a hotel's total number of occupied rooms (_Room Nights_) reserved for every night of a timeframe (_Hotel Date_) as it changes every day leading up to that Hotel Date (_Days Out_).

In the central panel, one can observe the long dark "tails," showing times of year more popular to reserve further in advance.

Dashed lines represent data for the _same time last year_, to allow for such comparisons in the surrounding panels.

In this example, there is more data for the vertical Hotel Date dimension than can be displayed at once, so its viewable range is cropped; but it can be scrolled through by vertically dragging the Hotel Date labels, which are just to the right of the central panel.

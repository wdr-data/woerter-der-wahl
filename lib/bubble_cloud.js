import * as d3 from "d3";

/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */
export default function() {
    // Constants for sizing
    const width = 840;
    const height = 600;
    const maxRadius = 85;

    // Locations to move bubbles towards, depending
    // on which view mode is selected.
    const center = { x: width / 2, y: height / 2 };

    // @v4 strength to apply to the position forces
    const forceStrength = 0.04;

    // These will be set in create_nodes and create_vis
    let svg = null;
    let bubbles = null;
    let nodes = [];

    // Here we create a force layout and
    // @v4 We create a force simulation now and
    //  add forces to it.

    const simulation = d3.forceSimulation()
        .force('collide', d3.forceCollide(d => d.radius + 1).iterations(16))
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        .force('y', d3.forceY().strength(forceStrength*3).y(center.y))
        .on('tick', ticked);

    // @v4 Force starts up automatically,
    //  which we don't want as there aren't any nodes yet.
    simulation.stop();

    /*
     * This data manipulation function takes the raw data from
     * the CSV file and converts it into an array of node objects.
     * Each node will store data and visualization values to visualize
     * a bubble.
     *
     * rawData is expected to be an array of data objects, read in from
     * one of d3's loading functions like d3.csv.
     *
     * This function returns the new node array, with a node in that
     * array for each element in the rawData input.
     */
    function createNodes(rawData) {
        // Use the max total_amount in the data as the max in the scale's domain
        // note we have to ensure the total_amount is a number.
        const maxAmount = d3.max(rawData, function (d) { return +d.count; });

        // Sizes bubbles based on area.
        // @v4: new flattened scale names.
        const radiusScale = d3.scalePow()
            .exponent(0.5)
            .range([20, maxRadius])
            .domain([0, maxAmount]);

        // Use map() to convert raw data into node data.
        // Checkout http://learnjsdata.com/ for more on
        // working with data.
        const myNodes = rawData.map(function (d) {
            return {
                id: d.id,
                radius: radiusScale(+d.count),
                value: d.count,
                name: d.word,
                x: Math.random() * width + (Math.random()*2-1)*100,
                y: Math.random() * height + (Math.random()*2-1)*100
            };
        });

        // sort them to prevent occlusion of smaller nodes.
        myNodes.sort(function (a, b) { return b.value - a.value; });

        return myNodes;
    }

    /*
     * Callback function that is called after every tick of the
     * force simulation.
     * Here we do the acutal repositioning of the SVG circles
     * based on the current x and y values of their bound node data.
     * These x and y values are modified by the force simulation.
     */
    function ticked() {
        bubbles
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; });
    }

    /*
     * Main entry point to the bubble chart. This function is returned
     * by the parent closure. It prepares the rawData for visualization
     * and adds an svg element to the provided selector and starts the
     * visualization creation process.
     *
     * selector is expected to be a DOM element or CSS selector that
     * points to the parent element of the bubble chart. Inside this
     * element, the code will add the SVG continer for the visualization.
     *
     * rawData is expected to be an array of data objects as provided by
     * a d3 loading function like d3.csv.
     */
    return function chart(selector, rawData) {
        // convert raw data into nodes data
        nodes = createNodes(rawData);

        // Create a SVG element inside the provided selector
        // with desired size.
        svg = d3.select(selector)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Bind nodes data to what will become DOM elements to represent them.
        bubbles = svg.selectAll('.bubble')
            .data(nodes, function (d) { return d.id; });

        // Create new circle elements each with class `bubble`.
        // There will be one circle.bubble for each object in the nodes array.
        // Initially, their radius (r attribute) will be 0.
        // @v4 Selections are immutable, so lets capture the
        //  enter selection to apply our transtition to below.
        let selectedNode = null;
        const bubblesE = bubbles.enter().append('circle')
            .classed('bubble', true)
            .attr('r', 0)
            .on('click', function() {
                if(selectedNode && this == selectedNode.node()) {
                    return;
                }

                if(selectedNode) {
                    selectedNode
                        .classed('selected', false)
                        .transition()
                        .duration(100)
                        .attr('r', d => d.radius);
                }
                selectedNode = d3.select(this)
                    .classed('selected', true);

                selectedNode.transition()
                    .duration(1000)
                    .attr('r', d => maxRadius);

                const bubbleId = selectedNode.data()[0].id;
                simulation.force('collide').radius(d => d.radius + (d.id == bubbleId ? 200 : 1));
                simulation.force('x').strength(d => d.id == bubbleId ? 0.1 : forceStrength);
                simulation.force('y').strength(d => d.id == bubbleId ? 0.3 : forceStrength*3);
                simulation.alpha(1).restart();
            });

        // @v4 Merge the original empty selection and the enter selection
        bubbles = bubbles.merge(bubblesE);

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        bubbles.transition()
            .duration(2000)
            .attr('r', function (d) { return d.radius; });

        // Set the simulation's nodes to our newly created nodes array.
        // @v4 Once we set the nodes, the simulation will start running automatically!
        simulation.nodes(nodes);

        simulation.alpha(1).restart();
    };
}

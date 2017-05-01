import d3Select from "d3-selection/src/select";
import d3ScalePow from 'd3-scale/src/pow';
import d3ForceSimulation from 'd3-force/src/simulation';
import d3ForceCollide from 'd3-force/src/collide';
import d3ForceX from 'd3-force/src/x';
import d3ForceY from 'd3-force/src/y';
import d3Min from 'd3-array/src/min';
import d3Max from 'd3-array/src/max';
import 'd3-transition';
import zipObject from 'lodash/zipObject';
import debounce from 'lodash/debounce';

/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */
export default function(elem, partyMap) {
    // Constants for sizing
    const maxRadius = 85;
    const maxFontSize = 30;

    let width;
    let height;
    let center;

    // @v4 strength to apply to the position forces
    const forceStrength = 0.04;
    let forceStrengthX, forceStrengthY = forceStrength;

    // These will be set in create_nodes and create_vis
    const sel = d3Select(elem);
    if(sel.empty()) {
        throw new Error("DOM target node not found");
    }

    let svg = null;
    let bubbles = null;
    let texts = null;
    let nodes = [];
    let centerBorder = null;
    let simulation;

    let bubbleGroup;
    let textBox;
    let backButton;
    let partyGroup;
    let partyText;
    let partySim;
    let dataById = {};
    let dataMin, dataMax;

    function mapNodes(options) {
        const valKey = options.valKey || 'share';
        const nameKey = options.nameKey || 'word';
        const radiusScale = options.scales.radius || (() => 0);
        const fontScale = options.scales.font || (() => 0);
        const randX = options.randX || (() => Math.random() * width + (Math.random()*2-1)*100);
        const randY = options.randY || (() => Math.random() * height + (Math.random()*2-1)*100);

        return function(data) {
            const radius = data.radius || radiusScale(+data[valKey]);
            return {
                id: data.id,
                radius: radius,
                fontSize: fontScale(+data[valKey]),
                value: data[valKey],
                name: data[nameKey],
                x: randX(data, radius),
                y: randY(data, radius)
            };
        };
    }

    const getScales = function(options) {
        const radiusMin = options.minRadius || 25;
        const radiusMax = options.maxRadius || maxRadius;
        const fontSizeMin = options.minFontSize || 10;
        const fontSizeMax = options.maxFontSize || maxFontSize;
        const minAmount = options.minAmount || dataMin;
        const maxAmount = options.maxAmount || dataMax;

        return {
            radius: d3ScalePow()
                .exponent(0.5)
                .range([radiusMin, radiusMax])
                .domain([minAmount, maxAmount]),
            font: d3ScalePow()
                .exponent(0.5)
                .range([fontSizeMin, fontSizeMax])
                .domain([minAmount, maxAmount])
        }
    };

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
    function createNodes(rawData, options) {
        options = options || {};

        options.scales = getScales(options);

        // Use map() to convert raw data into node data.
        const myNodes = rawData.map(mapNodes(options));

        // sort them to prevent occlusion of smaller nodes.
        myNodes.sort(function (a, b) { return b.value - a.value; });

        return myNodes;
    }

    const getWordLeft = function(d, enabled) {
        return d.x
            - (enabled ? maxRadius : d.radius)
            - 10
            + 'px';
    };

    const getWordWidth = function(d, enabled) {
        return (enabled ? maxRadius : d.radius) * 2
            + 20
            + 'px';
    };

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

        texts
            .style('left', d => getWordLeft(d, selectedNode === d.id))
            .style('top', function(d) {
                const box = this.getBoundingClientRect();
                return (d.y - box.height/2) + 'px';
            });

        if(selectedNode !== null) {
            const currentNode = sel.select('#bubble-'+selectedNode).datum();
            partySim.force('x').x(currentNode.x);
            partySim.force('y').y(currentNode.y);
            partySim.alpha(simulation.alpha()*1.5 + 0.2).restart();
            centerBorder
                .attr('cx', currentNode.x)
                .attr('cy', currentNode.y);
            backButton.style('left', currentNode.x + maxRadius/1.5 + 'px')
                .style('top', currentNode.y - maxRadius*1.5 + 'px');
        }
    }

    const scaleBubble = function(id, enabled) {
        const bubble = sel.select('#bubble-'+id);
        const word = sel.select('#word-'+id);

        const duration = enabled ? 1000 : 100;
        bubble
            .classed('selected', enabled)
            .transition()
            .duration(duration)
            .attr('r', d => enabled ? maxRadius : d.radius);
        word
            .style('width', d => getWordWidth(d, enabled))
            .classed('selected', enabled)
            .transition()
            .duration(duration)
            .style('font-size', d => (enabled ? maxFontSize : d.fontSize) + 'px');
    };

    let selectedNode = null;
    const selectNode = function(node) {
        const id = node ? node.id : null;
        if(selectedNode === id) {
            return;
        }

        const selection = (id !== null);

        if(selectedNode !== null) {
            scaleBubble(selectedNode, false);
        }

        backButton.classed('shown', selection);

        if(!selection) {
            selectedNode = null;
            simulation.force('collide').radius(d => d.radius + 1);
            simulation.force('x').strength(forceStrengthX);
            simulation.force('y').strength(forceStrengthY);
        } else {
            selectedNode = id;
            scaleBubble(id, true);
            simulation.force('collide').radius(d => d.id == id ? maxRadius+200 : d.radius+1);
            simulation.force('x').strength(d => d.id == id ? 0.3 : forceStrengthX);
            simulation.force('y').strength(d => d.id == id ? 0.3 : forceStrengthY);
        }

        simulation.alpha(1).restart();
    };

    const formatPercentage = function(val, fixed) {
        fixed = fixed === undefined ? 2 : fixed;
        return Number(val*100).toFixed(fixed) + '%';
    };

    const updateVisualisation = function(nodes) {
        // Bind nodes data to what will become DOM elements to represent them.
        bubbles = bubbleGroup
            .selectAll('.bubble')
            .data(nodes, function (d) { return d.id; });

        bubbles.exit()
            .remove();

        // Create new circle elements each with class `bubble`.
        // There will be one circle.bubble for each object in the nodes array.
        // Initially, their radius (r attribute) will be 0.
        // @v4 Selections are immutable, so lets capture the
        //  enter selection to apply our transtition to below.
        bubbles = bubbles.enter()
            .append('circle')
            .classed('bubble', true)
            .attr('r', 0)
            .on('click', function() {
                sel.node().dispatchEvent(new CustomEvent('word-click', {
                    detail: d3Select(this).datum()
                }));
            })
            .merge(bubbles)
            .attr('id', d => 'bubble-' + d.id)
            .classed('value-null', d => d.value === 0);

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        bubbles.transition()
            .duration(2000)
            .attr('r', function (d) { return d.id == selectedNode ? maxRadius : d.radius; });

        // Make text
        texts = textBox
            .classed('text-container', true)
            .selectAll('.word')
            .data(nodes, d => d.id);

        texts.exit().remove();

        const textsE = texts.enter()
            .append('div')
            .classed('word', true);

        textsE
            .append('span')
            .classed('content', true)
            .text(d => d.name);

        texts = textsE.merge(texts)
            .attr('id', d => 'word-' + d.id)
            .classed('value-null', d => d.value === 0)
            .style('width', d => getWordWidth(d, d.id == selectedNode))
            .style('font-size', d => (d.id == selectedNode ? maxFontSize : d.fontSize) + 'px');
    };

    const partyTicked = function() {
        svg.selectAll('.partyBubble')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        partyText.selectAll('.word')
            .style('left', d => getWordLeft(d))
            .style('top', function(d) {
                const box = this.getBoundingClientRect();
                return (d.y - box.height/2) + 'px';
            });
    };

    const setupPartySim = function() {
        partySim = d3ForceSimulation()
            .force('collide', d3ForceCollide(d => d.radius + 1).iterations(16))
            .force('x', d3ForceX().strength(d => d.id == 'ghost' ? 0.4 : 0.04).x(center.x))
            .force('y', d3ForceY().strength(d => d.id == 'ghost' ? 0.4 : 0.04).y(center.y))
            .on('tick', partyTicked);

        partySim.stop();
    };

    const createPartySim = function(word) {
        const shareSum = Object.keys(word.party_counts).reduce((sum, k) => sum + word.party_counts[k], 0);
        const data = Object.keys(word.party_counts).map(k => {
            return {
                id: k,
                name: partyMap[k],
                share: word.party_counts[k] / shareSum
            }
        }).concat([{
            id: 'ghost',
            name: '',
            radius: maxRadius + 10,
            share: 0
        }]);

        const nodes = createNodes(data, {
            nameKey: 'name',
            minRadius: 5,
            maxRadius: 45,
            minAmount: d3Min(data, d => +d['share']),
            maxAmount: d3Max(data, d => +d['share']),
            randX: (d, r) => r / 45 * width * 1.5 - width,
            randY: (d, r) => r / 45 * height * 2 - height/2
        });

        partyGroup.selectAll('.partyBubble')
            .remove();
        partyGroup.selectAll('.partyBubble')
            .data(nodes, d => d.id)
            .enter()
            .append('circle')
            .attr('class', d => 'partyBubble party-'+d.id)
            .attr('r', d => d.radius)
            .on('click', function() {
                sel.node().dispatchEvent(new CustomEvent('party-click', {
                    detail: d3Select(this).datum()
                }));
            });

        partyText.selectAll('.word')
            .remove();
        const textE = partyText.selectAll('.word')
            .data(nodes, d => d.id)
            .enter()
            .append('div')
            .attr('id', d => 'word-' + d.id)
            .classed('word', true)
            .style('width', d => d.radius*2+20 + 'px')
            .style('font-size', d => d.fontSize + 'px');
        textE.append('span')
            .classed('content', true)
            .text(d => d.name);

        // create disclaimer for when word not in party
        const not_in = Object.keys(partyMap)
            .filter(k => !(k in word.party_counts) || word.party_counts[k] === 0)
            .map(k => partyMap[k]);
        if(not_in.length > 0) {
            partyText.selectAll('.not_in')
                .remove();
            partyText.append('div')
                .classed('not_in', true)
                .text("So nicht in: " + not_in.join(', '));
        }

        partySim.nodes(nodes);
        partySim.alpha(1).restart();
    };

    const destroyPartySim = function() {
        partyGroup.selectAll('.partyBubble')
            .remove();
        partyText.selectAll('.word')
            .remove();
        partyText.selectAll('.not_in')
            .remove();
    };

    const setData = function(rawData, maxValueGlobal) {
        dataById = zipObject(rawData.map(d => d.id), rawData);

        // Use the max total_amount in the data as the max in the scale's domain
        // note we have to ensure the total_amount is a number.
        dataMin = d3Min(rawData, d => +d['share']);
        dataMax = maxValueGlobal || d3Max(rawData, d => +d['share']);

        // convert raw data into nodes data
        nodes = createNodes(rawData);

        updateVisualisation(nodes);

        // Set the simulation's nodes to our newly created nodes array.
        // @v4 Once we set the nodes, the simulation will start running automatically!
        simulation.nodes(nodes);

        simulation.alpha(1).restart();
        if(selectedNode !== null) {
            partySim.alpha(1).restart();
        }
    };

    const addNode = function(data) {
        dataById[data.id] = data;

        dataMin = dataMin !== undefined ? Math.min(data.share, dataMin) : data.share;
        dataMax = dataMax !== undefined ? Math.max(data.share, dataMax) : data.share;

        const scales = getScales({});
        nodes.map(d => {
            d.radius = scales.radius(+d.value);
            d.fontSize = scales.font(+d.value);
            return d;
        });
        nodes.push(mapNodes({ scales })(data));

        updateVisualisation(nodes);

        simulation.nodes(nodes);
        simulation.alpha(1).restart();
    };

    const sizeGraph = function() {
        const bbox = sel.node().getBoundingClientRect();

        width = bbox.width;
        height = bbox.height;
        center = { x: width / 2, y: height / 2.2 };

        forceStrengthX = forceStrength * (height/400) * 2;
        forceStrengthY = forceStrength * (width/400) * 2;

        svg.attr('width', width)
            .attr('height', height);

        if(simulation) {
            simulation.force('x').x(center.x).strength(forceStrengthX);
            simulation.force('y').y(center.y).strength(forceStrengthY);
            simulation.alpha(1).restart();
        }
    };

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
    const chart = function() {
        // Create a SVG element inside the provided selector
        svg = sel.append('svg');

        sizeGraph();

        // Here we create a force layout and
        // @v4 We create a force simulation now and
        //  add forces to it.
        simulation = d3ForceSimulation()
            .force('collide', d3ForceCollide(d => d.radius + 1).iterations(16))
            .force('x', d3ForceX().strength(forceStrengthX).x(center.x))
            .force('y', d3ForceY().strength(forceStrengthY).y(center.y))
            .on('tick', ticked);

        // @v4 Force starts up automatically,
        //  which we don't want as there aren't any nodes yet.
        simulation.stop();

        setupPartySim();

        bubbleGroup = svg.append('g');
        partyGroup = svg.append('g');

        textBox = sel.append('div');
        backButton = sel.append('a')
            .text("Zurück")
            .classed('overlay-button', true)
            .on('click', () => {
                sel.node().dispatchEvent(new Event('back-click'));
            });

        // Add circle for border around selected bubble
        centerBorder = svg.append('circle')
            .classed('center-border', true)
            .attr('r', maxRadius + 200);

        partyText = sel.append('div')
            .classed('text-container', true)
            .classed('party-bubbles', true);
    };
    chart();

    window.addEventListener('resize', debounce(() => {
        sizeGraph();
    }, 500));

    return {
        setData: setData,
        addNode: addNode,
        selectNode: selectNode,
        createPartyBubbles: createPartySim,
        destroyPartyBubbles: destroyPartySim
    };
}

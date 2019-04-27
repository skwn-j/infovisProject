let svgForce = d3.select('#force').append('svg')
    .attr('width', svgForceWidth)
    .attr('height', svgForceHeight);

function initForceGraph(nodes, links) {
    svgForce.selectAll('*').remove();
    let link = svgForce.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.9)
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', 1);

    let node = svgForce.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', 7)
        .style('fill', (d, i) => colorStack(i))

    node.append('title').text(d => d.id)


    let simulation = forceSimulation(nodes, links).on("tick", ticked);

    function ticked() {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    }
}


function forceSimulation(nodes, links) {
    return d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(d => time2Dist(d)).strength(d => weight2Force(
            d)))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(250, 200));
}

function weight2Force(d) {
    return 1
    //return 1+1/console.log(Math.sqrt(d.source.weight * d.target.weight));
}

function time2Dist(d) {
    let splitTime = d.avgTimediff.split(":")
    let value = 3600 * parseInt(splitTime[0]) + 60 * parseInt(splitTime[1]) + parseFloat(splitTime[2]) + 1
    //console.log(value)
    return 2*value
    //return Math.sqrt(value)
    //distance

}
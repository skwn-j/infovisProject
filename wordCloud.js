let svgCloud = d3.select('#cloud').append('svg')
    .attr('width', svgCloudWidth)
    .attr('height', svgCloudHeight)
    .append('g')
    .attr('transform', translate(svgCloudWidth / 2, svgCloudHeight / 2));

let svgSpeeches = d3.select('#speeches').append('svg')
    .attr('width', svgCloudWidth)
    .attr('height', svgCloudHeight)
    .append('g')
    .attr('transform', translate(0, margin.top));

function initWordCloud(wordRank, speeches) {
    svgCloud.selectAll('*').remove();
    let arrdata = Object.entries(wordRank)
    let data = arrdata.map(function (d) {
        return {
            text: d[0],
            size: d[1]
        }
    })
    d3.layout.cloud().size([cloudWidth, cloudHeight]).words(data)
        //.rotate(function() { return ~~(Math.random() * 2) * 90; })
        .rotate(0)
        .font("Impact")
        .fontSize(function (d) {
            return d3.max([Math.pow(Math.floor(d.size * 4), 2), 16]);
        })
        .on("end", d => draw(d, speeches))
        .start();

    function draw(words, speeches) {
        //console.log(speeches)
        let clouds = svgCloud
            .selectAll(".word")
            .data(words);

        clouds.exit().remove();
        let newClouds = clouds.enter()
            .append("text")
            .attr('class', d => 'word ' + d.text)
            .style("font-size", function (d) {
                return d.size + "px";
            })
            .style("font-family", "Impact")
            .style("fill", function (d, i) {
                return d3.schemeAccent[7];
            })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {

                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.text;
            })
            .on('mouseover', function (d) {
                let includings = speeches.filter(function (s) {
                    let sp = Object.values(s);
                    return sp[1].includes(d.text);
                })
                let originalParts = svgLegend.selectAll('.nameLegend').data();
                let included = svgSpeeches.selectAll('.includings')
                .data(includings)
                .enter()
                .append('g')
                .attr('class', 'includings')
                .attr('transform', (d, i) => translate(0, i * 20));
                //console.log(includings)
                included.append('text')
                .attr('x', 0)
                .attr('y', 10)
                .text(d => d.name + ": " + d.speech)
                .style('fill', (d, i) => d3.schemeAccent[originalParts.indexOf(d.name)])
            })
            .on('mouseleave', function(d) {
                svgSpeeches.selectAll('*').remove();
            })
        clouds.transition()
            .style("font-size", function (d) {
                return d.size + "px";
            })
            .style("font-family", "Impact")
            .style("fill", function (d, i) {
                return d3.schemeAccent[7];
            })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {

                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.text;
            });
        newClouds.selectAll('text').transition()
    }
}
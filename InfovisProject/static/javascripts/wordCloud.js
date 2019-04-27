let svgCloud = d3.select('#cloud').append('svg')
    .attr('width', svgCloudWidth)
    .attr('height', svgCloudHeight)
    .append('g')
    .attr('transform', translate(svgCloudWidth / 2, svgCloudHeight / 2));

function initWordCloud(wordRank) {
    svgCloud.selectAll('*').remove();
    let arrdata = Object.entries(wordRank)
    let data = arrdata.map(function (d) {
        return {
            text: d[0],
            size: d[1]
        }
    })
    console.log(data);
    d3.layout.cloud().size([cloudWidth, cloudHeight]).words(data)
        //.rotate(function() { return ~~(Math.random() * 2) * 90; })
        .rotate(0)
        .font("Impact")
        .fontSize(function (d) {
            return Math.pow(Math.floor(d.size * 5), 2);
        })
        .on("end", draw)
        .start();


    function draw(words) {
        console.log(words);
        let clouds = svgCloud
            .selectAll("text")
            .data(words);

        clouds.exit().remove();

        let newClouds = clouds.enter()
            .append("text")
            .style("font-size", function (d) {
                return d.size + "px";
            })
            .style("font-family", "Impact")
            .style("fill", function (d, i) {
                return colorStack(i);
            })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                console.log(d);
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.text;
            });

        clouds.transition()
            .style("font-size", function (d) {
                return d.size + "px";
            })
            .style("font-family", "Impact")
            .style("fill", function (d, i) {
                return colorStack(i);
            })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                console.log(d);
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.text;
            });


        newClouds.selectAll('text').transition()

    }


}
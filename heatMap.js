let svgHeatmap = d3.select('#heatmap').append('svg')
    .attr('width', svgHeatmapWidth)
    .attr('height', svgHeatmapHeight)
    .append('g')
    .attr('transform', translate(margin.left, margin.top));

function initHeatMap(wordRanksEach, wordRanksTotal) {
    svgHeatmap.selectAll('*').remove();
    let originalParts = svgLegend.selectAll('.nameLegend').data()
    let names = originalParts.filter(d => Object.keys(wordRanksEach).includes(d))
    if ((originalParts.includes('기타')) && (!names.includes('기타'))) {
        names.push('기타')
    }
    let words = Object.entries(wordRanksEach)
    //console.log(words)
    words = words.map(function (d) {
        let name = (names.includes(d[0])) ? d[0] : '기타';
        let values = d[1]
        return Object.entries(values).map(dd => [name].concat(dd))

    }).flat()
    //console.log(names)
    //console.log(words)
    let wordsTotal = Object.keys(wordRanksTotal)
    if (Object.keys(wordRanksTotal).length > 8) {
        wordsTotal = wordsTotal.slice(0, 8)
    }
    let yGrid = Math.floor(heatmapHeight / names.length)
    let xGrid = Math.floor((heatmapWidth - 150) / (wordsTotal.length - 1) )
    let heatMap = svgHeatmap
            .attr('width', heatmapWidth)
            .attr('height', heatmapHeight);
        let nameLabels = heatMap.selectAll('.nameLabel')
            .data(names)
            .enter()
            .append('text')
            .text(d => d)
            .attr('x', 0)
            .attr('y', (d, i) => i * yGrid)
            .style("text-anchor", "end")
            .attr("transform", translate(0, yGrid / 1.5))
            .style('fill', (d, i) => d3.schemeAccent[originalParts.indexOf(d)])

        let wordLabels = heatMap.selectAll(".wordLabel")
            .data(wordsTotal)
            .enter().append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", function (d, i) {
                return 150 + (i - 1) * xGrid;
            })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", translate(xGrid / 2, -6));
        //console.log(words)

        let cards = heatMap.selectAll('.card')
            .data(words)
            .enter()
            .append('rect')
            .attr('class', 'card')
            .attr('x', function (d) {
                //console.log(d);
                return (wordsTotal.indexOf(d[1]) - 1) * xGrid + 150;
            })
            .attr('y', d => (names.indexOf(d[0])) * yGrid)
            .attr('width', xGrid)
            .attr('height', yGrid)
            .attr('fill', 'red')
            .style('opacity', function (d) {
                if (!wordsTotal.includes(d[1]))
                    return 0
                else {
                    let grade = d[2] / d3.max(words.filter(function (dd) {
                        if (dd[1] == d[1]) {
                            return dd[2];
                        }
                    }))[2]

                    if (grade == 1) {
                        //console.log(svgCloud.select('.'+d[1]))
                        //console.log(svgCloud.select('.'+d[1]).data())
                        svgCloud.select('.' + d[1]).style('fill', d3.schemeAccent[originalParts.indexOf(d[0])])

                    }
                    return 0.9 * grade;
                }
            })
    }
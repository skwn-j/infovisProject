let svgPieWidth = 400;
let svgPieHeight = 400;
let pieHeight = svgPieHeight - margin.top - margin.bottom;
let pieWidth = svgPieWidth - margin.left - margin.right;

let svgPie = d3.select('#pie').append('svg')
    .attr('width', svgPieWidth)
    .attr('height', svgPieHeight)
    .append('g')
    .attr('transform', translate(svgPieWidth / 2, svgPieHeight / 2));



function initPieChart(weightCounts) {
    let originalParts = svgLegend.selectAll('.nameLegend').data()
    let data = Object.entries(weightCounts)
    let etc = data.filter(d => !originalParts.includes(d[0]))
    let etcData = []
    if (etc.length > 0) etcData = ['기타', etc.map(d => d[1]).reduce((a, c) => a + c)]
    if (data.map(d => d[0]).includes('기타')) {
        etcData = data.find(d => d[0] == '기타')
        data = data.filter(d => d[0] != '기타')
    }
    data = data.filter(d => originalParts.includes(d[0]))
    data.sort(function (a, b) {
        return b[1] - a[1]
    });

    data.push(etcData)
    svgPie.selectAll('*').remove();

    let pieChart = svgPie
        .attr('width', pieWidth)
        .attr('height', pieHeight)

    let pie = d3.pie()
        .value(d => d[1])
        .sort(null);

    let arc = d3.arc()
        .innerRadius(0).outerRadius(160)

    let arcs = pieChart.selectAll('arc')
        .data(pie(data))
        .enter()
        .append('g')
        .attr('class', 'arc')

    arcs.append('path')
        .attr('fill', (d, i) => d3.schemeAccent[originalParts.indexOf(data[i][0])])
        .attr('d', arc);

    arcs.append('text')
        .text(function (d, i) {
            return data[i][1]
        })
        .attr('transform', function (d) {
            let c = arc.centroid(d);
            return translate(c[0] * 1.8, c[1] * 1.8);
        });
}
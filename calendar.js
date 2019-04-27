


var percent = d3.format(".1%"),
    format = d3.timeFormat("%Y-%m-%d");

var color = d3.scaleQuantize()
    .domain([0, 11])
    .range(d3.range(11).map(function (d) {
        return "q" + (6-d) + "-11";
    }));

var svgCalendar = d3.select('#calendar')
    .selectAll('svg')
    .data(d3.range(2018, 2019))
    .enter().append("svg")
    .attr("width", calendarWidth)
    .attr("height", calendarHeight)
    .attr("class", "RdYlGn")
    .append("g")
    .attr("transform", "translate(" + ((calendarWidth - cellSize * 53) / 2) + "," + (calendarHeight - cellSize * 7 - 1) + ")");

svgCalendar.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function (d) {
        return d;
    });

var rect = svgCalendar.selectAll(".day")
    .data(function (d) {
        return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function (d) {
        return d3.timeWeek.count(d3.timeYear(d), d) * cellSize;
    }) 
    .attr("y", function (d) {
        return d.getDay() * cellSize;
    })
    .datum(format)
    

rect.append("title")
    .text(function (d) {
        return d;
    });

svgCalendar.selectAll(".month")
    .data(function (d) {
        return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
    .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);

function initCalendar(data) {
    console.log(data[0].speechCounts[0].time.split(' ')[0])
    let selectedDay = data[0].speechCounts[0].time.split(' ')[0]
    console.log('calendar')
    let callData = d3.nest()
    .key(function (d) { 
        return d.speechCounts[0].time.split(' ')[0] })
    .rollup(function(d) { 
        return d.length})
    .entries(data)
    console.log(callData)

    rect.filter(function(d) {
        return callData.map(k => k.key).includes(d)
    })
    .attr('class', function(d) {
        let t = callData.filter(k => k.key == d)[0].value
        return 'day ' + color(t)
    })
    .on('click', function(d) {
        console.log(d);
        let selectedData = data.filter(dd => dd.speechCounts[0].time.split(' ')[0] == d)
        initOverview(selectedData);
    })
    


    let selectedData = data.filter(d => d.speechCounts[0].time.split(' ')[0] == selectedDay)
    initOverview(selectedData);
}
    
function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0)
        d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z";
  }
let timeMargin = 60000 * 60 * 24;
let eventNumber = 0
let participants = []


let svgMain = d3.select('#overview').append('svg')
    .attr('width', svgOverWidth)
    .attr('height', svgOverHeight + svgDetailHeight);

let clip = svgMain.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', svgDetailWidth)
    .attr('height', svgDetailHeight);

let detailChart = svgMain.append('g')
    .attr('width', svgDetailWidth)
    .attr('height', svgDetailHeight)
    .append('g')
    .attr('transform', translate(margin.left, margin.top + svgOverHeight));


let overviewChart = svgMain.append('g')
    .attr('class', 'overview')
    .attr('width', svgOverWidth)
    .attr('height', svgOverHeight)
    .attr('transform', translate(margin.left, margin.top))

let xDetail = d3.scaleTime();
let yDetail = d3.scaleLinear();

let xAxisDetail =
    detailChart
        .append('g')
        .attr('class', 'xAxis')
        .attr('transform', translate(0, detailHeight));

let yAxisDetail =
    detailChart
        .append('g')
        .attr('class', 'yAxis');

let xOver = d3.scaleTime();
let yOver = d3.scaleLinear();

let xAxisOver =
    overviewChart
        .append('g')
        .attr('class', 'xAxis')
        .attr('transform', translate(0, overHeight));
let yAxisOver =
    overviewChart
        .append('g')
        .attr('class', 'yAxis');

let brushDetail = d3.brushX()
    .extent([
        [0, 0],
        [detailWidth, detailHeight]
    ])
    .on("end", brushed);

let brushOverview = d3.brushX()
    .extent([
        [0, 0],
        [overWidth, overHeight]
    ])
    .on("brush", selected)
    .on('end', analyze);

let overArea = d3.area()
    .x(function (d) {
        return xOver(Date.parse(d.time));
    })
    .y0(overHeight)
    .y1(d => yOver(d.count))
    .curve(d3.curveMonotoneX)

let detailArea = d3.area()
    .x(function (d) {
        //console.log(d)
        return xDetail(Date.parse(d.data.time));
    })
    .y0(d => yDetail(d[0]))
    .y1(d => isNaN(d[1]) ? yDetail(d[0]) : yDetail(d[1]))
    .curve(d3.curveMonotoneX)



function initDetail(data) {
    detailChart.selectAll('.browser').remove();

    let startTime = data[0][0].data.time;
    let endTime = data[0][data[0].length - 1].data.time;
    //console.log(data)
    xDetail = d3.scaleTime()
        .domain([Date.parse(startTime), Date.parse(endTime)])
        .range([0, detailWidth]);
    yDetail = d3.scaleLinear()
        .domain([0, d3.max(data[data.length - 1].map(d => isNaN(d[1]) ? d[0] : d[1]))])
        .range([detailHeight, 0]);


    let stacks = detailChart.selectAll('.browser')
        .data(data)
        .enter()
        .append('g')
        .attr('class', function (d, i) {
            //console.log(i)
            return 'browser';
        })
        .attr('fill-opacity', 0.8)

    stacks.append('path')
        .attr('class', function (d) {
            //console.log(d)
            return 'stackArea'
        })
        .attr('d', detailArea)
        .style('fill', function (d, i) {
            return d3.schemeAccent[i]
        })

    xAxisDetail.transition().duration(100).call(d3.axisBottom(xDetail).tickFormat(d3.timeFormat("%H:%M:%S")));
    yAxisDetail.transition().duration(100).call(d3.axisLeft(yDetail));
    initLegend(data.map(d => d.key))
}

let setStack = d3.stack()
    .keys(function (d, i) {
        return participants[i]
    })
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);


function initOverview(newData) {
    participants = newData[1].map(d => d.participants)
    let timeData = newData[1].map(d => d.speechCounts)
    let overData = timeData.map(function (d) {
        let groupData = d.map(function (dd) {
            let counts = Object.values(dd);
            if (counts.length == 1) {
                return {
                    time: counts[0],
                    count: 0
                }
            } else {
                return {
                    time: counts[0],
                    count: counts.slice(1).reduce((a, c) => a + c)
                }
            }
        })
        return groupData
    })
    eventNumber = overData.length;
    let startTime = overData[0][0].time;
    let endTime = overData[overData.length - 1][overData[overData.length - 1].length - 1].time


    xOver = d3.scaleTime()
        .domain([Date.parse(startTime) - timeMargin, Date.parse(endTime) + timeMargin])
        .range([0, overWidth]);
    yOver = d3.scaleLinear()
        .domain([0, d3.max(overData.map(d => d3.max(d.map(dd => dd.count))))])
        .range([overHeight, 0]);



    xAxisOver.transition().duration(100).call(d3.axisBottom(xOver).tickFormat(d3.timeFormat("%y-%m-%d")));

    let indexData = []
    for (let i = 0; i < overData.length; i++) {

        overviewChart.append('circle')
            .datum(timeData[i])
            .attr('class', 'event' + i.toString())
            .attr('cx', function (d) {
                return xOver(Date.parse(d[0].time));
            })
            .attr('cy', 50)
            .attr('r', 1) //d => xOver(Date.parse(d[d.length - 1].time)) - xOver(Date.parse(d[0].time)))
            .attr('fill', 'grey')

        overviewChart.append("path")
            .datum(overData[i])
            .attr("class", 'area')
            .attr("d", overArea)
            .attr('fill', 'blue')
            .style('opacity', 0.5)

        indexData.push(i + 1)

    }

    overviewChart.append("g")
        .attr("class", "brush")
        .call(brushOverview)
        .call(brushOverview.move, [0, 20]);

    // removes handle to resize the brush
    overviewChart.selectAll('.brush>.handle').remove();
    // removes crosshair cursor
    overviewChart.selectAll('.brush>.overlay').remove();
    //initDetail(setStack(timeData[0], 0));

    let indexDrop = d3.select('#index')
    indexDrop.selectAll('option')
        .data(indexData)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);

    indexDrop.on('change', function (d) {
        let selectedIndex = indexDrop.property('value');
        console.log(selectedIndex)
        let position = overviewChart.select('.event' + (parseInt(selectedIndex) - 1).toString())
            .attr('cx')
        overviewChart.select('.brush')
            .call(brushOverview.move, [parseFloat(position) - 10, parseFloat(position) + 10])

    })

    d3.select('#total').text('of ' + indexData[indexData.length - 1].toString())

    d3.select('#prev').on('click', function () {
        let selectedIndex = indexDrop.property('value');
        if (selectedIndex > 1) {
            let position = overviewChart.select('.event' + (parseInt(selectedIndex) - 2).toString())
                .attr('cx')
            overviewChart.select('.brush')
                .call(brushOverview.move, [parseFloat(position) - 10, parseFloat(position) + 10])
            //indexDrop.property('selectedIndex', selectedIndex)
        }
    })

    d3.select('#next').on('click', function () {
        let selectedIndex = indexDrop.property('value');
        if (selectedIndex < indexData.length) {
            let position = overviewChart.select('.event' + (parseInt(selectedIndex)).toString())
                .attr('cx')
            overviewChart.select('.brush')
                .call(brushOverview.move, [parseFloat(position) - 10, parseFloat(position) + 10])

            //indexDrop.property('selectedIndex', selectedIndex)
        }
    })
}

function brushed() {
    console.log('brush')
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    //console.log('brushed');
    let s = d3.event.selection || xDetail.range();

    //console.log(s)
    let startTime = xDetail.invert(s[0]).toString();
    let endTime = xDetail.invert(s[1]).toString();
    let selectedTime = { startTime: startTime, endTime: endTime }

    // send file to the server
    var targetUrl = 'http://127.0.0.1:5000/get_query';
    var opts = {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(selectedTime),
        headers: {
            "Content-Type": "application/json"
        }
    };
    fetch(targetUrl, opts)
        .then(function (response) {
            if (response.status == '404') {
                console.log('404 Not Found');
            }
            // JSON.parse(JSON.stringify(response))
            // do what you want
        })
        .catch(e => {
            console.log(e);
            return e;
        });



}

function selected() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    console.log('selected');
    let s = d3.event.selection || xOver.range();
    let center = (s[0] + (typeof (s[1]) == 'string' ? parseFloat(s[1]) : s[1])) / 2
    let adjacent = 0;
    let distance = xOver.range()[1] - xOver.range()[0];
    for (i = 0; i < eventNumber; i++) {
        let xEvent = overviewChart.select('.event' + i.toString()).attr('cx')
        if (Math.abs(xEvent - center) < distance) {
            distance = Math.abs(xEvent - center);
            adjacent = i;
        }
    }
    overviewChart.select('.selected')
        .classed('selected', false)
        .attr('fill', 'grey')
        .attr('r', 1)

    overviewChart.select('.event' + adjacent.toString())
        .classed('selected', true)
        .attr('fill', d3.schemeSet1[adjacent % 8])
        .attr('r', 3)

    d3.select('#index').property('selectedIndex', adjacent)
    initDetail(setStack(overviewChart.select('.selected').datum(), adjacent));
}

function analyze() {
    console.log('analyze')
    detailChart.selectAll('.brush').remove();
    detailChart.append("g")
        .attr("class", "brush")
        .call(brushDetail)
        .call(brushDetail.move, xDetail.range());
    let data = detailChart.selectAll('.browser').data()[0]
    let startTime = data[0].data.time;
    let endTime = data[data.length - 1].data.time;

    d3.select('#timespan').text(startTime + ' ~ ' + endTime)



}
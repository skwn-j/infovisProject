let participants = []
let timeData = []


let svgMain = d3.select('#overview').append('svg')
    .attr('width', svgOverWidth)
    .attr('height', svgOverHeight + svgDetailHeight);

let clip = svgMain.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', svgDetailWidth)
    .attr('height', svgDetailHeight);

let detailChart = svgMain.append('g')
    .attr('width', detailWidth)
    .attr('height', detailHeight)
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
    detailChart.selectAll('.brush').remove();
    console.log(data)
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

    detailChart.append('g')
        .attr('class', 'brush')
        .call(brushDetail)
        .call(brushDetail.move, xDetail.range())
}

let setStack = d3.stack()
    .keys(function (d, i) {
        return participants[i]
    })
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

function initOverview(newData) {
    overviewChart.selectAll('.area').remove();
    overviewChart.selectAll('.rect').remove();
    overviewChart.selectAll('.sess').remove();
    console.log(newData)
    participants = newData.map(d => d.participants)
    timeData = newData.map(d => d.speechCounts)
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
                };
            }
        });
        return groupData;
    });


    let startTime = overData[0][0].time.split(' ')[0] + ' 00:00:00'
    console.log(startTime)
    let endTime = overData[0][0].time.split(' ')[0] + ' 23:59:59'
    if (Date.parse(overData[overData.length - 1][overData[overData.length - 1].length - 1].time) > Date.parse(endTime))
        endTime = overData[overData.length - 1][overData[overData.length - 1].length - 1].time
    console.log(endTime)

    xOver = d3.scaleTime()
        .domain([Date.parse(startTime), Date.parse(endTime)])
        .range([0, overWidth]);
    yOver = d3.scaleLinear()
        .domain([0, d3.max(overData.map(d => d3.max(d.map(dd => dd.count))))])
        .range([overHeight, 0]);



    xAxisOver.transition().duration(100).call(d3.axisBottom(xOver).tickFormat(d3.timeFormat("%H:%M:%S")));




    let sessions = overviewChart.selectAll('sess')
        .data(overData)
        .enter()
    

    let backs = sessions.append('rect')
        .datum(d => d)
        .attr('class', function(d, i) {
            return 'sess no' + i.toString()
        })
        .attr('x', function (d) {
            console.log(d)
            return xOver(Date.parse(d[0].time));
        })
        .attr('y', 0)
        .attr('height', overHeight)
        .attr('width', d => xOver(Date.parse(d[d.length - 1].time)) - xOver(Date.parse(d[0].time)))
        .attr('fill', 'grey')
        .on('click', function (d, i) {
            overviewChart.select('.selected').classed('selected', false)
            overviewChart.select('.no' + i.toString()).classed('selected', true)
    
            initDetail(setStack(timeData[overData.indexOf(d)], overData.indexOf(d)))
        })
        

    let areas = sessions.append("path")
        .datum(d => d)
        .attr("class", function(d) {
            console.log(d)
            return 'area'
        })
        .attr("d", overArea)
        .attr('fill', 'blue')
        .style('opacity', 0.5)
    overviewChart.select('.no0').classed('selected', true)
    initDetail(setStack(timeData[0], 0))
}

function brushed() {
    console.log('brush')
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    //console.log('brushed');
    let s = d3.event.selection || xDetail.range();

    //console.log(s)
    let startTime = xDetail.invert(s[0]).toString();
    let endTime = xDetail.invert(s[1]).toString();
    let selectedTime = {
        startTime: startTime,
        endTime: endTime
    }
    console.log(selectedTime)
    // send file to the server
    var targetUrl = 'http://127.0.0.1:5000/get_query';
    var opts = {
        method: 'POST',
        body: JSON.stringify(selectedTime),
        headers: {
            "Content-Type": "application/json"
        }
    };

    fetch(targetUrl, opts)
        .then(response => response.json())
        .then(function (input) {
            console.log(input.wordRanksEach)
            initPieChart(input.weightCounts)

            initWordCloud(input.wordRanksTotal, input.speeches)
            initHeatMap(input.wordRanksEach, input.wordRanksTotal)

        })
        .catch(e => {
            console.log(e);
            return e;
        });



}

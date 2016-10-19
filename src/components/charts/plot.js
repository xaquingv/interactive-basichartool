import {d3} from '../../lib/d3-lite'

const colors = [
    "#4dc6dd",  // blue light
    "#005789",  // blue dark
    "#fcdd03",  // yellow
    "#ff9b0b",  // orange light
    "#ea6911",  // orange dark
    "#dfdfdf",  // grey 5
    "#bdbdbd",  // grey 3
    "#808080",  // grey 1.5
    "#aad801",  // green
    "#000000"   // custom color
];

const chartType = {
  scatter: { r: 6, opacity: .75, stroke: 0 },
  line:    { r: 3, opacity: 1,   stroke: 1 }
}

export function drawPlot(els, dataChart, scaleX, scaleY, who) {

  // init gs
  let gs =
  d3.select(els.svg)
  .classed("d-n", false)
  .selectAll("g")
  .data(dataChart)

  // update
  gs
  // TODO: double check
  .html("")
  .selectAll("circle")
  .data(d => d)
  .enter().append("circle")
  .attr("cx", d => scaleX(d.date))
  .attr("cy", d => scaleY(d.number))
  // custom on chart type
  .attr("r", chartType[who].r)
  .attr("fill-opacity", chartType[who].opacity)
  .attr("stroke-width", chartType[who].stroke)
  .attr("stroke", "white")

  // new
  gs.enter().append("g")
  .style("fill", (d, i) => colors[i])
  .selectAll("circle")
  .data(d => d)
  .enter().append("circle")
  .attr("cx", d => scaleX(d.date))
  .attr("cy", d => scaleY(d.number))
  // custom on chart type
  .attr("r", chartType[who].r)
  .attr("fill-opacity", chartType[who].opacity)
  .attr("stroke-width", chartType[who].stroke)
  .attr("stroke", "white")

  // remove
  gs.exit().remove()
}



/*let circles =
d3.select(els.circles)
.selectAll("circle")
.data(dataChart)

// update
circles
.attr("cx", d => scaleX(d.date))
.attr("cy", d => scaleY(d.number))

// new
circles
.enter().append("circle")
.attr("cx", d => scaleX(d.date))
.attr("cy", d => scaleY(d.number))
.attr("r", 2.5)
.attr("fill", "#4dc6dd")
.attr("stroke", "white")
.attr("stroke-width", 0.5)

// exit
circles.exit().remove()
*/

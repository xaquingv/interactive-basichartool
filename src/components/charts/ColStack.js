import React from 'react'
import {connect} from 'react-redux'
import {d3} from '../../lib/d3-lite'
import {appendChartData} from '../../actions'
import {width, height, viewBox} from '../../data/config'
import {getDomainByDataRange} from '../../data/calcScaleDomain'
import drawChart from './col'

const mapStateToProps = (state) => ({
  data: state.dataChart,
  colors: state.dataSetup.colors
})

const mapDispatchToProps = (dispatch) => ({
  onSelect: (keys, scale) => dispatch(appendChartData(keys, scale))
})


class ColStack extends React.Component {

  componentDidMount() {
    this.renderChart()
  }
  componentDidUpdate() {
    this.renderChart()
  }

  render() {
    const {data, onSelect, callByStep} = this.props
    const setChartData = () => {
      if (callByStep === 3) { onSelect(data.keys, this.scale) }
    }

    return (
      <svg ref="svg" viewBox={viewBox} preserveAspectRatio="none" style={{
        width: "calc(100% - " + (data.indent) + "px)",
        height: "calc(" + data.height + "% + 1px)"
      }} onClick={setChartData}></svg>
    )
  }

  renderChart() {

    /* data */
    const {data, colors, id} = this.props
    const labelGroup = data.string1Col.length > 0 ? data.string1Col : data.dateCol
    const numberRows = data.numberRows
    const numberRowSums = numberRows.map(ns => ns.reduce((n1, n2) => n1 + n2))

    const domain = getDomainByDataRange(numberRowSums)

    // scale
    this.scale = {}
    this.scale.y = d3.scaleLinear()
    .domain(domain)
    .range([height, 0])

    // b/n label groups
    const scaleBand = d3.scaleBand()
    .domain(labelGroup)
    .range([0, width])
    .paddingInner(0.1)

    // chart
    const dataChartGroup = labelGroup.map((date, i) => ({
      group: date,
      ...numberRows[i]
    }))

    const stack = d3.stack().keys(Object.keys(numberRows[0]))
    const dataChart = stack(dataChartGroup).map((group, i) => ({
      color: colors[i],
      value: group.map((ns, j) => ({
        title: Math.round((ns[1] - ns[0])*100)/100,
        group: scaleBand(labelGroup[j]),
        shift: domain[1] > 0 ? this.scale.y(ns[1]) : this.scale.y(ns[0]),
        length: Math.abs(this.scale.y(ns[0]) - this.scale.y(ns[1]))
      }))
    }))


    /* draw */
    drawChart(this.refs, dataChart, {width: scaleBand.bandwidth(), id, colors})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ColStack)

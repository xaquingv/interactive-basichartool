import React from 'react'
import {connect} from 'react-redux'
import {d3} from '../../lib/d3-lite'
import drawChart from './line'
import {setupLegend} from '../../actions'

const mapStateToProps = (state) => ({
  dataChart: state.dataBrief.chart
})

const mapDispatchToProps = (dispatch) => ({
  onSelect: (keys) => dispatch(setupLegend(keys))
})


class LineDiscrete extends React.Component {

  componentDidMount() {
    this.renderChart()
  }
  componentDidUpdate() {
    this.renderChart()
  }

  render() {
    const {callByStep, dataChart, onSelect} = this.props

    const setLegendData = () => {
      if (callByStep === 3) { onSelect(dataChart.keys) }
    }

    return (
      <svg ref="svg" onClick={setLegendData}></svg>
    )
  }

  renderChart() {

    /* data */
    const data = this.props.dataChart
    const dataChart = data.numberCols.map(numberCol =>
      numberCol.map((number, i) => ({
        x: i,
        y: number
    })))

    const width = this.props.width
    const height = width*0.6

    const scaleX = d3.scaleLinear()
    .domain([0, data.rowCount - 1])
    .range([0, width])

    const scaleY = d3.scaleLinear()
    // TODO: pretty domain
    .domain(d3.extent(data.numbers))
    .range([height, 0])

    /* draw */
    drawChart(this.refs, dataChart, scaleX, scaleY)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LineDiscrete)

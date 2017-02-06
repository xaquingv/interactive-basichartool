import React from 'react'
import {connect} from 'react-redux'
import {d3} from '../../lib/d3-lite'
import {uniqueArray} from '../../lib/array'
import {updateChartData} from '../../actions'
import drawChart from './bar'

const mapStateToProps = (state) => ({
  data: state.dataChart,
  colors: state.dataSetup.colors
})

const mapDispatchToProps = (dispatch) => ({
  onSelect: (keys, scale) => dispatch(updateChartData(keys, scale))
})

class Bars100 extends React.Component {

  componentDidMount() {
    this.renderChart()
  }
  componentDidUpdate() {
    this.renderChart()
  }

  render() {
    const {data, onSelect, callByStep} = this.props
    const setChartData = () => {
      if (callByStep === 3) {
        const legendKeys = this.colorKeys.length !== 0 ? this.colorKeys : data.keys
        onSelect(legendKeys, this.scale)
      }
    }

    return (
      <div className="chart" ref="div" onClick={setChartData}></div>
    )
  }

  renderChart() {

    /* data */
    const {data, colors} = this.props
    const numbers = data.numbers
    const labelGroup = data.string1Col
    const colorGroup = data.string2Col
    const isAnyNumbersLargerThan100 = numbers.find(num => num > 100)
    this.colorKeys = uniqueArray(colorGroup)

    // scale
    const domainMax = isAnyNumbersLargerThan100 ? Math.max.apply(null, numbers) : 100

    this.scale = {}
    this.scale.x = d3.scaleLinear()
    .domain([0, domainMax])
    .range([0, 100])

    const scaleColors = d3.scaleOrdinal()
    .domain(this.colorKeys)
    .range(colors)

    // chart
    const dataChart = labelGroup.map((label, i) => ({
        group: label,
        value: [{
          title: isAnyNumbersLargerThan100 ?
            Math.round(this.scale.x(numbers[i])) + "% (" + numbers[i] + ")" :
            numbers[i] + "%",
          width: this.scale.x(numbers[i]),
          color: colorGroup.length !== 0 ? scaleColors(colorGroup[i]) : null
        }]
      })
    )


    /* draw */
    drawChart(this.refs, dataChart, {hasGroupBgColor: true, colors})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Bars100)

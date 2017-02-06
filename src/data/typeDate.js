/*
  dates has three types of values:
  - input with a list of format specifiers
  - scale in time (JS DATE format) or linear (NUMBER)
  - label as STRING in different formats
*/

// ref: https://docs.google.com/spreadsheets/d/1Y9_YUvjYvc0sRjKIUQDsmyQ8D656XYw0RsseQXBFnNQ (examples)
// cfg: https://docs.google.com/spreadsheets/d/1Kw1M08x6yybOG8b7JxDvxIbtdffFzCsB0xQ7UuLuzh8/edit#gid=1819233225
import {d3} from '../lib/d3-lite.js'

const formatList = [
  // time
  //"%m/%d/%Y", "%m/%d/%y",     // vs.
  //"%d/%m/%Y", "%d/%m/%y"      // extend
  // -> parse sp.1
  "%d-%b-%y", "%d %b %Y",
  "%Y%m%d",                     // extend
  "%Y-%m-%dT%H:%M:%S%Z",        // iso format timestamp
  "%m/%d/%y %H:%M",
  "%m/%d/%y %I:%M %p",
  "%H:%M:%S",                   // extend

  // linear
  //"%Y",                       // -> parse sp.2
  "%b-%y", "%b %y",             // hijack
  "%Y %b", "%b %Y",
  "%Y-%y", "%Y/%y",             // hijack
  "%b", "%B"                    // extend
  //"%Y Q*", "Q* %Y"            // -> parse sp.3
]

const formatSp1 = [
  "%m/%d/%y", "%m/%d/%Y"
]

/* 1. input format */
export function getDateInputFormat(data) {
  const dateFormat =
  testDateFormatSp1(data) ||
  testDateFormatSp2(data) ||
  testDateFormatSp3(data) ||
  testDateFormats(data, formatList)
  //console.log("date format:", dateFormat ? dateFormat : null)

  const dateHasDay = dateFormat.indexOf("%d") > -1 || dateFormat.indexOf("%H") > -1
  return {
    format: dateFormat,
    hasDay: dateHasDay
  //scaleX: dateHasDay ? "time" : "linear",
  //values: getDateValues(dataClean, dateFormat, dateHasDay)
  }
}


function testDateFormats(data, formats) {
  let dateParser
  let dateFormat = formats.find(f => {
    dateParser = d3.timeParse(f)
    return dateParser(data[0])
  })
  return dateFormat && data.every(d => dateParser(d)) ? dateFormat : ""
}

// formats: "%m/%d/%Y", "%m/%d/%y" vs. "%d/%m/%Y", "%d/%m/%y"
function testDateFormatSp1(data) {
  let format = testDateFormats(data, formatSp1)
  if (format) {
    const isMonthFirst = data.every(d => d.split("/")[0] <= 12)
    const isDaySecond = data.some(d => d.split("/")[1] > 12)
    format = isMonthFirst && isDaySecond ? format : "%d/%m/" + format.slice(-2)

    // both first and second parts of are smaller than 12
    if (isMonthFirst && !isDaySecond) console.warn("format unclear!!!")
  }
  return format ? format : ""
}

// formats: "%Y"
function testDateFormatSp2(data) {
  // format
  const isYear = testDateFormats(data, ["%Y"]) === "%Y"
  // filter, strict
  const is4Digits = data.every(d => d.length === 4)
  return isYear && is4Digits ? "%Y" : ""
}

// formats: "%Y Q*", "Q* %Y"
function testDateFormatSp3(data) {
  // filter
  const isSp3 = data.every(d => (d[0] === "Q" || d[5] === "Q") && d.length === 7)
  // format without Q
  const dataYear = data.map(d => d.replace(/Q([1-4])/g, "").trim())
  const isYear = testDateFormats(dataYear, ["%Y"]) === "%Y"
  return isSp3 && isYear ? "Q*" : ""
}


/* 2. dates to scale values */
export function getDateScaleValues(dates, format, hasDay) {
  const parser = d3.timeParse(format)
  const dateParsed = dates.map(d => parser(d))

  switch (true) {

    // d3.scaleLinear
    case ["%Y"].includes(format):
      return dates.map(d => +d)

    case ["Q*"].includes(format):
      const indexQ = dates[0].indexOf("Q")
      return dates.map(d => +(d.replace(/Q([1-4])/g, "").trim()) + ((+d[indexQ+1]) - 1)*0.25)

    case ["%Y-%y", "%Y/%y"].includes(format):
      return dates.map(d => +d.slice(0, 4))

    case ["%b", "%B"].includes(format):
      return dateParsed.map(d => d.getMonth())

    /* %b %Y x 4 sets */
    case !hasDay:
      return dateParsed.map(d => d.getFullYear() + d.getMonth()/12)

    // d3.scaleTime
    default:
      return dateParsed
  }
}


/* 3. dates to label texts */
/*export function getDateLabelTexts(dates, format, hasDay) {
  const parser = d3.timeParse(format)
  const dateParsed = dates.map(d => parser(d))

  let toText
  switch (true) {

    case ["%Y"].includes(format):
      return dates

    case ["Q*"].includes(format):
      const isQFisrt = dates[0][0] === ("Q")
      return isQFisrt ? dates : dates.map(d => d.slice(-2) + " " + d.slice(0, -3))

    case ["%Y-%y", "%Y/%y"].includes(format):
      return dates.map(d => d.replace("/", "-"))

    case ["%b", "%B"].includes(format):
      toText = d3.timeFormat("%b")
      return dateParsed.map(d => toText(d))

    /* %b %Y x 4 sets * /
    case !hasDay:
      toText = d3.timeFormat("%b %Y")
      return dateParsed.map(d => toText(d))

    // dynamic formats
    default:
      return null
  }
}*/

export function dateNumToTxt(value, format, hasDay) {

  let year = value.toString().split(".")[0]
  let deci = value % 1 // get decimal portion
  let date, toText

  switch (true) {

    case ["%Y"].includes(format):
      return value.toString()

    case ["Q*"].includes(format):
      const quad = (value % 1)*4 + 1
      return "Q" + quad + " " + year

    case ["%Y-%y", "%Y/%y"].includes(format):
      return value + "-" + (value+1).toString().slice(-2)

    case ["%b", "%B"].includes(format):
      date = new Date(year, deci*12 || 0)
      toText = d3.timeFormat("%b")
      return toText(date)

    /* %b %Y x 4 sets */
    case !hasDay:
      date = new Date(year, deci*12 || 0)
      toText = d3.timeFormat("%b %Y")
      //console.log(value, year, deci, date, toText(date))
      return toText(date)

    // dynamic formats
    default:
      return null
  }
}

// dynamic
export function getDateTextFormat(domain) {

  const diffYear  = domain[1].getFullYear() - domain[0].getFullYear()
  const diffMonth = domain[1].getMonth() - domain[0].getMonth()
  const diffDay   = domain[1].getDate() - domain[0].getDate()
  const diffHour  = domain[1].getHours() - domain[0].getHours()

  switch (true) {
    case diffYear  > 4: return "%Y"      //console.log("[Y] 2017")
    case diffYear  > 0: return "%b %Y"   //console.log("[M] Feb 2017")
    case diffMonth > 4: return "%b"      //console.log("[M] Feb")
    case diffMonth > 0: return "%d/%m %Y"   //console.log("[M] 15/02")
    case diffDay   > 0: return "%d %I%p" //console.log("[D] 15 6pm")
    case diffHour  > 0: return "%H:%M"   //console.log("[H] 18:30")
    default: console.error("a new time format is required!")
  }
}
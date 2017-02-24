import getDataTypeAnalysis from './detectDataType';

export default function(dataTableRaw) {
  //console.log(dataTableRaw)
  const {cols, rows} = dataTableRaw

  /* head and body types */
  let bodyTypes = cols.map((col) => {
    let output = getDataTypeAnalysis(col.slice(1), "body")
    //console.log(output)

    let list = output.types
    let type = list[0]
    let format = output[type]
    //(type.indexOf("string") === -1) ? output[type] : {format:""}

    return {list, ...format}
  })

  let headTypes = cols.map((col) => {
    let head = col.slice(0, 1)[0] ? col.slice(0, 1) : [""]
    let output = getDataTypeAnalysis(head, "head")
    return output.types[0]
  })

  /* 3. dataTableDraw: type, head, body, flag */
  let dataTableDraw = { flag: {} }

  // detect if first row is label:
  // - head types doesn't match body types or
  // - all head types are strings
  dataTableDraw.flag = { isHeader:
    (headTypes.filter(headType => headType.indexOf("string") !== -1).length === headTypes.length) ||
    (headTypes.filter((headType, i) => headType === bodyTypes[i].list[0]).length !== headTypes.length)
  }

  dataTableDraw.type = bodyTypes
  if (dataTableDraw.flag.isHeader) {
    // TODO: double check headers
    const headers = rows.slice(0, 1)[0].map(header => header ? header : "unknown title")
    dataTableDraw.head = headers//rows.slice(0, 1)[0]
    dataTableDraw.body = rows.slice(1)
  } else {
    dataTableDraw.head = headTypes.map(() => "unknown title")
    dataTableDraw.body = rows
  }

  return {
    ...dataTableRaw,
    ...dataTableDraw
  }
}

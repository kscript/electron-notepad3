export const copy = function (data) {
  try {
    return JSON.parse(JSON.stringify(data))
  } catch (e) {
    console.log('复制失败', e)
    return data
  }
}

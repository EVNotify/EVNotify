/**
 * Converts given hexadecimal signed number to decimal
 * @param {String} data: the hexadecimal number as string
 * @returns {Number} the converted signed number
 */
function parseSigned (data) {
  let bits = data.length * 4
  return ((parseInt(data, 16) + 2 ** (bits - 1)) % 2 ** bits) - 2 ** (bits - 1)
}

export default {
  parseSigned,
}
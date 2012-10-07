
var angle_diff = function (theta, beta) {
  var diff = Math.abs(theta - beta)
  if (diff > Math.PI) {
    if (theta > beta) {
      return 2 * Math.PI - theta + beta
    } else {
      return 2 * Math.PI - beta + theta
    }
  } else {
    return diff
  }
}

// this angle might need to be rotated
      var angle = Math.atan(y_diff / x_diff)

      if (y_diff >= 0 && x_diff < 0) {
        angle = Math.PI + -angle
      } else if (y_diff < 0 && x_diff >= 0) {
        angle = -angle
      } else if (y_diff < 0 && x_diff < 0) {
        angle = (Math.PI - angle)
      } else if (y_diff >= 0 && x_diff >= 0) {
        angle = (Math.PI - angle) + Math.PI
      } else {
        angle = 0 
      }

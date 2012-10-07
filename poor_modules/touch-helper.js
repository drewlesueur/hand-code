poorModule("touch-helper", function () {
  var ret = {}
  var mouse = "up"
  var finger = "up"
  var touch = {}

  var mousedown = function (e) {
    touchstart({ preventDefault: function () {}, touches: [{pageX: e.pageX, pageY: e.pageY}]})
    mouse = "down"
  }

  var mousemove = function (e) {
    if (mouse == "up") return
    touchmove({ preventDefault: function () {}, touches: [{pageX: e.pageX, pageY: e.pageY}]})
  }

  var mouseup = function () {
    mouse = "up"
    touchend()
  }

  var touchstart = function (e) {
    e.preventDefault()
    finger = "down"
    touch.y_start = e.touches[0].pageY
    touch.x_start = e.touches[0].pageX
    touch.y1 = touch.y_start
    touch.x1 = touch.x_start
    touch.y2 = touch.y1
    touch.x2 = touch.x1
    touch.start = Date.now()
    touch.distance = 0
    ret.ontouchstart(touch)
  }


  var touchmove = function  (e) {
    touch.y1 = touch.y2
    touch.x1 = touch.x2

    touch.y2 = e.touches[0].pageY
    touch.x2 = e.touches[0].pageX

    var y_diff = (touch.y2 - touch.y1)
    var x_diff = (touch.x2 - touch.x1)
    touch.distance = Math.pow(Math.pow(touch.y2 - touch.y_start, 2) + Math.pow(touch.x2 - touch.x_start, 2), 0.5)
    touch.y_diff = y_diff
    touch.x_diff = x_diff
    ret.onscroll(touch)
    ret.ontouchmove(touch)
  }

  

  var touchend = function (e) {
    finger = "up"
    touch.time = Date.now() - touch.start
    ret.ontouchend(touch)
    touch = {}
    // todo call onscroll on an interval to handle momentum
  } 

  $(document).ready(function () {
    if (screen.width > 320) { //if not mobile
      $(document.body).bind("mousedown", mousedown)
      $(document.body).bind("mousemove", mousemove)
      $(document.body).bind("mouseup", mouseup)
    } else {
      $(document.body).bind("touchstart", touchstart)
      $(document.body).bind("touchmove", touchmove)
      $(document.body).bind("touchend", touchend)
    
    }
  })

  ret.onscroll = function () {}
  ret.ontouchstart = function () {}
  ret.ontouchend = function () {}
  ret.ontouchmove = function () {}
  //todo: make more event driven?
  //
  return ret 
})

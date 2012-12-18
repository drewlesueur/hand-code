  poorModule("touch-helper", function () {

  var ret = {}
  var mouse = "up"
  var finger = "up"
  var touch = {}
  var easing = poorModule("easing")

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

  var animate = false
  var touchstart = function (e) {
    touch = {}
    animate = false
    webkitCancelRequestAnimationFrame(req)
    e.preventDefault()
    finger = "down"
    touch.y_start = e.touches[0].pageY
    touch.x_start = e.touches[0].pageX
    touch.y1 = touch.y_start
    touch.x1 = touch.x_start
    touch.y2 = touch.y1
    touch.x2 = touch.x1
    touch.start = Date.now()
    touch.last_time = touch.start
    touch.distance = 0
    ret.ontouchstart(touch)
  }

  var animate_scroller = function (x2, y2, change_in_x, change_in_y, duration) {
    var start_anim_time = Date.now()
    var animate_scroll = function (time) {
      if (animate == false) {
        return
      }
      var elapsed = time - start_anim_time 

      passed_y = easing.easeOutQuad(elapsed, y2, change_in_y, duration)

      passed_x = easing.easeOutQuad(elapsed, x2, change_in_x, duration)

      _touchmove(passed_x, passed_y)
      if (elapsed >= duration || animate == false) {
        touch = {}
        webkitCancelRequestAnimationFrame(req)
      } else {
        webkitRequestAnimationFrame(animate_scroll) 
      }
    }
    return animate_scroll
  }

  var touchmove = function  (e) {
    webkitCancelRequestAnimationFrame(req)
    animate = false
    _touchmove(e.touches[0].pageX, e.touches[0].pageY)
  }

  var _touchmove = function  (x, y) {
    touch.y1 = touch.y2
    touch.x1 = touch.x2
    touch.last_time = Date.now()

    touch.y2 = y
    touch.x2 = x

    var y_diff = (touch.y2 - touch.y1)
    var x_diff = (touch.x2 - touch.x1)
    //touch.y_total_diff = touch.y2 - touch.y_start
    //touch.x_total_diff = touch.x2 - touch.x_start
    //touch.total_distance = Math.pow(Math.pow(touch.y2 - touch.y_start, 2) + Math.pow(touch.x2 - touch.x_start, 2), 0.5)
    touch.distance = Math.pow(Math.pow(touch.y2 - touch.y1, 2) + Math.pow(touch.x2 - touch.x1, 2), 0.5)
    touch.y_diff = y_diff
    touch.x_diff = x_diff
    ret.onscroll(touch)
    ret.ontouchmove(touch)
  }

   
  var req;
  var touchend = function (e) {
    finger = "up"
    var now = Date.now()
    //touch.total_time = now - touch.start
    //touch.total_speed = touch.total_distance / touch.total_time

    //var change_in_y = touch.total_speed * touch.y_total_diff
    //var change_in_x = touch.total_speed * touch.x_total_diff

    touch.time = now - touch.last_time
    touch.speed = touch.distance / touch.time

    var change_in_y = touch.speed * touch.y_diff * 4
    var change_in_x = touch.speed * touch.x_diff * 4
    if (change_in_y > change_in_x) {
      //change_in_x = 0
    } else {
      //change_in_y = 0
    }

    touch.y_total_diff = touch.y2 - touch.y_start
    touch.x_total_diff = touch.x2 - touch.x_start
    touch.total_distance = Math.pow(Math.pow(touch.y2 - touch.y_start, 2) + Math.pow(touch.x2 - touch.x_start, 2), 0.5)
 
    if ( touch.total_distance != 0) {
      if ( Math.abs(touch.x_total_diff) > Math.abs(touch.y_total_diff)) {
        if ( touch.x_total_diff > 0) {
          ret.onswiperight()
          
        } else {
          ret.onswipeleft()
        }
      } else {
        if ( touch.y_total_diff > 0) {
          ret.onswipedown()
        } else {
          ret.onswipeup()
        }
        
      }
    }
    
    ret.ontouchend(touch)
    // todo call onscroll on an interval to handle momentum
    var x2 = touch.x2
    var y2 = touch.y2
    if (touch.distance) {
      animate = true
      req = webkitRequestAnimationFrame(animate_scroller(x2, y2, change_in_x, change_in_y, 500))
    }

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
  ret.onswipeup = function () {}
  ret.onswipedown = function () {}
  ret.onswipeleft = function () {}
  ret.onswiperight = function () {}
  ret.get_touch = function () {
    return touch
  }
  //todo: make more event driven?
  //
  return ret 
})

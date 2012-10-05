//setTimeout(function () { window.scrollTo(0, 1) }, 100)

var screen_width = 320
var screen_height = window.innerHeight

var mode = "scroll"
var line  = []
var lines = [line]
var y_cursor = 0
var x_cursor = 0
var x_offset = 0
var y_offset = 0
var viewport_width = 320
var x_viewport = 16

var viewport_height = 360

var y_viewport = 10
var chr_width = (viewport_width / x_viewport)
var chr_height = (viewport_height / y_viewport)

var font_size = 35
var font_name = "Courier"

var c = $("#c")
var canvas_width = screen_width
var canvas_height = screen_height
c.css({
  width: canvas_width + "px",
  height: canvas_height + "px" ,
  position: "absolute",
  left: 0,
  "top": 0
})
c.attr("width", canvas_width * 2)
c.attr("height", canvas_height * 2)
var ctx = c[0].getContext("2d")
ctx.scale(2,2)
ctx.textBaseline = "top"
ctx.font = font_size + "px " + font_name

var tick = function () {
   
}

webkitRequestAnimationFrame(tick)


var clear_viewport = function () {
  ctx.clearRect(0,0, viewport_width, viewport_height)
}

var render = function () {
  render_raw(x_offset, y_offset)
  // # todo maybe cache the result of the move_factor call
}

draw_lines = function () {
  if (roughes.length == 0) return;
  document.title = (roughes.length)
  var rough = roughes[0];
  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = 10
  ctx.moveTo(rough[0], rough[1])
  for (var i = 1; i < roughes.length; i++) {
    var rough = roughes[i]
    ctx.lineTo(rough[0], rough[1])
  }
  ctx.stroke()
  ctx.restore()
}

var draw_cursor = function (x_offset, y_offset) {
  var x = (x_offset + chr_width * x_cursor)
  var y = (y_offset + chr_height * y_cursor)
  ctx.save()
  ctx.fillStyle = "rgba(0,0,255, 0.5)"
  ctx.fillRect(x,y, chr_width, chr_height)
  ctx.restore()
}

var draw_text = function (x_offset, y_offset) {
  var c_line

  var y_start = Math.floor(-y_offset / chr_height)
  var x_start = Math.floor(-x_offset / chr_width)
  // todo maybe cache y_start
  var x_px
  var y_px
 
  for (var y = y_start; y < y_start + y_viewport + 1; y++) {
    c_line = lines[y];
    y_px = (y_offset + chr_height * y)
    if (!c_line) continue;
    for (var x = x_start; x < x_start + x_viewport + 1; x++) {
      var c_chr = c_line[x];
      x_px = (x_offset + chr_width * x)
      if (c_chr) {
        ctx.fillText(c_chr, x_px, y_px)
      }
    }
  }
  
}

var box = function (x,y,w,h,c) {
  ctx.save()
  ctx.fillStyle = c
  ctx.fillRect(x, y, w, h)
  ctx.restore()
}

var render_raw = function (x_offset, y_offset) {
  // todo: can optimize this to know when it should change
  clear_viewport()

  ctx.save()
  if (mode == "scroll") {
    ctx.fillStyle = "rgba(255, 255, 0, 0.1)";
  } else {
    ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
  }
  ctx.fillRect(0,0,screen_width, screen_height)
  ctx.restore()

  draw_cursor(x_offset, y_offset)
  draw_text(x_offset, y_offset)
  draw_lines()
  var c_line
}

var text_to_lines = function (text) {
  var lines = text.split("\n");
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    lines[i] = line.split("");
  }
  return lines
}

var log_index = 0
var l = function(m){
  log_index += 1
  document.title = 
    log_index + " " + m
}

var touch = {}
   
//https://github.com/drewlesueur/mobile/blob/server/public/index.js
var move_factor = function (z) {
  return -1 * parseInt(z / 10) 
}

var mouse = "up"
var finger = "up"
auto_mouseup = false
setTimeout(function () {
  var auto_mouseup = true
}, 1000)


var mousedown = function (e) {
  touchstart({ preventDefault: function () {}, touches: [{pageX: e.pageX, pageY: e.pageY}]})
  mouse = "down"
}

var mousemove = function (e) {
  if (mouse == "up") return
  touchmove({ preventDefault: function () {}, touches: [{pageX: e.pageX, pageY: e.pageY}]})

  if (auto_mouseup) {
    auto_mouseup = false
    mouseup()
  }
}

var mouseup = function () {
  mouse = "up"
  touchend()
}

var enter_insert_mode = function () {
  mode = "insert"
  render()
}

var enter_scroll_mode = function () {
  mode = "scroll"
  render()
}

var backspace_timeout
var cursor_timeout
var scroll_mode_timeout
var insert_mode_timeout
var enter_text = function (text) {
  var chars = text.split("")
  _.each(chars, function(chr) {
    add_letter(chr)   
    // todo: only render at end
   })
}

window.onhashchange = function () {
  load(location.hash.substr(1))
}

window.onload = function () {
  load(location.hash.substr(1))
}

var file = ""
var load = function (_file) {
  if (!_file) return
  file = _file
  $.get("http://m3.drewl.us:8500/" + file, function (content) {
    lines = text_to_lines(content)
    render()
  })
}

var save = function () {
  var content = get_content()
  $.post("http://m3.drewl.us:8500/" + file, {content: content}, function (content) {
     
  })
}

var get_content = function () {
  var c = []
  _.each(lines, function (line) {
    c.push(line.join(""))  
  })
  return c.join("\n")
}

var commands = {
 i: enter_text
, s: save
, l: load
}
var command = function() {
 var cmd = prompt("command:")
 if (!cmd)
   return
 var cmds = cmd.split(" ")
 var first = cmds[0]
 var rest = cmds.slice(1).join(" ")
 if (commands[first])
   commands[first](rest)
}
var touchstart = function (e) {
  clearTimeout(end_timeout)
  roughes = []
  finger = "down"
  touch.y1 = e.touches[0].pageY
  touch.x1 = e.touches[0].pageX
  touch.y2 = touch.y1
  touch.x2 = touch.x1
  touch.old_y2 = touch.y1
  touch.old_x2 = touch.x1
  touch.rough_y2 = touch.y1
  touch.rough_x2 = touch.x1
  touch.x_pivot = touch.x1
  touch.y_pivot = touch.y1
  touch.max_distance = 0
  touch.pageX = e.touches[0].pageX
  touch.pageY = e.touches[0].pageY
  touch.start = Date.now()
  touch.side = touch.x1 < viewport_width / 2 ? "." : "-"
  e.preventDefault()
  if (mode == "scroll" ) {
    clearTimeout(add_morse_letter_timeout)
    clearTimeout(add_morse_word_timeout)
    if (screen_height - touch.y1 < 100 && touch.x1 < 270 && touch.x1 > 50) {
      touch.command = add_morse_word
    } else if (touch.y1 < 100 && touch.x1 < 160) {
      touch.command = function () {
        _.defer(command)
      }
    } else if (touch.y1 < 100 && touch.x1 >= 160) {
      touch.command = backspace
    } else if (touch.x2 > 270) {
      touch.command = newline
    } else {
    }

    cursor_timeout = setTimeout(function () {
      touch.cursor = true
      move_cursor()
    }, 400)
    //
    //insert_mode_timeout = setTimeout(function () {
    //  prevent_insert = true
    //  enter_insert_mode()
    //}, 200)

    //backspace_timeout = setTimeout(function () {
    //  mode = "backspace"
    //  backspace_interval = setInterval(backspace, 200) 
    //}, dot_length * 7)
    
      
  } else {
    
    scroll_mode_timeout = setTimeout(function () {
      prevent_insert = true
      //enter_scroll_mode()
    }, 500)

    console.log("douch down " + touch.side )
    codes.push(touch.side)
  }
  render()
}

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

var roughes = []
var touchmove = function  (e) {

  clearTimeout(cursor_timeout)
  touch.old_y2 = touch.y2
  touch.old_x2 = touch.x2

  touch.y2 = e.touches[0].pageY
  touch.x2 = e.touches[0].pageX

  var y_diff = (touch.y2 - touch.rough_y2)
  var x_diff = (touch.x2 - touch.rough_x2)
  var distance = Math.pow(Math.pow(touch.y2 - touch.rough_y2, 2) + Math.pow(touch.x2 - touch.rough_x2, 2), 0.5)

  if (mode == "scroll") {
    var temp_x_offset = (x_offset + touch.x2 - touch.x1)
    var temp_y_offset = (y_offset + touch.y2 - touch.y1)
    render_raw(temp_x_offset, temp_y_offset)   
  } else if (mode == "insert") {
    var side = touch.x2 < viewport_width / 2 ? "." : "-"
    touch.side = side


      //document.title = "d: " + Math.round(distance)
      if (distance > 10) { // 10px leeway
        console.log("distance", touch.max_distance, distance)
        touch.max_distance = 0
        touch.rough_x2 = touch.x2
        touch.rough_y2 = touch.y2
        roughes.push([touch.x2, touch.y2])
        render()
        } else {
        return
      }

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

      // if (isNaN(angle)) debugger
      var round_angle = Math.round(angle / Math.PI * 180)
      //document.title = "ra: " + round_angle
      var angle_diff_val = "--"
      if (touch.angle) {
        angle_diff_val = Math.round(angle_diff(angle, touch.angle) / Math.PI * 180)
      }

      //document.title = "adv:" +  angle_diff_val
      console.log(
      "y2,y2':"+touch.y2+","+touch.old_y2,
      "x2,x2':"+touch.x2+","+touch.old_x2, 
      "angle_diff:"+angle_diff_val,
      "round_angle:"+round_angle)
      lines.push(("angle_diff: " + angle_diff_val).split(""))
      render()
      
      // todo: figure out a better pivot algorithim. think about granularity and curving up to a right angle 
      if (angle_diff_val > 60) {
        touch.max_distance = 0
        //1document.title = ["angle", touch.angle / Math.PI * 180, angle / Math.PI * 180]
        codes.push(side)
        lines.push([side, " ", "m"])
        render()
        console.log(codes.join(""))
      }

      touch.angle = angle


    return
    render()   
  }

  e.preventDefault()
}

var input_letter = function (quadrant_path) {
  var path = quadrant_path.join("")
  notes.text(path) 
  letter = letter_map[path]
  if (!letter) return;
  if (letter == "backspace") {
    lines[y_cursor].splice(x_cursor - 1,1)
    x_cursor -= 1
  } else {
    lines[y_cursor].splice(x_cursor, 0, letter)
    x_cursor += 1
  }
  render()   
}

var move_cursor = function () {

  y_cursor = Math.floor((touch.pageY - y_offset)/ chr_height)
  x_cursor = Math.floor((touch.pageX - x_offset)/ chr_width)
   
  if (y_cursor >= lines.length) {
    y_cursor = lines.length - 1;
  } else if (y_cursor < 0) {
   y_cursor = 0
  }


  if (x_cursor > lines[y_cursor].length) {
    x_cursor = lines[y_cursor].length;
  } else if (x_cursor < 0) {
    x_cursor = 0 
  }
  render()
}

var touch_time
var end_timeout
var touchend = function (e) {
  finger = "up"
  clearInterval(backspace_interval)
  clearTimeout(backspace_timeout)
  clearTimeout(cursor_timeout)
  if (mode == "backspace") {
    mode = "scroll"
    render()
  } else if (mode == "scroll") {
    if (touch.cursor) {
      touch = {}
      return
    }
    x_offset = (x_offset + touch.x2 - touch.x1)
    y_offset = (y_offset + touch.y2 - touch.y1)
    if (touch.y2 == touch.y1 && touch.x2 == touch.x1) {
      if (!touch.command) { 
        touch_time = Date.now() - touch.start
        if (touch_time <= dash_length) {
          codes.push(".")
          console.log(touch_time, codes.join(""))
        } else { 
          codes.push("-")
          console.log(touch_time, codes.join(""))
        }
        add_morse_letter_timeout = setTimeout( add_morse_letter,
        letter_spacing ); // * 2?
        //add_morse_word_timeout = setTimeout( add_morse_word , word_spacing)
      } else if (touch.command) {
        touch.command()
      }
      render()   
    }
    touch = {}
  } else if (mode == "insert") {
    end_timeout = setTimeout(insert_touchend, 200)
  }

} 

var insert_touchend = function () {

    if (prevent_insert) {
      prevent_insert = false
      return
    }
    if (touch.y2 != touch.y1 && touch.x2 != touch.x1) codes.push(touch.side)
    touch_time = Date.now() - touch.start
    add_morse_letter()
    touch = {}
}

var backspace_interval;
var prevent_insert = false
var add_morse_letter_timeout;
var add_morse_word_timeout;
var add_morse_word = function () {
 // while (letter_queue.length) {
   // add_letter(letter_queue.shift())
  //}
  add_letter(" ")
  render()
}

letter_queue = []
var add_letter = function (letter) {
  lines[y_cursor].splice(x_cursor, 0, letter)
  x_cursor += 1
  if (x_cursor > x_viewport) {
    
  }
  render()
}

var backspace = function () {
  clearTimeout(add_morse_word_timeout)
  console.log("backspace")
  lines[y_cursor].splice(x_cursor - 1,1)
  x_cursor -= 1
  render()
}
var newline = function () {
  clearTimeout(add_morse_word_timeout)
  lines.splice(y_cursor + 1, 0, lines[y_cursor].splice(x_cursor))
  y_cursor += 1
  x_cursor = 0
  render()
}
var add_morse_letter = function () {
  if (finger == "down") return;
  console.log(codes.join(""))
  var letter = morse_codes[codes.join("")]
  console.log(letter)
  codes = []
  //document.title = letter
  if (letter == "backspace") {
    return backspace()
  } else if (letter == "AR") {
    mode = "scroll"
    render()
  } else if (letter == "newline") {
    newline()
  } else {
    add_letter(letter)
    //letter_queue.push(letter)
  }
  //render()   
} 

var dot_length = 50
var dash_length = dot_length * 3

var letter_spacing = dot_length * 3 
var word_spacing = dot_length * 7 
var codes = []
var morse_codes = {
  ".-.-" : "newline",
  ".-.-.": "AR",
  "......": "backspace",
  ".-": "a",
  "-...": "b",
  "-.-.": "c",
  "-..": "d",
  ".": "e",
  "..-.": "f",
  "--.": "g",
  "....": "h",
  "..": "i",
  ".---": "j",
  "-.-": "k",
  ".-..": "l",
  "--": "m",
  "-.": "n",
  "---": "o",
  ".--.": "p",
  "--.-": "q",
  ".-.": "r",
  "...": "s",
  "-": "t",
  "..-": "u",
  "...-": "v",
  ".--": "w",
  "-..-": "x",
  "-.--": "y",
  "--..": "z"
  , ".----": 1
  , "..---": 2
  , "...--": 3
  , "....-": 4
  , ".....": 5
  , "-....": 6
  , "--...": 7
  , "---..": 8
  , "----.": 9
  , "-----": "0"
  , ".-.-.-": "."
  , "--..--": ","
  , "..--..": "?"
  , ".----.": "'"
  , "-.-.--": "!"
  , "-..-.": "/"
  , "-.--.": "("
  , "-.--.-": ")"
  , ".-...": "&"
  , "---...": ":"
  , "_._._.": ";"
  , "-...-": "="
  , ".-.-.": "+"
  , "": ""

}

$(document).ready(function () {
  if (screen.width > 320) {
    $(document.body).bind("mousedown", mousedown)
    $(document.body).bind("mousemove", mousemove)
    $(document.body).bind("mouseup", mouseup)
  
  } else {
    $(document.body).bind("touchstart", touchstart)
    $(document.body).bind("touchmove", touchmove)
    $(document.body).bind("touchend", touchend)
  
  }
})



var code = ""
lines = text_to_lines(code)
render()

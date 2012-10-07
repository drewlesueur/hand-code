//setTimeout(function () { window.scrollTo(0, 1) }, 100)
var touch_helper = poorModule("touch-helper")
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


var draw_cursor = function (x_offset, y_offset) {
  var x = (x_offset + chr_width * x_cursor)
  var y = (y_offset + chr_height * y_cursor)
  ctx.save()
  if (in_control_mode) {
    ctx.fillStyle = "rgba(0,255,255, 0.5)"
  } else {
    ctx.fillStyle = "rgba(0,0,255, 0.5)"
  }

  ctx.fillRect(x,y, chr_width, chr_height)
  ctx.restore()
}

var draw_text = function (x_offset, y_offset) {
  var c_line

  var y_start = Math.floor(-y_offset / chr_height)
  var x_start = Math.floor(-x_offset / chr_width)
  // todo maybe cache y_start
  //
  //

  if (in_control_mode) {
    ctx.save()
    ctx.fillStyle = "rgba(255,0,255,0.5)"
    var x_control_px = (x_offset + chr_width * x_control_index)
    var y_control_px = y_offset + chr_height * y_cursor
    var control_width = (x_cursor - x_control_index) * chr_width
    ctx.fillRect(x_control_px, y_control_px, control_width, chr_height)
    ctx.restore()
  }

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
    alert("seems to have worked")     
  })
}

var get_content = function () {
  var c = []
  _.each(lines, function (line) {
    c.push(line.join(""))  
  })
  return c.join("\n")
}
//todo undo and redot

var find = function (str) {
  var c = []
  _.each(lines, function (line, i) {
    line = line.join("")
    
  })

}

var jump = function (nu) {
  nu -= 1
  y_offset = - chr_height * (nu - 0)
  x_offset = 0
  
  render()
}
var add = function (ltr) {
  return function () {
    add_letter(ltr)
  } 
}

var duplicate = function () {
  lines[y_cursor]
}

var undo = function () {
  alert("cant undo yet")
}

var redo = function () {
  alert("cant redo yet")
}

var commands = {
 i: enter_text
, s: save
, l: load
, f: find
, j: jump
, d: duplicate
, u: undo
, r: redo
, pd: add(".")
, cm: add(",")
, lp: add("(")
, rp: add(")")
, cl: add(":")
, eq: add("=")
, dq: add('"')
, lc: add("}")
, us: add("_")
, ds: add("-")

}

var command = function() {
 var cmd = prompt("command:")
 if (!cmd)
   return
 raw_command(cmd)
}

var raw_command = function (cmd) {
 var cmds = cmd.split(" ")
 var first = cmds[0]
 var rest = cmds.slice(1).join(" ")
 if (commands[first])
   commands[first](rest)
}

touch_helper.ontouchstart = function (touch) {
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
  } 
  cursor_timeout = setTimeout(function () {
    touch.cursor = true
    move_cursor(touch)
  }, 400)
  render()
}


touch_helper.ontouchmove = function (touch) {
  clearTimeout(cursor_timeout)
} 

touch_helper.onscroll = function (touch) {
  x_offset += touch.x_diff
  y_offset += touch.y_diff
  render()
} 
  

var move_cursor = function (touch) {
  y_cursor = Math.floor((touch.y2 - y_offset)/ chr_height)
  x_cursor = Math.floor((touch.x2 - x_offset)/ chr_width)
   
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
touch_helper.ontouchend = function (touch) {
  clearTimeout(cursor_timeout)
  if (touch.cursor) { return }
  if (touch.distance == 0) {
    if (!touch.command) { 
      if (touch.time <= dash_length) {
        codes.push(".")
      } else { 
        codes.push("-")
      }
      add_morse_letter_timeout = setTimeout( add_morse_letter,
      letter_spacing ); // * 2?
      //add_morse_word_timeout = setTimeout( add_morse_word , word_spacing)
    } else if (touch.command) {
      touch.command()
    }
    render()   
  }
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
  if (x_cursor == 0 && y_cursor == 0) return
  if (lines[y_cursor].length == 0) {
    lines.splice(y_cursor, 1)
    if (y_cursor >= 1) y_cursor -= 1
    x_cursor = lines[y_cursor].length
  } else {
    lines[y_cursor].splice(x_cursor - 1,1)
    x_cursor -= 1
  }
  render()
}
var newline = function () {
  if (in_control_mode) {
    return exit_control_mode()
  }
  clearTimeout(add_morse_word_timeout)
  lines.splice(y_cursor + 1, 0, lines[y_cursor].splice(x_cursor))
  y_cursor += 1
  x_cursor = 0
  render()
}

var in_control_mode = false
var enter_control_mode = function () {
  in_control_mode = true
  x_control_index = x_cursor
  render()
}

var exit_control_mode = function () {
  in_control_mode = false
  var cmd = lines[y_cursor].splice(x_control_index, (x_cursor - x_control_index)).join("")
  x_cursor = x_control_index
  raw_command(cmd)
  render()
}

var add_morse_letter = function () {
  if (finger == "down") return;
  var letter = morse_codes[codes.join("")]
  if (!letter) letter = " "
  codes = []
  //document.title = letter

  if (letter == "backspace") {
    return backspace()
  } else if (letter == "AR") {
    mode = "scroll"
    render()
  } else if (letter == "newline") {
      newline()
  } else if (letter == "control") {
    enter_control_mode()
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
  "---.": "backspace",
  "----": "control",
  "..--": " "

  // not used by me yet
  , "...-.": ""
  , "..-..": ""
  , "..-.-": ""
  , "..--.": ""
  , ".-...": ""
  , ".-..-": ""
  , ".-.-.": ""
  , ".-.--": ""
  , ".--..": ""
  , ".--.-": ""
  , ".---.": ""
  , "-...-": ""
  , "-..-.": ""
  , "-..--": ""
  , "-.-..": ""
  , "-.-.-": ""
  , "-.--.": ""
  , "-.---": ""
  , "--..-": ""
  , "--.-.": ""
  , "--.--": ""
  , "---.-": ""
  
  
  ,  
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
  , "-.-.-.": ";"
  , "-...-": "="
  , ".-.-.": "+"
  , "": ""

}

var reverse_lookup = _.invert(morse_codes) 
var add_morse_codes = function (ltrs, ltr) {
  ltrs = ltrs.split("")
  var the_codes = []
  _.each(ltrs, function (ltr) {
    the_codes.push(reverse_lookup[ltr]) 
  })
  morse_codes[the_codes.join("")] = ltr
}

var add_all_morse_codes = function (all) {
  _.each(all, function (value, key) {
    add_morse_codes(key, value)     
  })
}

add_all_morse_codes({
  lp: "("    
, rp: ")"
, tl: "~"
, bt: "`"
, ep: "!"
, as: "@"
, ca: "@"
, ns: "#"
, hs: "#"
, ds: "$"
, pc: "%"

, cr: "^"
, ap: "&"
, as: "*"
, lp: "("
, rp: ")"
, dh: "-"
, hp: "-"
, us: "_"
, pl: "+"
, eq: "="
, lb: "["
, lc: "{"
, rb: "]"
, rc: "}"
, sc: ";"
, cl: ":"
, dq: "\""
, sq: "'"
, bs: "\\"
, pp: "|"
, or: "|"
, lt: "<"
, cm: ","
, grt: ">"
, pd: "."
, qm: "?"
, sl: "/"
, fs: "/"
})


var code = ""
lines = text_to_lines(code)
render()

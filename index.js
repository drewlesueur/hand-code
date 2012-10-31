/* 
 todo
 search emultiline
 autoceomplete 1 letter
 dash dot feedback
 search wrap around
 do i cache calculated  variables or do i calculate them every time?
 sidways view
 better momentum
 gestures for common actions
 undo and redo
 backspace to get out of command mode at first
 run a line as a command
 pasting nothing is a problem
 default tab on new line
 when to clear selection
 indenting when you newline
 paste in the right order
 deleting a line should copy it
 tabs and sreens **
 remember cursor position on refresh
 collaborative
 create new files and folders
 enter bash commands
 caching problem
 chompie virtual machine (programming language)
 simple datastore based on diffs
 syncing data objects
 network calls: stream, event, rpc, sync
 tabs as nested arrays might make it easier to sync
 iframe demo of your code
 swipe from the side
 go fullscreen
 cleanup fuzzy autocomplete
  should work in middle of word
 pinch zoom
 remember zoom value
 fullscreen web app option
 save as data urls
 an offline version that is just a data url
   save files as javascript urls
 remember where you last were like ctrl o in vim
 a log
 make backspace a button on the bottom right
 jump to points (links)
 touch hold and move
 caching data vs rerendering every time
 a text option
*/
// var make_box


var start = function (){
var touch_helper = poorModule("touch-helper")
var screen_width = 320 * 1.5
var screen_height = window.innerHeight

var mode = "scroll"
var line  = []
var lines = [line]
var y_cursor = 0
var x_cursor = 0
var x_offset = 0
var y_offset = 0
var viewport_width = screen_width

var viewport_height = screen_height

var chr_width = 20
var chr_height = 36

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
  var x_viewport = viewport_width / chr_width
  var y_viewport = viewport_height / chr_height
  

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

message = "hi"
var draw_alert = function () {
  box(0,0,viewport_width, chr_height, "silver")
  ctx.fillText(message, 0, 0)
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
  draw_alert()
  var c_line
}

var words = {}
var text_to_lines = function (text) {
  words = _.countBy(text.split(/\W+/), function (a) {return a})
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

var first_letters = {}

var get_last_start_word_index = function () {
  var i = x_cursor;
  while (i >= 0) {
    if (lines[y_cursor][i] == " ")  {
      break;
    }
    i -= 1
  }
  i += 1
  return i
}

var get_current_word = function () {
  // todo make it work in middle of word
  var i = get_last_start_word_index()
  var ret = lines[y_cursor].slice(i, x_cursor + 1).join("")
  message = ret
  return ret
}

var increment_word_count = function (word) {
  if (word in words) {
    words[word] += 1
  } else {
    words[word] = 1
  }
}

var toggler = function (list) {
  var list, togglerIndex;
  togglerIndex = 0;
  return function () {
    var ret;
    ret = list[togglerIndex];
    togglerIndex += 1;
    if (togglerIndex === list.length) togglerIndex = 0;
    return ret;
  }
}

var word_guess = ""
var word_guesses = []
var next_guess = function () {}
var update_fuzzy = function (letter) {
  word_guesses = []
  next_guess = function () {}
  var current_word = get_current_word()  
  if (letter == " ") {
    // todo: this breaks when you manually move your cursor
    increment_word_count(current_word) 
  } else if (current_word.match(/^\w+$/)) {
    var gap = "(?:.*)"
    var re_string = gap + current_word.split("").join(gap) + gap
    var current_word_regexp = new RegExp(re_string)
    for (word in words) {
      if (word.match(current_word_regexp)) {
        word_guesses.push(word)
      }
    }
    _.sortBy(word_guesses, function(word) {
      -words[word] 
    })
    next_guess = toggler(word_guesses)
    word_guess = next_guess()
    message = word_guess
  }
}

//todo undo and redo

var next = function () {
  find(find_str)
}
var find_str
var find = function (str) {
  find_str = str
  var i = y_cursor + 1
  while (i < lines.length) {
    var line = lines[i].join("")
    
     
     var f = line.toLowerCase().indexOf(str)
     if (f != -1) {
      
      y_cursor = i
      x_cursor = f
      jump(i + 1)
      break
    }
    i+=1
  }
}

var jump_cursor = function () {
  jump(y_cursor, x_cursor)
}

var jump = function (nu, x) {
  nu -= 1
  x = x || 1
  x -= 1
  y_offset = - chr_height * nu
  x_offset = - chr_width * x
  
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

var zoom_level = 1

var zoom = function (lvl) {
  
  var n = 1/zoom_level
  viewport_width *= 1/n
  viewport_height *= 1/n
  ctx.scale(n,n)
  zoom_level = lvl
  ctx.scale(lvl,lvl)
  viewport_width *= 1/lvl
  viewport_height *= 1/lvl
  render()
}
zoom(.8)

var y_selection_start;
var y_selection_end;

var start_selection = function () {
  y_selection_start = y_cursor     
}

var end_selection = function () {
  y_selection_end = y_cursor     
  copy()
}

var copied
if (localStorage.copied) {
  //alert(localStorage.copied)
  copied = JSON.parse(localStorage.copied)
}
var selection

var rawcopy = function () {
  copied = clone(selection)
  // so it deep copies
  localStorage.copied = JSON.stringify(copied)

}

var copy = function () {
  selection = lines.slice(y_selection_start, y_selection_end + 1)
  rawcopy()
}

var copy_line = function () {
  selection = lines.slice(y_cursor, y_cursor+1)
  rawcopy()
}

var delete_line = function () {
  selection = lines.splice(y_cursor, 1)
  rawcopy()
  render()
}


var tab = function () {
  _.each(selection, function (line) {
    line.splice(0, 0, " "," ")
  })
  render()
}

var untab = function () {
  _.each(selection, function (line) {
    line.splice(0, 2)
  })
  render()
}




var cut = function () {
  selection = lines.splice(y_selection_start, y_selection_end - y_selection_start + 1) 
  rawcopy()
  render()
}

var clone = function (x) {
  return JSON.parse(JSON.stringify(x))
}

var paste = function () {
  copied = clone(copied)
  lines.splice.apply(lines, [y_cursor, 0].concat(copied))
  render()
}

var parens = function () {
  add_letter("(")
  add_letter(")")
  x_cursor -= 1
  render() // dont need to render
}

var curlies = function () {
  add_letter("{")
  add_letter("}")
  x_cursor -= 1
  render() // dont need to render
}

var brackets = function () {
  add_letter("[")
  add_letter("]")
  x_cursor -= 1
  render() // dont need to render
}

var quotes = function () {
  add_letter("\"")
  add_letter("\"")
  x_cursor -= 1
  render() // dont need to render
}


var git_push = function(message) {
  $.post("http://m3.drewl.us:8500/push", {message: message}, function (content) {
    alert("done pushing" + content)
  })
  
}

var export_code = function () {
  alert( get_content())
}

var coffee_fn = function () {
  enter_text("() ->")
}

var js_fn = function () {
  enter_text("function () {\n}")
}


var commands = {
 i: enter_text
, t: tab
, ut: untab
, ss: start_selection
, es: end_selection
, se: end_selection
, yy: copy_line
, dd: delete_line
, ps: parens
, cs: curlies
, bks: brackets
, qs: quotes
, git: git_push
, ex: export_code
, cf: coffee_fn
, jf: js_fn

, c: copy
, x: cut
, p: paste
, s: save
, l: load
, f: find
, j: jump
, jc: jump_cursor
, d: duplicate
, u: undo
, r: redo
, z: zoom
, n: next
, pd: add(".")
, cm: add(",")
, lp: add("(")
, rp: add(")")
, cl: add(":")
, eq: add("=")
, dq: add('"')
, lc: add("}")
, us: add("_")
, dh: add("-")

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
  } else if (screen_height - touch.y1 < 100 && (touch.x1 < 50 || touch.x1 > 270)) {
    touch.command = backspace
  } else if (touch.y1 < 100 && touch.x1 < 160) {
    touch.command = function () {
      _.defer(command)
    }
  } else if (touch.y1 < 100 && touch.x1 >= 160) {
    touch.command = backspace
  } else if (touch.x2 > 270) {
    touch.command = newline
  } else if (touch.x1 <= 50) {
    touch.command = enter_control_mode
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

var use_word_guess = function () {
  var start = get_last_start_word_index()
  var len = x_cursor - start
  var current_word = get_current_word()
  lines[y_cursor].splice.apply(lines[y_cursor], [start, len].concat(word_guess.split("")))
  x_cursor = x_cursor - current_word.length + word_guess.length
  render()
}

var do_next_word_guess = function () {
  word_guess = next_guess()
  message = word_guess
  render()
}

var duplicate_line = function () {
  copy_line()
  paste()
}

var goto_top = function () {
  jump(0,0)
}

var add_letter = function (letter) {
  if (letter == "\n") {
    return newline()
  }
  lines[y_cursor].splice(x_cursor, 0, letter)
  update_fuzzy(letter)
  x_cursor += 1
  render()
}
var al = function (letter) {
  return function () {
    add_letter(letter)
  }
}
var insert_line = function () {
  lines.splice(y_cursor + 1, 0, [])
  y_cursor += 1
  x_cursor = 0
  render()
}

var backspace = function () {
  clearTimeout(add_morse_word_timeout)
  if (x_cursor == 0 && y_cursor == 0) return
  if (x_cursor == 0) {
    var l = lines.splice(y_cursor, 1)[0]
    if (y_cursor >= 1) y_cursor -= 1
    prev = lines[y_cursor]
    x_cursor = lines[y_cursor].length
    prev.splice.apply(prev, [prev.length, 0].concat(l))

  } else {
    var removed = lines[y_cursor].splice(x_cursor - 1,1)
    x_cursor -= 1
  }
  render()
}



var input_mode_interval
var input_box
var $input_box
var input_box_length = 0
var input_mode_tick = function (){
  var val = $input_box.val()
  if (val.length < input_box_length) {
    var to_backspace = input_box_length - val.length
    for (var i = 0; i < to_backspace; i++) {
      backspace()
    }
    input_box_length = val.length
    return
  }
  var change = val.substr(input_box_length)
  if (change.length){
    enter_text(change)
  }
  input_box_length = val.length
}

var input_mode = function () {
  if ($input_box) {
    $input_box.remove()
    $input_box = null
    input_box_length = 0
    clearTimeout(input_mode_interval )
    return
  }
  input_box = document.createElement("textarea")

  $input_box = $(input_box)
  var i = $input_box
  i.css({
    position: "absolute",
    opacity: 0.001,
    "font-size": "10px",
    top: "76px",
    //left: "-50px", //it is a lot slower if you try to move it off screen
  })
  i.blur(function (){
    input_mode()
  })
  $(document.body).append(i)
  input_box.focus()
  input_mode_interval = setInterval(input_mode_tick, 50)
}

var export2 = function () {
  url = "data:text/html," + encodeURIComponent("<textarea>"+get_content()+"</text"+"area>")
  window.open(url)

}
var swipe_down_actions = {
  e: use_word_guess,
  p: paste,
  i: do_next_word_guess,
  t: function () {
    enter_control_mode()
  },
  n: next,
  y: copy_line,
  d: duplicate_line,
  o: insert_line,
  s: export2,

}

var uppercase_letter = function () {
  letter = lines[y_cursor][x_cursor - 1].toUpperCase()
  lines[y_cursor][x_cursor-1] = letter
  render()
}

var swipe_up_actions = {
  t: goto_top,
  d: delete_line,
  s: save,
  y: copy_line,
  u: uppercase_letter,
  e: input_mode,
}

var swipe_left_actions = {
  e: backspace,
  t: function () {
    alert("left")
  }
  
  
}
var swipe_right_actions = {
  p: parens,
  m: al(","),
  e: al(" "),
  t: al("."),
  n: al(":"),
  h: al("#"),
  d: al("-"),
  u: al("_"),
  g: al(">"),
  l: al("<"),
  s: al("'"),
  i: al("="),
  a: al("+"),
  o: al("!"),
  f: al("/"),
  newline: function () {
    x_cursor += 1
    render()
  },
  
  q: quotes,
  b: brackets,
  c: curlies,
  
}


var call_swipe_action = function (swipe_actions) {
  var morse_letter = get_morse_letter()
  var action = swipe_actions[morse_letter]
  if (action) {
    action()
  }
  codes = []
}

touch_helper.onswipeup = function (touch) {
  call_swipe_action(swipe_up_actions)
}

touch_helper.onswipedown = function (touch) {
  call_swipe_action(swipe_down_actions)
}

touch_helper.onswipeleft = function (touch) {
  call_swipe_action(swipe_left_actions)
}

touch_helper.onswiperight = function (touch) {
  call_swipe_action(swipe_right_actions)
}




touch_helper.onscroll = function (touch) {
  if (codes.length) {
    touch.in_scroll_letter = true
  }

  if (!touch.in_scroll_letter) {
    x_offset += touch.x_diff / zoom_level
    y_offset += touch.y_diff / zoom_level
    render()
  }
} 
  

var move_cursor = function (touch) {
  y_cursor = Math.floor((touch.y2/zoom_level - y_offset)/ chr_height)
  x_cursor = Math.floor((touch.x2/zoom_level - x_offset)/ chr_width)
   
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

var find_matches = function () {

}





var newline = function () {
  if (in_control_mode) {
    return exit_control_mode()
  }
  clearTimeout(add_morse_word_timeout)

  var word = get_current_word()  
  increment_word_count(word)

  lines.splice(y_cursor + 1, 0, lines[y_cursor].splice(x_cursor))
  y_cursor += 1
  x_cursor = 0
  render()
}

var in_control_mode = false
var enter_control_mode = function () {
  if (in_control_mode) {
    jump_cursor()
    in_control_mode = false
    return
  }
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

var get_morse_letter = function () {
  return morse_codes[codes.join("")]
}

var add_morse_letter = function () {
  if (finger == "down") return;
  var letter = get_morse_letter()
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

var dot_length = 40 //40
var dash_length = dot_length * 3

var letter_spacing = dot_length * 3 
var word_spacing = dot_length * 7 
var codes = []
var morse_codes = {
  ".-.-" : "newline",
  ".-.-.": "AR",
  "......": "backspace",
  //"---.": "backspace",
  //"----": "control",
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
  commands[ltrs] = add(ltr)
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
load(location.hash.substr(1))

}
setTimeout(function () { 
  window.scrollTo(0, 1)
  
  start()
}, 100)



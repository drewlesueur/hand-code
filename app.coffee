express = require "express"

app = express()

async = require("async")
path = require("path")

callbacker = (func) ->
  (args...) ->
    (callback) ->
      func args..., (args...) ->
        callback args...

exec = callbacker require('child_process').exec
write = callbacker require("fs").writeFile

load = (pf, res) ->
  command = "cat ../#{pf}"
  console.log command
  exec(command) (err, c) ->
    res.send c

  #async.series [
  #  exec("cat index.html")
  #  exec(command),
  #], (err, results) ->
  #  [index_page, file] = results
  #  res.send """
  #    #{index_page}
  #    <script>
  #      lines = text_to_lines(#{JSON.stringify(file)})
  #    </script>
  #  """
  
save = (pf, content, res) ->
  project = path.dirname pf
  file = path.basename pf
  async.series [
    exec("mkdir -p ../#{project}")
    write("../#{project}/#{file}", content)
  ], (err) ->
    console.log err
    console.log "saved"
    res.send "ok"


enableCORS = (req, res, next) ->
  res.setHeader "Access-Control-Allow-Origin", "*"
  res.setHeader "Access-Control-Allow-Headers", "Content-Type, X-Requested-With"
  next()

app.configure () ->
  app.use enableCORS
  app.use express.bodyParser()
  
app.post "/push", (req, res) ->
  console.log "git push"
  exec("git add . && git commit -m \"#{req.body.message}\" && git push") (err) ->
    console.log "done git"
    console.log err
    
    res.send "git save"

app.post /.*/, (req, res) ->
  save req._parsedUrl.pathname, req.body.content, res


app.get /.*/, (req, res) ->
  load req._parsedUrl.pathname, res

app.listen 8500 

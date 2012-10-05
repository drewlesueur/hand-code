express = require "express"

app = express()

async = require("async")


callbacker = (func) ->
  (args...) ->
    (callback) ->
      func args..., (args...) ->
        callback args...

exec = callbacker require('child_process').exec
write = callbacker require("fs").writeFile

load = (project, file, res) ->
  command = "cat ../#{project}/#{file}"
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
  
save = (project, file, content, res) ->
  async.series [
    exec("mkdir -p ../#{project}")
    write("../#{project}/#{file}", content)
  ], (err) ->
    console.log err
    res.send "ok"


enableCORS = (req, res, next) ->
  res.setHeader "Access-Control-Allow-Origin", "*"
  res.setHeader "Access-Control-Allow-Headers", "Content-Type, X-Requested-With"
  next()

app.configure () ->
  app.use enableCORS
  app.use express.bodyParser()
  
app.post "/:folder/:file", (req, res) ->
  save req.params.folder, req.params.file, req.body.content, res

app.get "/:folder/:file", (req, res) ->
  console.log req.params.folder, req.params.file
  load req.params.folder, req.params.file, res

app.listen 8500 

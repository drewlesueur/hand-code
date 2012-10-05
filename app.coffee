express = require "express"

app = express()

async = require("async")


callbacker = (func) ->
  (args...) ->
    (callback) ->
      func args..., (err) ->
        callback err

exec = callbacker require('child_process').exec
write = callbacker require("fs").writeFile

load = (project, file, res) ->
  exec("cat ../#{project}/#{file}") (err, c) ->
    res.send c
  
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
  
app.post "/save/:folder/:file", (req, res) ->
  save req.params.folder, req.params.file, req.body.content, res

app.get "/load/:folder/:file", (req, res) ->
  load req.params.folder, req.params.file, res

app.listen 8500 

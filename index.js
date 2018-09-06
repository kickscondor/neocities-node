var fs       = require('fs')
var path     = require('path')
var url      = require('url')
var qs       = require('querystring')
var request  = require('requestretry')
var FormData = require('form-data')

function NeoCities(user, pass, opts) {
  this.opts = opts || {}
  this.url = this.opts.url || 'https://neocities.org'
  this.username = user
  this.password = pass
  if (this.opts.port)
    this.url.port = this.opts.port
}

NeoCities.prototype.http = function(method, action, args, callback) {
  var uri = url.resolve(this.url, '/api/'+action)
  var req = {uri: uri, method: method, json: true, gzip: true}

  if (args) {
    if (method === 'POST') {
      req.formData = {}
      for (var i = 0; i < args.length; i++) {
        req.formData[args[i].name] = args[i].value
      }
    } else {
      req.qs = args // uri.search = '?' + qs.stringify(args)
    }
  }

  req.auth = {user: this.username, pass: this.password}
  request(req, (err, resp, body) => {
    if (err)
      callback({result: 'error', message: err.message})
    else
      callback(body)
  })
}

NeoCities.prototype.get = function(method, args, callback) {
  this.http('GET', method, args, callback)
}

NeoCities.prototype.post = function(method, args, callback) {
  this.http('POST', method, args, callback)
}

NeoCities.prototype.info = function(sitename, callback) {
  var args = null

  if(typeof sitename == 'function')
    callback = sitename
  else if(typeof sitename == 'string')
    args = {sitename: sitename}

  this.get('info', args, callback)
}

NeoCities.prototype.delete = function(filenames, callback) {
  this.post('delete', [{name: 'filenames', value: filenames}], callback)
}

NeoCities.prototype.upload = function(files, callback) {
  var args = []
  var i

  for(i=0;i<files.length;i++)
    args.push({name: files[i].name, value: fs.createReadStream(files[i].path)})

  this.post('upload', args, callback)
}

module.exports = NeoCities

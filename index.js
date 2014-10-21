var merge = require('merge')
  , util = require('util')
  , Writable = require('stream').Writable
  , ejson = require('mongodb-extended-json')
  , stringToJSON = require('string-to-json')

util.inherits(Transform, Writable)

module.exports = Transform

function Transform(options) {
  Writable.call(this, options)

  if (!options.insert)
    throw new Error("Please specify an insert function")
  else if (!options.update)
    throw new Error("Please specify an update function")
  else if (!options.remove)
    throw new Error("Please specify a remove function")

  this.insert = options.insert
  this.update = options.update
  this.remove = options.remove
  this._queue = []
}

Transform.prototype.transform = function(op) {
  if (typeof op === 'string')
    op = ejson.parse(op)

  if (op.o && op.o._id)
    op.o._id = op.o._id.toString()

  if (op.o2)
    op.o2._id = op.o2._id.toString()

  this._addOpToQueue(op)
}


Transform.prototype._write = function(chunk, enc, next) {
  if (enc === 'buffer')
    chunk = chunk.toString('utf8')

  this.transform(chunk)
  next()
}

Transform.prototype._addOpToQueue = function(op) {
  this._queue.push(op)

  if (this._queue.length === 1)
    this._work()
}

Transform.prototype._pop = function() {
  this._queue.shift()
  this._work()
}

Transform.prototype._work = function() {
  if (this._queue.length === 0)
    return

  var op = this._queue[0]

  switch(op.op) {
    case 'i':
      this.insert(op.o._id, op.o, this._pop.bind(this))
      break
    case 'u':
      this.update(op.o2._id, this._update.bind(this, op.o))
      break
    case 'd':
      this.remove(op.o._id, this._pop.bind(this))
      break
  }
}

Transform.prototype._update = function(change, doc, cb) {
  try {
    if (change["$unset"]) {
      eval("delete doc." + Object.keys(change["$unset"])[0])
    } else if (change["$set"]) {
      merge(doc, stringToJSON.convert(change["$set"]))
    } else {
      change._id = doc._id
      doc = change
    }
  } catch(e) {
    cb(e)
  }

  cb(null, doc, this._pop.bind(this))
}

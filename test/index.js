var store = {}
  , fs = require('fs')
  , Transform = require('../index')
  , transform = new Transform({
    insert: function(_id, doc, cb) {
      store[_id] = doc
      cb()
    },
    update: function(_id, done){
      done(store[_id], function(err, updatedDoc, cb) {
        store[_id] = updatedDoc
        cb()
      })
    },
    remove: function(_id, cb) {
      delete store[_id]
      cb()
    }
  })

describe('oplog-transform', function() {

  it('should work', function(done) {
    fs.createReadStream(__dirname + '/operations.json', {encoding: 'utf8', autoClose: true})
      .on('data', function(data) {
        data.split('\n').forEach(function(op) {
          if (!!op)
            transform.write(op)
        })
      }).on('end', function() {
        store.should.have.property("5403e97c3bd2daf8edc7599d")
        store.should.have.property("5403e9963bd2daf8edc7599e")
        store.should.have.property("5404f4c75578d8020cf36f86")
        store.should.not.have.property("5403ea1c3bd2daf8edc7599f")

        JSON.stringify(store["5403e97c3bd2daf8edc7599d"]).should.eql(JSON.stringify({
          _id: "5403e97c3bd2daf8edc7599d",
          test: 'doc',
          nested: {obj: 'lol'}
        }))

        JSON.stringify(store["5403e9963bd2daf8edc7599e"]).should.eql(JSON.stringify({
          _id: "5403e9963bd2daf8edc7599e",
          test2: 'doc'
        }))

        JSON.stringify(store["5404f4c75578d8020cf36f86"]).should.eql(JSON.stringify({
          lol: "sup",
          _id: "5404f4c75578d8020cf36f86"
        }))

        done()
      })
  })

})

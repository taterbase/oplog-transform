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
        console.log(data)
        data.split('\n').forEach(function(op) {
          if (!!op)
            transform.transform(op)
        })
      }).on('end', function() {
        store.should.have.property("5403e97c3bd2daf8edc7599d")
        store.should.have.property("5403e9963bd2daf8edc7599e")
        store.should.not.have.property("5403ea1c3bd2daf8edc7599f")

        store["5403e97c3bd2daf8edc7599d"].should.eql({
          _id: "5403e97c3bd2daf8edc7599d",
          test: 'doc',
          nested: {obj: 'lol'}
        })

        store["5403e9963bd2daf8edc7599e"].should.eql({
          _id: "5403e9963bd2daf8edc7599e",
          test2: 'doc'
        })

        done()
      })
  })

})

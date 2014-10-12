[![build status](https://travis-ci.org/taterbase/oplog-transform.svg)](https://travis-ci.org/taterbase/oplog-transform)
#Oplog Transform
*Free your oplog*

##Why?
Often people want a duplicate of their data in another data store. Doing imports on an interval works but need to be scheduled. MongoDB replica sets have a [tailable oplog](http://docs.mongodb.org/manual/core/replica-set-oplog/) that provides push like updates about changes happening to the records in the database. By tapping into this we can publish changes to other datastores too, keeping them up to date in real time.

`oplog-transform` is simply a module that provides an interface for `insert`, `update`, and `remove` hooks for you to fill in with how to modify the target datastore. You can then pass in oplog records and `oplog-transform` will use the hooks accordingly.

##Usage

Here is an example of initializing `oplog-transform` using an in-memory JSON object as our datastore.

```javascript
var store = {}
  , Transform = require('oplog-transform')
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
```

You can write to the transform using the `transform` function

```javascript
transform.transform(oplogDoc)
```

Or you can use the streaming interface to pipe oplog docs

```javascript
tailedOplog.pipe(transform)

//or

transform.write(oplogDoc)
```

##Hooks
###`insert`
The insert hook must be a function that accepts 3 parameters, the doc `_id`, the `doc`, and a callback to fire once you've inserted the document

###`update`
The update hook must be a function that accepts 2 parameters, the doc `_id`, a `done` callback. Once you've fetched the document from your target datastore call the `done` callback with the fetched document and a callback to receive an error, the updated document, and a final callback to fire once you've updated the record in your target datastore

###`remove`
The remove hook must be a function that accepts 2 parameters, the doc `_id` and a callback to fire once you've removed the doc.


___

Made with ⚡️ by [@taterbase](https://twitter.com/taterbase)

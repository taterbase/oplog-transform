![](https://travis-ci.org/taterbase/oplog-transform.svg)
#Oplog Transform
*Free your oplog*

##Why?

`oplog-transform` is a utility to let you utilize the MongoDB oplog to apply changes to another database. You set your own `update`, `insert`, and `remove` hooks which will be called as oplog documents are passed in.

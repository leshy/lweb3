_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

core = require '../core'
channel = require './channel'

collectionInterface = core.core.extend4000, {}

collectionProtocol = core.protocol.extend4000, {}

queryToCallback = (callback) ->
    (msg,end) ->
        if not end then throw "this query is supposed to be translated to callback but I got multiple responses"
        callback msg.err, msg.data
        

clientCollection = collectionInterface.extend4000
    initialize: ->
        @name = @get 'name'

    query: (msg,callback) ->
        msg.collection = @name
        @parent.query msg,callback

    create: (data,callback) ->
        @query { create: pattern }, queryToCallback callback

    remote: (pattern,callback) -> 
        @query { remove: pattern }, queryToCallback callback

    findOne: (pattern,callback) ->
        @query { findOne: pattern }, queryToCallback callback

    update: (pattern,data,callback) ->
        @query { update: pattern, data: data }, queryToCallback callback

    find: (pattern,limits,callback,callbackDone) ->
        query = { find: pattern }
        if limits then query.limits = limits
            
        @query query, (msg,end) ->
            if end then return callbackDone null end
            callback null, msg

               
client = exports.client = collectionProtocol.extend4000
    name: 'collectionClient'
    requires: [ channel.client ]
    collectionClass: clientCollection
    
serverCollection = collectionInterface.extend4000
    initialize: ->
        @name = @get 'name'

        @when 'parent', (parent) -> parent.onQuery { collection: @name }, @event

        callbackToRes = (res) -> (err,data) ->
            if err?.name then err = err.name
            res.end err: err, data: data
            
        c = @get 'collection'
        
        @subscribe { create: Object }, (msg, res, realm) ->
            c.createModel msg.create, realm, callbackToRes(res)
            
        @subscribe { remove: Object }, (msg, res, realm) ->
            c.removeModel msg.remove, realm, callbackToRes(res)
            
        @subscribe { update: Object, data: Object }, (msg, res, realm) ->
            c.updateModel msg.update, msg.data, realm, callbackToRes(res)
            
        @subscribe { findOne: Object }, (msg, res, realm) ->
            c.findModel msg.findOne, realm, callbackToRes(res)
            
        @subscribe { call: String, args: v().default([]).Array() }, (msg, res, realm) ->
            c.fcall msg.call, msg.args, realm, callbackToRes(res)
            
        @subscribe { find: Object }, (msg, res, realm) =>
            bucket = new helpers.parallelBucket()
            endCb = bucket.cb()
                        
            c.findModels msg.find, msg.limits or {}, ((err,model) ->
                bucketCallback = bucket.cb()
                model.render realm, (err,data) ->
                    if not err then res.write data
                    bucketCallback()), ((err,data) -> endCb())
                    
            bucket.done(err,data) -> res.end()    


server = exports.server = collectionProtocol.extend4000
    name: 'collectionServer', 'collection'
    requires: [ channel.server ]
    collectionClass: serverCollection


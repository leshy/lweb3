_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'
async = require 'async'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

core = require '../core'
channel = require './channel'
query = require './query'
colors = require 'colors'
collectionInterface = core.core.extend4000 {}

collectionProtocol = core.protocol.extend4000 core.motherShip('collection'),
    functions: ->
        collection: _.bind @collection, @
        collections: @collections
        
queryToCallback = (callback) ->
    (msg,end) ->
        #if not end then throw "this query is supposed to be translated to callback but I got multiple responses"
        callback msg.err, msg.data
        
clientCollection = exports.clientCollection = collectionInterface.extend4000
    initialize: ->
        if @get('autosubscribe') isnt false
            @parent.parent.channel(@get('name')).join (msg) => @event msg

    subscribeModel: (id,callback) ->
        @parent.parent.channel(@get('name') + ":" + id).join (msg) -> callback msg
        return => @parent.parent.channel(@get('name') + ":" + id).part()

    query: (msg,callback) ->
        msg.collection = @get 'name'
        @parent.parent.query msg, callback

    create: (data,callback) ->
        delete data._t
        @query { create: data }, queryToCallback callback

    remove: (pattern,callback) -> 
        @query { remove: pattern }, queryToCallback callback

    findOne: (pattern,callback) ->
        @query { findOne: pattern }, queryToCallback callback

    update: (pattern,data,callback) ->
        @query { update: pattern, data: data }, queryToCallback callback

    fcall: (name, args, pattern, callback) ->
        @query { call: name, args: args, pattern: pattern }, queryToCallback callback

    find: (pattern,limits,callback,callbackDone) ->
        query = { find: pattern }
        if limits then query.limits = limits
            
        @query query, (msg,end) ->
            if end then return helpers.cbc callbackDone, null, end
            callback null, msg
            
client = exports.client = collectionProtocol.extend4000
    defaults:
        name: 'collectionClient'
        collectionClass: clientCollection
    requires: [ channel.client ]
    

serverCollection = exports.serverCollection = collectionInterface.extend4000
    initialize: ->
        c = @c = @get 'collection'
        @permissions = {}

        @set name: name =  c.get('name')
        
        broadcast = @get('broadcast')
        if broadcast is true or broadcast is '*'
            broadcast = update: true, remove: true, create: true


        console.log 'hai', name,broadcast, @get('broadcast')
        if broadcast
            if broadcast.update            
                @c.on 'update', (data) =>
                    if id = data.id then @parent.parent.channel(@get('name') + ":" + id).broadcast action: 'update', update: data

            if broadcast.remove
                @c.on 'remove', (data) => # should get POST REMOVE data from event, so that it can transmit ids
                    if id = data.id
                        #@parent.parent.channel(name).broadcast action: 'remove', remove: id
                        @parent.parent.channel(@get('name') + ":" + id).broadcast action: 'remove'

            if broadcast.create
                @c.on 'create', (data) =>
                    @parent.parent.channel(name).broadcast action: 'create', create: data

        if not permDef = @get('permissions') then console.warn "WARNING: no permissions for collection #{ name }, passing everything"
        else            
            msgTypes = [ 'find', 'findOne', 'create', 'remove', 'update', 'call' ]
            
            permDef helpers.dictMap msgTypes, (val,msgType) =>
                    @permissions[msgType] = []
                    
                    return (matchMsg, matchRealm) =>
                        permission = { matchMsg: v(matchMsg) }
                        if matchRealm then permission.matchRealm = v(matchRealm)
                        @permissions[msgType].push permission

        callbackToRes = (res) -> (err,data) ->
            if err?.name then err = err.name
            if err then res.end err: err
            else res.end data: data
        
        @when 'parent', (parent) =>
            parent.parent.onQuery { collection: name }, (msg, res, realm={}) =>
                if msg.create
                    return @applyPermission @permissions.create, msg, realm, (err,msg) ->
                        if err then return res.end err: 'access denied'
                        c.createModel msg.create, realm, callbackToRes(res)
                        
                if msg.remove
                    return @applyPermission @permissions.remove, msg, realm, (err,msg) =>
                        if err then return res.end err: 'access denied'
                        @log 'remove', msg.remove
                        c.removeModel msg.remove, realm, callbackToRes(res)
                        
                if msg.findOne
                    return @applyPermission @permissions.findOne, msg, realm, (err,msg) =>
                        if err then return res.end err: 'access denied'
                        @log 'findOne', msg.findOne
                        c.findModel msg.findOne, (err,model) ->
                            if err then return callbackToRes(res)(err)
                            model.render realm, callbackToRes(res)
                            if model.gCollect then model.gCollect()

                if msg.call and msg.pattern?.constructor is Object
                    return @applyPermission @permissions.call, msg, realm, (err,msg) =>
                        if err then return res.end err: 'access denied'
                        @log 'call', msg.pattern, msg.call, msg.args
                        c.fcall msg.call, msg.args or [], msg.pattern, realm, callbackToRes(res), (err,data) ->
                            if err?.name then err = err.name
                            res.end err: err, data: data

                if msg.update and msg.data
                    return @applyPermission @permissions.update, msg, realm, (err,msg) =>
                        if err then return res.end err: 'access denied'
                        @log 'update', msg.update, msg.data
                        c.updateModel msg.update, msg.data, realm, callbackToRes(res)

                if msg.find
                    return @applyPermission @permissions.find, msg, realm, (err,msg) =>
                        if err then return res.end err: 'access denied'
                        bucket = new helpers.parallelBucket()
                        endCb = bucket.cb()
                        @log 'find', msg.find, msg.limits
                        c.findModels msg.find, msg.limits or {}, ((err,model) ->
                            bucketCallback = bucket.cb()
                            model.render realm, (err,data) ->
                                if not err and not _.isEmpty(data) then res.write data
                                if model.gCollect then model.gCollect()
                                bucketCallback()), ((err,data) -> endCb())
                        bucket.done (err,data) -> res.end()

                res.end { err: 'wat' }

                #@core?.event msg.payload, msg.id, realm            
        
    applyPermission: (permissions = [], msg, realm, callback) ->
        async.series _.map(permissions, (permission) ->
            (callback) ->
                permission.matchMsg.feed msg, (err,msg) ->
                    if err then return callback null, err
                    if not permission.matchRealm then callback msg
                    else permission.matchRealm.feed realm, (err) ->
                        if err then callback null, err
                        else callback msg),
            (data,err) ->
                if data then callback null, data
                else callback true, data

server = exports.server = collectionProtocol.extend4000
    defaults:
        name: 'collectionServer'
        collectionClass: serverCollection
        
    requires: [ channel.server ]


serverServer = exports.serverServer = collectionProtocol.extend4000
    defaults:
        name: 'collectionServerServer'
        collectionClass: serverCollection
        
    requires: [ query.serverServer ]

    initialize: ->
        @when 'parent', (parent) =>
            parent.on 'connect', (client) =>
                client.addProtocol new server verbose: @verbose, core: @
                
            _.map parent.clients, (client,id) =>
                client.addProtocol new server verbose: @verbose, core: @

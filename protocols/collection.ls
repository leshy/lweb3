_ = require 'underscore'
Backbone = require 'backbone4000'
h = helpers = require 'helpers'
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

callbackToQuery = query.callbackToQuery
queryToCallback = query.queryToCallback

clientCollection = exports.clientCollection = collectionInterface.extend4000 do
  initialize: ->
    if @get('autosubscribe') isnt false
      @parent.parent.channel(@get('name')).join (msg) ~> @event msg

  subscribeModel: (id,callback) ->
    @parent.parent.channel(@get('name') + ":" + id).join (msg) -> callback msg
    return ~> @parent.parent.channel(@get('name') + ":" + id).part()

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

client = exports.client = collectionProtocol.extend4000 do
  defaults:
    name: 'collectionClient'
    collectionClass: clientCollection
  requires: [ channel.client ]


serverCollection = exports.serverCollection = collectionInterface.extend4000 do
  initialize: ->
    c = @c = @get 'collection'
    @permissions = {}

    @set name: (name =  c.get('name'))

    broadcast = @get('broadcast')
    if broadcast is true or broadcast is '*'
      broadcast = update: true, remove: true, create: true

    #console.log 'hai', name, broadcast

    if broadcast
      if broadcast.update
        @c.on 'update', (data) ~>
          if id = data.id then @parent.parent.channel(name + ":" + id).broadcast action: 'update', update: data

      if broadcast.remove
        @c.on 'remove', (data) ~> # should get POST REMOVE data from event, so that it can transmit ids
          if id = data.id
            @parent.parent.channel(name + ":" + id).broadcast action: 'remove'

      if broadcast.create
        @c.on 'create', (data) ~>
          @parent.parent.channel(name).broadcast action: 'create', create: data


    parsePermissions = (permissions) ->
      if permissions then def = false else def = true
      
      keys = { +find, +findOne, +call, +create, +remove, +update }

      h.dictMap keys, (val, key) ->
        permission = permissions[key]
        switch x = permission?@@
          | undefined => def
          | Boolean   => permission
          | Object    => h.dictMap permission, (value, key) -> if key isnt 'chew' then v value else value  # instantiate validators
      

    if not (permissions = @get 'permissions') then console.warn "WARNING: no permissions for collection #{ name }"
    @permissions = parsePermissions permissions

    @when 'parent', (parent) ~>
      parent.parent.onQuery { collection: name }, (msg, res, realm={}) ~>

        if msg.create
          return @applyPermission @permissions.create, msg, realm, (err,msg) ->
            if err then return res.end err: 'access denied to collection: ' + err
            c.createModel msg.create, realm, (err,model) ->
              if err?stack? then console.log err.stack;
              if err then return callbackToQuery(res)(err)
              model.render realm, callbackToQuery(res)

        if msg.remove
          return @applyPermission @permissions.remove, msg, realm, (err,msg) ~>
            if err then return res.end err: 'access denied to collection: ' + err
            @log 'remove', msg.remove
            c.removeModel msg.remove, realm, callbackToQuery(res)

        if msg.findOne
          return @applyPermission @permissions.findOne, msg, realm, (err,msg) ~>
            if err then return res.end err: 'access denied to collection: ' + err
            @log 'findOne', msg.findOne
            c.findModel msg.findOne, (err,model) ->
                if err then return callbackToQuery(res)(err)
                model.render realm, callbackToQuery(res)


        if msg.call and msg.pattern?.constructor is Object
          return @applyPermission @permissions.call, msg, realm, (err,msg) ~>
            if err then return res.end err: 'access denied to collection: ' + err
            @log 'call', msg, msg.call
            
            c.fcall msg.call, (msg.args or []), msg.pattern, realm, callbackToQuery(res), (err,data) ->
              if err?name then err = err.name
              res.end err: err, data: data

        if msg.update and msg.data
          return @applyPermission @permissions.update, msg, realm, (err,msg) ~>
            if err
              #@log 'update access denied ' + err, msg, 'accessdenied', 'find'
              return res.end err: 'access denied to collection: ' + err
            @log 'update', msg.update, msg.data
            c.updateModel msg.update, msg.data, realm, callbackToQuery(res)

        if msg.find
          return @applyPermission @permissions.find, msg, realm, (err,msg) ~>
            if err
              return res.end err: 'access denied to collection: ' + err
            bucket = new helpers.parallelBucket()
            endCb = bucket.cb()
            @log 'find', msg.find, msg.limits
            c.findModels msg.find, (msg.limits or {}), ((err,model) ->
              bucketCallback = bucket.cb()
              model.render realm, (err,data) ->
                if not err and not _.isEmpty(data) then res.write data
                #if model.active then model.gCollect()
                #
                bucketCallback()), ((err,data) -> endCb())
            bucket.done (err,data) -> res.end()

        res.end { err: 'wat' }

        #@core?.event msg.payload, msg.id, realm

  applyPermission: (permission, msg, realm, cb) ->
    waterfall = { msg: msg }
    
    switch x = permission?@@
      | undefined => cb "No permission"
      | Boolean   =>
        if permission then cb void, msg
        else cb "Explicitly Forbidden"
      | Object    =>

        checkRealm = (realm, cb) ->
          console.log 'checkrealm'
          if permission.realm? then permission.realm.feed realm, cb
          else _.defer cb

        checkValue = (msg, cb) -> 
          if permission.value? then permission.value.feed msg, cb
          else _.defer -> cb void, msg

        checkChew = (msg,realm, cb) -> 
          if permission.chew? then permission.chew msg, realm, cb
          else _.defer -> cb void, msg
          
        checkRealm realm, (err,data) ->
          if err then return cb "Realm Access Denied"
          checkValue msg, (err,msg) ->
            if err then return cb "Value Access Denied"
            checkChew msg, realm, (err,msg) ->
              if err then return cb "Chew Access Denied"
              cb void, msg
            
  applyPermission_: (permissions = [], msg, realm, callback) ->
    if not permissions.length then return callback "Access Denied"

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

server = exports.server = collectionProtocol.extend4000 do
  defaults:
    name: 'collectionServer'
    collectionClass: serverCollection

  requires: [ channel.server ]


serverServer = exports.serverServer = collectionProtocol.extend4000 do
  defaults:
    name: 'collectionServerServer'
    collectionClass: serverCollection

  requires: [ query.serverServer ]

  initialize: ->
    @when 'parent', (parent) ~>
      parent.on 'connect', (client) ~>
        client.addProtocol new server verbose: @verbose, core: @

      _.map parent.clients, (client,id) ~>
        client.addProtocol new server verbose: @verbose, core: @

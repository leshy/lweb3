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
    @query { update: { pattern: pattern, data: data }}, queryToCallback callback

  fcall: (name, args, pattern, callback) ->
    @query { call: { name: name, args: args, pattern: pattern }}, queryToCallback callback

  find: (pattern,limits,callback,callbackDone) ->
    query = { find: { pattern: pattern } }
    if limits then query.find.limits = limits

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
            #@parent.parent.channel(name).broadcast action: 'remove', remove: id
            @parent.parent.channel(name + ":" + id).broadcast action: 'remove'

      if broadcast.create
        @c.on 'create', (data) ~>
          @parent.parent.channel(name).broadcast action: 'create', create: data
    
    @when 'parent', (parent) ~>
      parent.parent.onQuery { collection: name }, (msg, res, realm={}) ~>
        if msg.create then c.rCreate realm, msg.create, callbackToQuery res
        if msg.remove then c.rRemove realm, msg.remove, callbackToQuery res
        if msg.findOne then c.rFindOne realm, msg.findOne, callbackToQuery res
        if msg.call then c.rCall realm, msg.call, callbackToQuery res
        if msg.update then c.rUpdate realm, msg.update, callbackToQuery res
        if msg.find then c.rFind(realm, msg.find,
          ((err,data) -> res.write data),
          (-> res.end()))

        #@core?.event msg.payload, msg.id, realm

  applyPermission: (permission, msg, realm, cb) ->    
    switch x = permission?@@
      | undefined => cb "Access Denied - No Perm"
      | Boolean   =>
        if permission then cb void, msg
        else cb "Access Denied - Forbidden"
      | Object    =>

        checkRealm = (realm, cb) ->
          if permission.realm? then permission.realm.feed realm, cb
          else _.defer cb

        checkValue = (msg, cb) -> 
          if permission.value? then permission.value.feed msg, cb
          else _.defer -> cb void, msg

        checkChew = (msg,realm, cb) -> 
          if permission.chew? then permission.chew msg, realm, cb
          else _.defer -> cb void, msg
          
        checkRealm realm, (err,data) ->
          if err then return cb "Access Denied - Realm"
          checkValue msg, (err,msg) ->
            if err then return cb "Access Denied - Value"
            checkChew msg, realm, (err,msg) ->
              if err then return cb "Access Denied - Chew"
              cb void, msg
            

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



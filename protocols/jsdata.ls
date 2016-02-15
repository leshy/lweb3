_ = require 'underscore'
Backbone = require 'backbone4000'
h = helpers = require 'helpers'
async = require 'async'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

core = require '../core'
query = require './query'
colors = require 'colors'

jsDataAdapter = exports.jsDataAdapter = class
  (@connection) -> true
  
  query: (msg,callback) -> new p (resolve,reject) ~> @connection.query { ds: msg }, (data) -> resolve data
      
  create: (resource, attrs, options) ->
    @query { resource: resource.name, create: { attrs: attrs, options: options } }

  find: (resource, id, options) ->
    @query { resource: resource.name, find: { id: id, options: options } }

  findAll: (resource, params, options) ->
    @query { resource: resource.name, findAll: { params: params, options: options } }

  update: (resource, id, attrs, options) ->
    @query { resource: resource.name, update: { id: id, attrs: attrs, options: options }}

  updateAll: (resource, attrs, params, options) ->
    @query { resource: resource.name, update: { params: params, attrs: attrs, options: options }}

  destroy: (resource, id, options) ->
    @query { resource: resource.name, destroy: { id: id, options: options } }
    
  destroyAll: (resource, params, options) ->
    @query { resource: resource.name, destroyAll: { params: params, options: options } }

callbackToQuery = query.callbackToQuery
queryToCallback = query.queryToCallback

server = exports.server = core.protocol.extend4000 do
  defaults:
    name: 'jsDataServer'
      
  requires: [ query.server ]

  initialize: (options) ->
    @db = options.db
    @when 'parent', (parent) ~>
      console.log parent.name()
        
      parent.onQuery { ds: { resource: String, create: Object } }, (msg) ~>
        @db.create msg.ds.resource, msg.ds.create.attrs, msg.ds.create.options
        
      parent.onQuery { ds: { resource: String, find: Object } }, (msg, reply) ~>
        @db.find(msg.ds.resource, msg.ds.find.id, msg.ds.find.options).then -> reply.end it

      parent.onQuery { ds: { resource: String, findAll: Object } }, (msg, reply) ~>
        @db.findAll(msg.ds.resource, msg.ds.findAll.params, msg.ds.findAll.options).then -> reply.end it

      parent.onQuery { ds: { resource: String, update: Object } }, (msg, reply) ~>
        @db.update(msg.ds.resource, msg.ds.update.id, msg.ds.update.attrs, msg.ds.update.options).then -> reply.end it


                

serverServer = exports.serverServer = core.protocol.extend4000 do
  defaults:  
    name: 'jsDataServerServer'

  initialize: (options) ->
    @db = options.db
    @when 'parent', (parent) ~>
      parent.on 'connect', (client) ~>
        client.addProtocol new server verbose: @verbose, core: @, logger: @logger, db: @db

      _.map parent.clients, (client,id) ~>
        client.addProtocol new server verbose: @verbose, core: @, logger: @logger, db: @db



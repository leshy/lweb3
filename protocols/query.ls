#autocompile
_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

core = require '../core'
util = require 'util'
p = require 'bluebird'

query = core.core.extend4000 do
    end: ->
        @get('unsubscribe')()
        @parent.endQuery @id

queryToCallback = exports.queryToCallback = (callback) ->
  (msg,end) ->
    #if not end then throw "this query is supposed to be translated to callback but I got multiple responses"
    callback msg.err, msg.data

callbackToQuery = exports.callbackToQuery = (res) -> (err,data) ->
  if err then err = String(err)
  if err then res.end err: err
  else res.end data: data

client = exports.client = core.protocol.extend4000 validator.ValidatedModel,
    validator:
        timeout: v().Default(5000).Number()

    defaults:
        name: 'queryClient'

    functions: ->
        query: _.bind @send, @
        queryP: _.bind @sendP, @

    initialize: ->
        @when 'parent', (parent) ~>
            parent.subscribe { type: 'reply', id: String }, (msg) ~>
                if msg.end then @log 'Q completed', msg.payload , 'q-' + msg.id
                else @log 'Q reply', msg.payload, 'q-' + msg.id

                @event msg
            parent.once 'end', ~> @end()

    endQuery: (id) ->
        @log 'canceling Q' + ' ' + id
        @parent.send { type: 'queryCancel', id: id }

    # a bit ugly, but works for now
    sendP: (msg) -> new p (resolve,reject) ~>
      ret = []
      first = true
      @send msg, (data, end) ->
        if first and end then return resolve data
        first = false

        if end
          if data then ret.push data
          resolve ret
        else
          ret.push data

    send: (msg, timeout, callback, callbackTimeout) ->
        if timeout?.constructor is Function
            callbackTimeout = callback
            callback = timeout
            timeout = @get('timeout')

        @parent.send { type: 'query', id: id = helpers.uuid(10), payload: msg }
        @log 'Q starting', msg, 'q-' + id

        q = new query parent: @, id: id

        cancelTimeout = void;
        
        q.set unsubscribe: unsubscribe = @subscribe { type: 'reply', id: id }, (msg) ~>
          if cancelTimeout then cancelTimeout(); cancelTimeout := undefined
          q.trigger 'msg', msg.payload, msg.end
          if msg.end then unsubscribe(); q.trigger 'end', msg.payload
          helpers.cbc callback, msg.payload, msg.end

        if timeout
          cancelTimeout = helpers.wait timeout, ~>
            @log 'Q timeout', msg, 'q-' + id
            unsubscribe()
            helpers.cbc callbackTimeout

        return q

reply = core.core.extend4000 do
    initialize: ->
        @set name: @get 'id'
        @unsubscribe = @parent.parent.subscribe type: 'queryCancel', id: @get('id'), ~>
            @log 'got query cancel request'
            @cancel()

        @parent.on 'end', ~> @cancel()

    write: (msg) ->
#        if @ended then throw "this reply has ended"
        if @ended then return false
        @parent.send msg, @id, false
        return true

    end: (msg) ->
        @parent.send msg, @id, true
        @unsubscribe()
        @trigger 'end'

    cancel: ->
        @ended = true
        @unsubscribe()
        @trigger 'cancel'
        @trigger 'end'


serverServer = exports.serverServer = core.protocol.extend4000 do
    defaults:
        name: 'queryServerServer'

    functions: ->
        onQuery: _.bind @subscribe, @
        onQueryWait: _.bind @subscribeWait, @
        onQueryOnce: _.bind @subscribeOnce, @
        onQueryError: (callback) ~>
            @on 'error', callback

    subscribe: (pattern,callback) ->
        subscriptionMan.fancy::subscribe.call @, pattern, (payload, id, realm) ~>
            r = new reply(id: id, parent: realm.client.queryServer, realm: realm)
            try
                callback payload, r, realm
            catch error
                @trigger "error", payload, r, realm, error, pattern

    initialize: ->
        @when 'parent', (parent) ~>
            parent.on 'connect', (client) ~>
                client.addProtocol new server verbose: @verbose, core: @

            _.map parent.clients, (client,id) ~>
                client.addProtocol new server verbose: @verbose, core: @

    channel: (channel) ->
        channel.addProtocol new server verbose: @get 'verbose'


server = exports.server = core.protocol.extend4000 do
    defaults:
        name: 'queryServer'

    functions: ->
        onQuery: _.bind @subscribe, @

    initialize: ->
        @when 'core', (core) ~> @core = core

        @when 'parent', (parent) ~>
            parent.subscribe { type: 'query', payload: true }, (msg, realm) ~>
                @log 'query receive ' + util.inspect(msg.payload, depth: 0), { payload: msg.payload }, 'q-' + msg.id
                @event msg.payload, msg.id, realm
                @core?.event msg.payload, msg.id, realm

            parent.on 'end', ~> @end()

    send: (payload,id,end=false) ->
        msg = { type: 'reply', payload: payload, id: id }
        if end
          msg.end = true
#          @log 'query end ' + util.inspect(payload, depth: 0), { payload: payload }, 'q-' + id
        else
#          @log 'query reply ' + util.inspect(payload, depth: 0), { payload: payload }, 'q-' + id
        @parent.send msg

    subscribe: (pattern=true, callback) ->
        subscriptionMan.fancy::subscribe.call @, pattern, (payload, id, realm) ~>
            callback payload, new reply(id: id, parent: @, realm: realm), realm


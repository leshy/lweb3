_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

core = require '../core'
util = require 'util'

query = core.core.extend4000
    end: () ->
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
        timeout: v().Default(3000).Number()

    defaults:
        name: 'queryClient'

    functions: ->
        query: _.bind @send, @

    initialize: ->
        @when 'parent', (parent) =>
            parent.subscribe { type: 'reply', id: String }, (msg) =>
                if msg.end then @log 'Q completed', msg.payload , 'q-' + msg.id
                else @log 'Q reply', msg.payload, 'q-' + msg.id

                @event msg
            parent.on 'end', => @end()

    endQuery: (id) ->
        @log 'canceling Q' + ' ' + id
        @parent.send { type: 'queryCancel', id: id }

    send: (msg, timeout, callback) ->
        if timeout?.constructor is Function
            callback = timeout
            timeout = @get('timeout')

        @parent.send { type: 'query', id: id = helpers.uuid(10), payload: msg }
        @log 'Q starting', msg, 'q-' + id

        q = new query parent: @, id: id

        q.set unsubscribe: unsubscribe = @subscribe { type: 'reply', id: id }, (msg) =>
          q.trigger 'msg', msg.payload, msg.end
          if msg.end then unsubscribe(); q.trigger 'end', msg.payload
          helpers.cbc callback, msg.payload, msg.end

        #setTimeout unsubscribe, timeout
        return q


reply = core.core.extend4000
    initialize: ->
        @set name: @get 'id'
        @unsubscribe = @parent.parent.subscribe type: 'queryCancel', id: @get('id'), =>
            @log 'got query cancel request'
            @cancel()

        @parent.on 'end', => @cancel()

    write: (msg) ->
#        if @ended then throw "this reply has ended"
        if @ended then return false
        @parent.send msg, @id, false
        return true

    end: (msg) ->
        if not @ended then @ended = true else console.error "this reply has ended"; console.error new Error().stack; return
        @unsubscribe()
        @parent.send msg, @id, true
        @trigger 'end'

    cancel: ->
        @ended = true
        @unsubscribe()
        @trigger 'cancel'
        @trigger 'end'


serverServer = exports.serverServer = core.protocol.extend4000
    defaults:
        name: 'queryServerServer'

    functions: ->
        onQuery: _.bind @subscribe, @
        onQueryWait: _.bind @subscribeWait, @
        onQueryOnce: _.bind @subscribeOnce, @
        onQueryError: (callback) =>
            @on 'error', callback

    subscribe: (pattern,callback) ->
        subscriptionMan.fancy::subscribe.call @, pattern, (payload, id, realm) =>
            r = new reply(id: id, parent: realm.client.queryServer, realm: realm)
            try
                callback payload, r, realm
            catch error
                #console.log "ERROR", error, error.stack
                @trigger "error", payload, r, realm, error, pattern

    initialize: ->
        @when 'parent', (parent) =>
            parent.on 'connect', (client) =>
                client.addProtocol new server verbose: @verbose, core: @, logger: @logger

            _.map parent.clients, (client,id) =>
                client.addProtocol new server verbose: @verbose, core: @, logger: @logger

    channel: (channel) ->
        channel.addProtocol new server verbose: @get 'verbose'


server = exports.server = core.protocol.extend4000
    defaults:
        name: 'queryServer'

    functions: ->
        onQuery: _.bind @subscribe, @

    initialize: ->
        @when 'core', (core) => @core = core

        @when 'parent', (parent) =>
            parent.subscribe { type: 'query', payload: true }, (msg, realm) =>
                @log 'query receive ' + util.inspect(msg.payload, depth: 0), { payload: msg.payload }, 'q-' + msg.id
                @event msg.payload, msg.id, realm
                @core?.event msg.payload, msg.id, realm

            parent.on 'end', => @end()

    send: (payload,id,end=false) ->
        msg = { type: 'reply', payload: payload, id: id }
        if end then msg.end = true; @log 'query end ' + util.inspect(payload, depth: 0), { payload: payload }, 'q-' + id
        else @log 'query reply ' + util.inspect(payload, depth: 0), { payload: payload }, 'q-' + id
        @parent.send msg

    subscribe: (pattern=true, callback) ->
        subscriptionMan.fancy::subscribe.call @, pattern, (payload, id, realm) =>
            callback payload, new reply(id: id, parent: @, realm: realm), realm

_ = require 'underscore'
Backbone = require 'backbone4000'
h = helpers = require 'helpers'

subscriptionMan = require 'subscriptionman2'
validator = require 'validator2-extras'
v = validator.v

startTime = new Date().getTime()

core = exports.core = subscriptionMan.fancy.extend4000
    log: (args...) ->
      if @verbose
        msg = args.shift()
        data = args.shift()
        tags = args
        console.log msg, tags.join(','), data

      if @logger then @logger.log.apply @logger, args

    initialize: (options) ->
        @set options
        if @get('verbose') then @verbose = true

        @when 'parent', (@parent) =>
            if @parent.verbose then @verbose = true
            if not @logger? and @logger isnt false and @parent.logger
              @set logger: @parent.logger.child( tags: (@get('name') or 'unnamed'))

        @when 'logger', (logger) =>
            @logger = logger
            if not logger then return
            logger.addTags oldName = (@get('name') or "unnamed")
            @on 'change:name', (self,name) ->
                logger.delTags oldName
                logger.addTags oldName = name

    name: ->
        if @parent then @parent.name() + "-" + @get('name')
        else @get('name') or 'noname'

    end: ->
        if @ended then return else @ended = true
        @log 'ending', {}, 'end'
        @trigger 'end'

protocolHost = exports.protocolHost = core.extend4000
    initialize: ->
        @protocols = {}

    hasProtocol: (protocol) ->
        if typeof protocol is 'function' then return Boolean @[protocol::defaults.name]
        if typeof protocol is 'object' then return Boolean @[protocol.name()]
        throw "what is this?"

    addProtocol: (protocol) ->
        if not name = protocol.name() then throw "what is this?"

        if @hasProtocol protocol then return
            #this sometimes throws and I dong't care about it actually. commented
            #throw "this protocol (#{protocol.name()}) is already active on channel"
        _.map protocol.requires, (dependancyProtocol) =>
            if not @hasProtocol dependancyProtocol then @addProtocol new dependancyProtocol()

        @[name] = protocol
        protocol.set parent: @

        if protocol.functions then _.extend @, protocol.functions()


channel = exports.channel = protocolHost.extend4000
    initialize: -> @realm = @getRealm()
    send: (msg) -> throw 'not implemented'
    getRealm: () -> { client: @ }

protocol = exports.protocol = core.extend4000
    requires: []

channelHost = exports.channelHost = Backbone.Model.extend4000
  initialize: ->
    if not @defaultChannelClass then @defaultChannelClass = @get 'defaultChannelClass'
    if channelClass = @get('channelClass') or @channelClass
      @channelClass = @defaultChannelClass.extend4000 channelClass
    else @channelClass = @defaultChannelClass

# has events like 'connect' and 'disconnect', provides channel objects
# has clients dictionary mapping ids to clients
server = exports.server = protocolHost.extend4000 channelHost,
    channelName: -> @idCounter++
    initialize: ->
        @idCounter = 1

        @clients = @children = {}

    receiveConnection: (channel) ->
        name = channel.get('name')

        @listenTo channel, 'change:name', (model,newname) =>
            delete @clients[name]
            @clients[newname] = model
            @trigger 'connect:' + newname, model

        @listenToOnce channel, 'end', =>
          @stopListening channel
          delete @clients[name]

        @clients[name] = channel

        @trigger 'connect:' + name, channel
        @trigger 'connect', channel


# Just a common pattern,
# this is for model that hosts bunch of models of a same type with names and references to parent
# it automatically instantiates new ones when they are mentioned
#
# used for channelserver.. for example channelServer.channel('bla') automatically instantiates channelClass with name bla
#
# also used for collection server or client

motherShip = exports.motherShip = (name) ->
    model = {}

    model.initialize = ->
        @[name + "s"] = {}

    model[name] = (instanceName, attributes={}) ->
        if instance = @[name + "s"][instanceName] then return instance

        instanceClass = @get(name + "Class")
        if not instanceClass then throw "I don't have " + name + "Class defined"
        instance = @[name + "s"][instanceName] = new instanceClass _.extend { parent: @, name: instanceName }, attributes
        instance.once 'end', => delete @[name + "s"][instanceName]
        @trigger 'new' + helpers.capitalize(name), instance
        return instance

    Backbone.Model.extend4000 model

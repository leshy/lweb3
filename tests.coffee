validator = require('validator2-extras'); v = validator.v

Server = require './transports/server/websocket'
Client = require './transports/client/websocket'

helpers = require 'helpers'
express = require 'express'
Http = require 'http'

port = 8192
colors = require 'colors'
logger3 = require 'logger3'

gimmeEnv = (callback) ->
    app = express()
    http = Http.createServer app

    # I dont know why but I need to cycle ports, maybe http doesn't fully close, I don't know man.
    http.listen ++port

    lwebs = new Server.webSocketServer http: http
    lwebc = new Client.webSocketClient host: 'http://localhost:' + port

    lwebs.log = new logger3.Logger({ outputs: { Console: {} }, context: { tags: [ 'webSocketServer'] } })
    lwebc.log = new logger3.Logger({ outputs: {} })

    lwebs.on 'connect', (s) -> callback lwebs, s, lwebc, (test) ->
        lwebc.end()
        helpers.wait 30, ->
            lwebs.end()
            helpers.wait 10, -> test.done()



exports.init = (test) ->
    gimmeEnv (lwebs, s, c, done) ->
        done test

exports.ClientSend = (test) ->
    gimmeEnv (lwebs, s, c, done) ->
        s.verbose = true
        c.verbose = true
        cnt = 0
        s.subscribe { test: true}, (msg) ->
            done test
        c.send { test: 1 }

exports.ServerSend = (test) ->
    gimmeEnv (lwebs, s, c, done) ->
        s.verbose = true
        c.verbose = true
        c.subscribe { test: true}, (msg) ->
            done test
        s.send { test: 1 }

exports.QueryProtocol = (test) ->
    query = require('./protocols/query')

    gimmeEnv (lwebs, s, c,done) ->
        s.addProtocol new query.server( verbose: false )
        c.addProtocol new query.client( verbose: false )

        s.queryServer.subscribe { test: Number }, (msg, reply) ->
            reply.write reply: msg.test + 3
            helpers.wait 100, -> reply.end reply: msg.test + 2

        total = 0

        c.queryClient.send { test: 7 }, (msg, end) ->
            total += msg.reply
            if end
                test.equal total, 19
                done test


exports.QueryProtocolCancel = (test) ->
    query = require('./protocols/query')

    gimmeEnv (lwebs, s, c,done) ->
        s.addProtocol new query.server( verbose: false )
        c.addProtocol new query.client( verbose: false )

        s.queryServer.subscribe { test: Number }, (msg, reply) ->
            reply.write reply: msg.test + 3
            helpers.wait 100, -> test.equal reply.ended, true

        total = 0

        query = c.queryClient.send { test: 7 }, (msg, end) ->
            query.end()
            total += msg.reply

            c.subscribe { type: 'reply', end: true }, (msg) ->
                test.ok false, "didnt cancel"

            done test


exports.ChannelProtocol = (test) ->
    channel = require('./protocols/channel')
    query = require('./protocols/query')

    gimmeEnv (lwebs, s, c, done) ->
        s.addProtocol new query.server( verbose: false )
        c.addProtocol new query.client( verbose: false )
        s.addProtocol new channel.server( verbose: false )
        c.addProtocol new channel.client( verbose: false )

        c.join ('testchannel'), (msg) ->
            test.equal msg.bla, 3, "bla isn't 3. BLA ISN'T 3 MAN!!!"
            c.channels.testchannel.part()

        helpers.wait 50, ->
            s.channels.testchannel.broadcast { test: 2, bla: 3 }
            helpers.wait 50, ->
                s.channelServer.channel('testchannel').broadcast { test: 1, bla: 2 }
                helpers.wait 25, -> # make sure client parted and didn't receive bla: 2 msg
                    done test


exports.queryServerServer = (test) ->
    gimmeEnv (lwebs, s, c, done) ->
        query = require('./protocols/query')
        s.verbose = true
        c.verbose = true

        lwebs.addProtocol new query.serverServer verbose: false

        lwebs.onQuery bla: Number, (msg,reply,realm) ->
            console.log "SERVERQUERY", msg
            reply.end( bla: 666 )

        c.addProtocol new query.client verbose: false

        c.query bla: 3, (reply,end) ->
            test.equal end, true
            test.deepEqual reply, { bla: 666 }
            done test
###
exports.CollectionProtocol = (test) ->
    mongodb = require 'mongodb'
    channel = require('./protocols/channel')
    query = require('./protocols/query')
    collectionProtocol = require './protocols/collection'
    collectionsS = require 'collections/serverside'
    collectionsC = require 'collections'
    gimmeEnv (lwebs,s,c,done) ->
        helpers.wait 100, ->
            db = new mongodb.Db 'testdb', new mongodb.Server('localhost', 27017), safe: true
            db.open (err,data) ->
                if err then test.fail err
                s.addProtocol new query.server verbose: false
                s.addProtocol new channel.server verbose: false
                s.addProtocol new collectionProtocol.server verbose: false

                c.addProtocol new query.client verbose: false
                c.addProtocol new channel.client verbose: false
                c.addProtocol new collectionProtocol.client
                    verbose: false
                    collectionClass: collectionsC.ModelMixin.extend4000 collectionsC.ReferenceMixin, collectionProtocol.clientCollection


                mongoCollection = new collectionsS.MongoCollection collection: 'bla', db: db
                serverM = mongoCollection.defineModel 'bla',
                    permissions: collectionsS.definePermissions (write, execute, read) ->
                        write 'test', new collectionsS.Permission()

                serverC = s.collection 'bla',
                    collection: mongoCollection
                    broadcast: '*'

                clientC = c.collection 'bla'
                clientM = clientC.defineModel 'bla', {}

                x = new clientM({test:'data' })

                x.flush (err,data) ->
                    if err then test.error err
                    x.remove ->
                        done test
###


exports.CollectionProtocolPermissions = (test) ->
    mongodb = require 'mongodb'
    channel = require('./protocols/channel')
    query = require('./protocols/query')
    collectionProtocol = require './protocols/collection'
    collectionsS = require 'collections/serverside'
    collectionsC = require 'collections'
    gimmeEnv (lwebs,s,c,done) ->
        helpers.wait 100, ->
            db = new mongodb.Db 'testdb', new mongodb.Server('localhost', 27017), safe: true
            db.open (err,data) ->
                if err then test.fail err
                s.addProtocol new query.server verbose: false
                s.addProtocol new channel.server verbose: false
                s.addProtocol new collectionProtocol.server verbose: false

                c.addProtocol new query.client verbose: false
                c.addProtocol new channel.client verbose: false
                c.addProtocol new collectionProtocol.client
                    verbose: false
                    collectionClass: collectionsC.ModelMixin.extend4000 collectionsC.ReferenceMixin, collectionProtocol.clientCollection

                mongoCollection = new collectionsS.MongoCollection collection: 'bla', db: db
                serverM = mongoCollection.defineModel 'bla',
                    permissions: collectionsS.definePermissions (write, execute, read) ->
                        write 'test', new collectionsS.Permission()

                serverC = s.collection 'bla',
                    collection: mongoCollection
                    broadcast: '*'
                    permissions: (perm) ->
                        perm.create true

                console.log serverC.permissions

                clientC = c.collection 'bla'
                clientM = clientC.defineModel 'bla', {}

                x = new clientM({test:'data' })

                x.flush (err,data) ->
                    if err then test.error err
                    x.remove (err,data) ->
                        console.log err,data
                        if not err then test.error 'remove passed'
                        serverC.permissions.remove.push { matchMsg: v(true) }
                        x.remove (err,data) ->
                            if err then test.error 'remove didnt pass'
                            done test

class Test
    done: ->
        console.log 'test done'
        process.exit(0)

    error: (err) ->
        console.log 'ERROR',err
        process.exit(0)

    equal: (x,y) ->
        if x isnt y then throw "not equal"
    deepEqual: -> true
    ok: -> true


#exports.QueryProtocol new Test()
#exports.queryServerServer new Test()
#exports.CollectionProtocolPermissions new Test()

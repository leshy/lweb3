validator = require('validator2-extras'); v = validator.v

Server = require './transports/server/websocket'
Client = require './transports/client/websocket'

helpers = require 'helpers'
express = require 'express'
Http = require 'http'

port = 8192
colors = require 'colors'
gimmeEnv = (callback) -> 
    app = express()
    http = Http.createServer app
    
    # I dont know why but I need to cycle ports, maybe http doesn't fully close, I don't know man.
    http.listen ++port 

    lwebs = new Server.webSocketServer http: http, verbose: false
    lwebc = new Client.webSocketClient host: 'http://localhost:' + port, verbose: false
    
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
        s.addProtocol new query.server( verbose: true )
        c.addProtocol new query.client( verbose: true )

        s.queryServer.subscribe { test: Number }, (msg, reply) ->
            reply.write reply: msg.test + 3
            helpers.wait 100, -> reply.end reply: msg.test + 2

        total = 0

        c.queryClient.send { test: 7 }, (msg, end) ->
            total += msg.reply
            if end
                test.equal total, 19
                test.done()


exports.QueryProtocolCancel = (test) ->
    query = require('./protocols/query')
    
    gimmeEnv (lwebs, s, c,done) ->
        s.addProtocol new query.server( verbose: true )
        c.addProtocol new query.client( verbose: true )

        s.queryServer.subscribe { test: Number }, (msg, reply) ->
            reply.write reply: msg.test + 3
            helpers.wait 100, -> test.equal reply.ended, true

        total = 0

        query = c.queryClient.send { test: 7 }, (msg, end) ->
            query.end()
            total += msg.reply
            
            c.subscribe { type: 'reply', end: true }, (msg) ->
                test.ok false, "didnt cancel"
                
            helpers.wait 200, -> test.done()
                        

exports.ChannelProtocol = (test) ->
    channel = require('./protocols/channel')
    query = require('./protocols/query')

    gimmeEnv (lwebs, s, c, done) ->
        s.addProtocol new query.server( verbose: true )
        c.addProtocol new query.client( verbose: true )
        s.addProtocol new channel.server( verbose: true )
        c.addProtocol new channel.client( verbose: true )

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

        lwebs.addProtocol new query.serverServer verbose: true

        lwebs.onQuery bla: Number, (msg,reply,realm) ->
            console.log "SERVERQUERY", msg
            reply.end( bla: 666 )
            
        c.addProtocol new query.client verbose: true
        
        c.query bla: 3, (reply,end) ->
            test.equal end, true
            test.deepEqual reply, { bla: 666 }
            done test

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
                s.addProtocol new query.server verbose: true
                s.addProtocol new channel.server verbose: true
                s.addProtocol new collectionProtocol.server verbose: true
                
                c.addProtocol new query.client verbose: true
                c.addProtocol new channel.client verbose: true
                c.addProtocol new collectionProtocol.client
                    verbose: true
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
                        test.done()


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
                s.addProtocol new query.server verbose: true
                s.addProtocol new channel.server verbose: true
                s.addProtocol new collectionProtocol.server verbose: true
                
                c.addProtocol new query.client verbose: true
                c.addProtocol new channel.client verbose: true
                c.addProtocol new collectionProtocol.client
                    verbose: true
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

                
                clientC = c.collection 'bla'
                clientM = clientC.defineModel 'bla', {}
                
                x = new clientM({test:'data' })
                
                x.flush (err,data) ->
                    if err then test.error err
                    x.remove ->
                        test.done()
                



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
exports.CollectionProtocolPermissions new Test()
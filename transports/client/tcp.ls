#autocompile
require! {
  net
  bluebird: p
  '../../core'
}

module.exports <<< require '../tcp'

export tcpClient = exports.tcpSocketChannel.extend4000 do
  defaults:
    name: 'tcpClient'

  initialize: -> 
    @set socket: new net.Socket()

  connect: (opts, cb) -> new p (resolve,reject) ~> 
    opts = {} <<< @attributes{ host, port } <<< opts
    errListener = ~> 
      @end()
      reject it
      
    @socket.on 'error', errListener
    @socket.connect opts, ~> 
      @socket.removeListener 'error', errListener
      resolve!


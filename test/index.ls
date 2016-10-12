require! {
  util
  path
  assert
  chai: { expect }
  leshdash: { head, rpad, lazy, union, assign, omit, map, curry, times, keys, first, wait, head, pwait }
  bluebird: p
  '../index.ls': lweb
}

describe 'cluster', ->
  specify 'tagcomm', ->

    bus = new Bus address: uuid()
    bus.addTags role: "bla", pid: 12412
    
    bus.msg { role: "task" }, bla: 3
    bus.query { role: "task" }, { getCpun: true }, (msg) -> true

  specify 'bus', ->
    
    node = new lweb.bus.redis verbose: true
    node.addTag test: 'lala', xx: '3', blblb: 'fa'
    .then ->
      console.log "SUB DONE"
      node.send { xx: true , test: 'lala'}, { bla: 3 }
      wait 1000, -> console.log 'done'
      

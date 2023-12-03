const { EventEmitter } = require('events')

function Controller(flow = [], timerInterval = 100) {
  const bus = new EventEmitter()

  const timerEvent = () => {
    bus.emit('timer', {
      total: +this.currentNode.payload,
      left: this.left,
      passed: +this.currentNode.payload - this.left
    })
  }
  const startNode = (node) => {
    this.currentNode = node
    bus.emit('node', node)
    delete this.left
    delete this.message
    delete this.command
    switch (node.type) {
      case 'delay':
        this.left = +node.payload
        timerEvent()
        break
      case 'shutup':
        bus.emit('shutup')
        return nextNode()
      case 'message':
        this.message = node.payload
        bus.emit('message', this.message)
        return nextNode()
      case 'command':
        this.command = node.payload
        bus.emit('command', this.command)
        return nextNode()
      case 'exit':
        return this.terminate()
      default:
        throw new Error('Unknown node type')
    }
  }

  const nextNode = () => {
    const next = this.currentNode.next && flow.find((e) => e.id === this.currentNode.next)
    if (next) {
      startNode(next)
    } else {
      this.terminate()
    }
  }

  bus.on('tick', () => {
    if (!this.currentNode) {
      startNode(flow.find((e) => !e.parent))
    }
    if (this.left) {
      const delta = new Date().valueOf() - this.lastTick
      this.left -= delta
      timerEvent()
    }
    if (!this.left || this.left <= 0) {
      nextNode()
    }
    this.lastTick = new Date().valueOf()
  })

  this.terminate = () => {
    clearInterval(this.timer)
    delete this.timer
    bus.emit('terminated')
  }
  this.pause = () => {
    clearInterval(this.timer)
    delete this.timer
    bus.emit('paused')
  }
  this.run = () => {
    this.lastTick = new Date().valueOf()
    this.timer = setInterval(() => {
      bus.emit('tick')
    }, timerInterval)
    bus.emit('run')
  }
  this.on = (event, callback) => bus.on(event, callback)
  this.off = (event, callback) => bus.off(event, callback)
  this.paused = () => !Boolean(this.timer)
}

export default Controller

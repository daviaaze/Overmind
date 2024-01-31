// Invalid task assigned if instantiation fails.

import { profile } from '../../profiler/decorator'
import { Task } from '../Task'

const invalidTarget = {
  ref: '',
  pos: {
    x: 25,
    y: 25,
    roomName: 'W6N1'
  }
}

@profile
export class TaskInvalid extends Task {
  get target () {
    return super.target as null
  }

  constructor () {
    super('INVALID', invalidTarget)
  }

  isValidTask () {
    return false
  }

  isValidTarget () {
    return false
  }

  work () {
    return OK
  }
}

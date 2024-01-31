import { profile } from '../../profiler/decorator'
import { Task } from '../Task'

export type transferAllTargetType =
	| StructureStorage
	| StructureTerminal
	| StructureContainer

export const transferAllTaskName = 'transferAll'

@profile
export class TaskTransferAll extends Task {
  get target (): transferAllTargetType {
    return super.target as transferAllTargetType
  }
  data: {
    skipEnergy?: boolean
  }

  constructor (
    target: transferAllTargetType,
    skipEnergy = false,
    options = {} as TaskOptions
  ) {
    super(transferAllTaskName, target, options)
    this.data.skipEnergy = skipEnergy
  }

  isValidTask () {
    for (const resourceType in this.creep.carry) {
      if (this.data.skipEnergy && resourceType == RESOURCE_ENERGY) {
        continue
      }
      const amountInCarry =
				this.creep.carry[(resourceType as ResourceConstant)] || 0
      if (amountInCarry > 0) {
        return true
      }
    }
    return false
  }

  isValidTarget () {
    return this.target.store.getUsedCapacity() < this.target.store.getCapacity()
  }

  work () {
    for (const resourceType in this.creep.carry) {
      if (this.data.skipEnergy && resourceType == RESOURCE_ENERGY) {
        continue
      }
      const amountInCarry =
				this.creep.carry[(resourceType as ResourceConstant)] || 0
      if (amountInCarry > 0) {
        return this.creep.transfer(
          this.target,
          (resourceType as ResourceConstant)
        )
      }
    }
    return -1
  }
}

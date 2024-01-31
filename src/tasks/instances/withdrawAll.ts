/* Withdraw a resource from a target */

import { type StoreStructure } from '../../declarations/typeGuards'
import { profile } from '../../profiler/decorator'
import { Task } from '../Task'

export type withdrawAllTargetType = StoreStructure | Tombstone

export const withdrawAllTaskName = 'withdrawAll'

@profile
export class TaskWithdrawAll extends Task {
  get target (): withdrawAllTargetType {
    return super.target as withdrawAllTargetType
  }

  constructor (target: withdrawAllTargetType, options = {} as TaskOptions) {
    super(withdrawAllTaskName, target, options)
  }

  isValidTask () {
    return this.creep.carry.getUsedCapacity() < this.creep.carryCapacity
  }

  isValidTarget () {
    return this.target.store.getUsedCapacity() > 0
  }

  work () {
    for (const resourceType in this.target.store) {
      const amountInStore =
				this.target.store[(resourceType as ResourceConstant)] || 0
      if (amountInStore > 0) {
        return this.creep.withdraw(
          this.target,
          (resourceType as ResourceConstant)
        )
      }
    }
    return -1
  }
}

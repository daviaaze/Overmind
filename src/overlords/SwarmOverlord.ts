import _ from 'lodash'
import { type CreepSetup } from '../creepSetups/CreepSetup'
import { profile } from '../profiler/decorator'
import { type Swarm } from '../zerg/Swarm'
import { CombatOverlord } from './CombatOverlord'

/**
 * SwarmOverlords extend the base CombatOverlord class, providing additional methods for spawning and controlling swarms
 */
@profile
export abstract class SwarmOverlord extends CombatOverlord {
  memory: any // swarm overlords must have a memory property
  swarms: Record<string, Swarm>

  /* Wishlist of creeps to simplify spawning logic; includes automatic reporting */

  // TODO: at the moment, this assumes that every swarm within an overlord is the same configuration
  protected swarmWishlist (
    swarmQuantity: number,
    config: Array<{ setup: CreepSetup, amount: number, priority?: number }>
  ) {
    // Make tables to log current and needed creep quantities
    const creepQuantities: Record<string, number> = {}
    const neededQuantities: Record<string, number> = {}

    // Handle filling out existing swarms first
    const validSwarms = _.filter(this.swarms, (swarm) => !swarm.isExpired)
    for (const swarm of validSwarms) {
      for (const creepType of config) {
        const { setup, amount } = creepType
        const priority = creepType.priority || this.priority
        const existingCreepsOfRole = _.filter(
          swarm.creeps,
          (creep) => creep.roleName == setup.role
        )
        // Log current and needed amounts for reporting
        if (!creepQuantities[setup.role]) { creepQuantities[setup.role] = 0 }
        creepQuantities[setup.role] += existingCreepsOfRole.length
        if (!neededQuantities[setup.role]) { neededQuantities[setup.role] = 0 }
        neededQuantities[setup.role] += amount
        // Spawn the needed quantity of creeps
        const spawnQuantity = amount - existingCreepsOfRole.length
        for (let i = 0; i < spawnQuantity; i++) {
          this.requestCreep(setup, { priority })
        }
      }
    }

    // Spawn new swarms as needed
    const numRemainingSwarms = swarmQuantity - validSwarms.length
    for (let n = 0; n < numRemainingSwarms; n++) {
      for (const creepType of config) {
        const { setup, amount } = creepType
        const priority = creepType.priority || this.priority
        if (!neededQuantities[setup.role]) { neededQuantities[setup.role] = 0 }
        neededQuantities[setup.role] += amount
        for (let i = 0; i < amount; i++) {
          this.requestCreep(setup, { priority: priority + 0.5 })
        }
      }
    }

    // Report creep amounts
    for (const role of _.keys(neededQuantities)) {
      this.creepReport(
        role,
        creepQuantities[role] || 0,
        neededQuantities[role]
      )
    }
  }

  abstract makeSwarms (): void
}

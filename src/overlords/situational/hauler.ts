import _ from 'lodash'
import { log } from '../../console/log'
import { Roles, Setups } from '../../creepSetups/setups'
import { isStoreStructure } from '../../declarations/typeGuards'
import { type DirectiveHaul } from '../../directives/resource/haul'
import { Energetics } from '../../logistics/Energetics'
import { Pathing } from '../../movement/Pathing'
import { OverlordPriority } from '../../priorities/priorities_overlords'
import { profile } from '../../profiler/decorator'
import { Tasks } from '../../tasks/Tasks'
import { type Zerg } from '../../zerg/Zerg'
import { Overlord } from '../Overlord'

/**
 * Spawns special-purpose haulers for transporting resources to/from a specified target
 */
@profile
export class HaulingOverlord extends Overlord {
  haulers: Zerg[]
  directive: DirectiveHaul

  requiredRCL: 4

  constructor (
    directive: DirectiveHaul,
    priority = directive.hasDrops
      ? OverlordPriority.collectionUrgent.haul
      : OverlordPriority.collection.haul
  ) {
    super(directive, 'haul', priority)
    this.directive = directive
    this.haulers = this.zerg(Roles.transport)
  }

  init () {
    if (
      !this.colony.storage ||
			this.colony.storage.store.getUsedCapacity() >
				Energetics.settings.storage.total.cap
    ) {
      return
    }
    // Spawn a number of haulers sufficient to move all resources within a lifetime, up to a max
    const MAX_HAULERS = 5
    // Calculate total needed amount of hauling power as (resource amount * trip distance)
    const tripDistance =
			2 *
			Pathing.distance(
        (this.colony.storage || this.colony).pos,
        this.directive.pos
			)
    const haulingPowerNeeded =
			Math.min(
        this.directive.totalResources,
        this.colony.storage.store.getCapacity() -
					this.colony.storage.store.getUsedCapacity()
			) * tripDistance
    // Calculate amount of hauling each hauler provides in a lifetime
    const haulerCarryParts = Setups.transporters.early.getBodyPotential(
      CARRY,
      this.colony
    )
    const haulingPowerPerLifetime =
			CREEP_LIFE_TIME * haulerCarryParts * CARRY_CAPACITY
    // Calculate number of haulers
    const numHaulers = Math.min(
      Math.ceil(haulingPowerNeeded / haulingPowerPerLifetime),
      MAX_HAULERS
    )
    // Request the haulers
    this.wishlist(numHaulers, Setups.transporters.early)
  }

  private handleHauler (hauler: Zerg) {
    if (hauler.carry.getUsedCapacity() === 0) {
      // Travel to directive and collect resources
      if (hauler.inSameRoomAs(this.directive)) {
        // Pick up drops first
        if (this.directive.hasDrops) {
          const allDrops: Resource[] = _.flatten(
            _.values(this.directive.drops)
          )
          const drop = allDrops[0]
          if (drop) {
            hauler.task = Tasks.pickup(drop)
            return
          }
        }
        // Withdraw from store structure
        if (this.directive.storeStructure) {
          let store: Record<string, number> = {}
          if (isStoreStructure(this.directive.storeStructure)) {
            store = _.fromPairs(
                      Object.entries(this.directive.storeStructure.store)
            ) as Record<string, number>
          } else {
            store = {
              energy: this.directive.storeStructure.store.energy
            }
          }
          for (const resourceType in store) {
            if (store[resourceType] > 0) {
              hauler.task = Tasks.withdraw(
                this.directive.storeStructure,
                (resourceType as ResourceConstant)
              )
              return
            }
          }
        }
        // Shouldn't reach here
        log.warning(
					`${hauler.name} in ${hauler.room.print}: nothing to collect!`
        )
      } else {
        // hauler.task = Tasks.goTo(this.directive);
        hauler.goTo(this.directive)
      }
    } else {
      // Travel to colony room and deposit resources
      if (hauler.inSameRoomAs(this.colony)) {
        // Put energy in storage and minerals in terminal if there is one
        for (const resourceType in hauler.carry) {
          if (hauler.carry[(resourceType as ResourceConstant)] == 0) { continue }
          if (resourceType == RESOURCE_ENERGY) {
            // prefer to put energy in storage
            if (
              this.colony.storage &&
							this.colony.storage.store.getUsedCapacity() < STORAGE_CAPACITY
            ) {
              hauler.task = Tasks.transfer(
                this.colony.storage,
                resourceType
              )
              return
            } else if (
              this.colony.terminal &&
							this.colony.terminal.store.getUsedCapacity() <
								TERMINAL_CAPACITY
            ) {
              hauler.task = Tasks.transfer(
                this.colony.terminal,
                resourceType
              )
              return
            }
          } else {
            // prefer to put minerals in terminal
            if (
              this.colony.terminal &&
							this.colony.terminal.store.getUsedCapacity() <
								TERMINAL_CAPACITY
            ) {
              hauler.task = Tasks.transfer(
                this.colony.terminal,
                (resourceType as ResourceConstant)
              )
              return
            } else if (
              this.colony.storage &&
							this.colony.storage.store.getUsedCapacity() < STORAGE_CAPACITY
            ) {
              hauler.task = Tasks.transfer(
                this.colony.storage,
                (resourceType as ResourceConstant)
              )
              return
            }
          }
        }
        // Shouldn't reach here
        log.warning(
					`${hauler.name} in ${hauler.room.print}: nowhere to put resources!`
        )
      } else {
        hauler.task = Tasks.goToRoom(this.colony.room.name)
      }
    }
  }

  run () {
    for (const hauler of this.haulers) {
      if (hauler.isIdle) {
        this.handleHauler(hauler)
      }
      hauler.run()
    }
  }
}

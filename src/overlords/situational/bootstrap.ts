import _ from 'lodash'
import { ColonyStage } from '../../Colony'
import { Roles, Setups } from '../../creepSetups/setups'
import { type DirectiveHarvest } from '../../directives/resource/harvest'
import { type DirectiveBootstrap } from '../../directives/situational/bootstrap'
import { type SpawnRequest } from '../../hiveClusters/hatchery'
import { OverlordPriority } from '../../priorities/priorities_overlords'
import { profile } from '../../profiler/decorator'
import { Tasks } from '../../tasks/Tasks'
import { type Zerg } from '../../zerg/Zerg'
import { Overlord } from '../Overlord'

/**
 * Bootstrapping overlord: spawns small miners and suppliers to recover from a catastrohpic colony crash
 */
@profile
export class BootstrappingOverlord extends Overlord {
  room: Room // Definitely has vision
  fillers: Zerg[]
  withdrawStructures: Array< | StructureStorage
  | StructureTerminal
  | StructureContainer
  | StructureLink
  | StructureTower
  | StructureLab
  | StructurePowerSpawn
  | StructureNuker>

  supplyStructures: Array<StructureSpawn | StructureExtension>

  static settings = {
    spawnBootstrapMinerThreshold: 2500
  }

  constructor (
    directive: DirectiveBootstrap,
    priority = OverlordPriority.emergency.bootstrap
  ) {
    super(directive, 'bootstrap', priority)
    this.fillers = this.zerg(Roles.filler)
    // Calculate structures fillers can supply / withdraw from
    this.supplyStructures = _.filter(
      [...this.colony.spawns, ...this.colony.extensions],
      (structure) => structure.store.energy < structure.store.getCapacity(RESOURCE_ENERGY)
    )
    this.withdrawStructures = _.filter(
      _.compact([
        this.colony.storage!,
        this.colony.terminal!,
        this.colony.powerSpawn!,
        ...this.room.containers,
        ...this.room.links,
        ...this.room.towers,
        ...this.room.labs
      ]),
      (structure) => structure.store.energy > 0
    )
  }

  private spawnBootstrapMiners () {
    // Isolate mining site overlords in the room
    let miningSites = _.filter(
      _.values(this.colony.miningSites),
      (site: DirectiveHarvest) => site.room == this.colony.room
    )
    if (this.colony.spawns[0]) {
      miningSites = _.sortBy(miningSites, (site) =>
        site.pos.getRangeTo(this.colony.spawns[0])
      )
    }
    const miningOverlords = _.map(
      miningSites,
      (site) => site.overlords.mine
    )

    // Create a bootstrapMiners and donate them to the miningSite overlords as needed
    for (const overlord of miningOverlords) {
      const filteredMiners = this.lifetimeFilter(overlord.miners)
      const miningPowerAssigned = _.sum(
        _.map(this.lifetimeFilter(overlord.miners), (creep) =>
          creep.getActiveBodyparts(WORK)
        )
      )
      if (
        miningPowerAssigned < overlord.miningPowerNeeded &&
				filteredMiners.length < overlord.pos.availableNeighbors().length
      ) {
        if (this.colony.hatchery) {
          const request: SpawnRequest = {
            setup: Setups.drones.miners.emergency,
            overlord,
            priority: this.priority + 1
          }
          this.colony.hatchery.enqueue(request)
        }
      }
    }
  }

  init () {
    // At early levels, spawn one miner, then a filler, then the rest of the miners
    if (this.colony.stage == ColonyStage.Larva) {
      if (this.colony.getCreepsByRole(Roles.drone).length == 0) {
        this.spawnBootstrapMiners()
        return
      }
    }
    // Spawn fillers
    if (
      this.colony.getCreepsByRole(Roles.queen).length == 0 &&
			this.colony.hatchery
    ) {
      // no queen
      const transporter = _.first(
        this.colony.getZergByRole(Roles.transport)
      )
      if (transporter) {
        // reassign transporter to be queen
        transporter.reassign(
          this.colony.hatchery.overlord,
          Roles.queen
        )
      } else {
        // wish for a filler
        this.wishlist(1, Setups.filler)
      }
    }
    // Then spawn the rest of the needed miners
    const energyInStructures = _.sum(
      _.map(this.withdrawStructures, (structure) => structure.energy)
    )
    const droppedEnergy = _.sumBy(
      this.room.droppedEnergy,
      (drop) => drop.amount
    )
    if (
      energyInStructures + droppedEnergy <
			BootstrappingOverlord.settings.spawnBootstrapMinerThreshold
    ) {
      this.spawnBootstrapMiners()
    }
  }

  private supplyActions (filler: Zerg) {
    const target = filler.pos.findClosestByRange(this.supplyStructures)
    if (target) {
      filler.task = Tasks.transfer(target)
    } else {
      this.rechargeActions(filler)
    }
  }

  private rechargeActions (filler: Zerg) {
    const target = filler.pos.findClosestByRange(this.withdrawStructures)
    if (target) {
      filler.task = Tasks.withdraw(target)
    } else {
      filler.task = Tasks.recharge()
    }
  }

  private handleFiller (filler: Zerg) {
    if (filler.carry.energy > 0) {
      this.supplyActions(filler)
    } else {
      this.rechargeActions(filler)
    }
  }

  run () {
    for (const filler of this.fillers) {
      if (filler.isIdle) {
        this.handleFiller(filler)
      }
      filler.run()
    }
  }
}

// Type guards library: this allows for instanceof - like behavior for much lower CPU cost. Each type guard
// differentiates an ambiguous input by recognizing one or more unique properties.

import { type CombatZerg } from '../zerg/CombatZerg'
import { type Zerg } from '../zerg/Zerg'

export interface EnergyStructure extends Structure {
  energy: number
  energyCapacity: number
}

export interface StoreStructure extends Structure {
  store: StoreDefinition
  storeCapacity: number
}

export function isEnergyStructure (obj: RoomObject): obj is EnergyStructure {
  return (
    (obj as EnergyStructure).energy != undefined &&
		(obj as EnergyStructure).energyCapacity != undefined
  )
}

export function isStoreStructure (obj: RoomObject): obj is StoreStructure {
  return (
    (obj as StoreStructure).store != undefined &&
		(obj as StoreStructure).storeCapacity != undefined
  )
}

export function isStructure (obj: RoomObject): obj is Structure {
  return (obj as Structure).structureType != undefined
}

export function isOwnedStructure (
  structure: Structure
): structure is OwnedStructure {
  return (structure as OwnedStructure).owner != undefined
}

export function isSource (obj: Source | Mineral): obj is Source {
  return (obj as Source).energy != undefined
}

export function isTombstone (obj: RoomObject): obj is Tombstone {
  return (obj as Tombstone).deathTime != undefined
}

export function isResource (obj: RoomObject): obj is Resource {
  return (obj as Resource).amount != undefined
}

export function hasPos (obj: HasPos | RoomPosition): obj is HasPos {
  return (obj as HasPos).pos != undefined
}

export function isCreep (obj: RoomObject): obj is Creep {
  return (obj as Creep).fatigue != undefined
}

export function isPowerCreep (obj: RoomObject): obj is PowerCreep {
  return (obj as PowerCreep).powers != undefined
}

export function isZerg (creep: Creep | Zerg): creep is Zerg {
  return (creep as Zerg).creep != undefined
}

export function isCombatZerg (
  zerg: Creep | Zerg | CombatZerg
): zerg is CombatZerg {
  return (zerg as CombatZerg).isCombatZerg != undefined
}

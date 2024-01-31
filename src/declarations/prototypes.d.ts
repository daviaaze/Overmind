interface Creep {
  hitsPredicted?: number
  intel?: Record<string, number>
  memory: CreepMemory
  boosts: _ResourceConstantSansEnergy[]
  boostCounts: Record<string, number>
  inRampart: boolean
}

interface ConstructionSite {
  isWalkable: boolean
}

interface Flag {}

type Sink =
	| StructureSpawn
	| StructureExtension
	| StructureLab
	| StructurePowerSpawn
	| StructureNuker
	| StructureTower

type StorageUnit = StructureContainer | StructureTerminal | StructureStorage

type rechargeObjectType =
	| StructureStorage
	| StructureTerminal
	| StructureContainer
	| StructureLink
	| Tombstone
	| Resource

interface Room {
  print: string
  my: boolean
  isOutpost: boolean
  owner: string | undefined
  reservedByMe: boolean
  signedByMe: boolean
  creeps: Creep[]
  sourceKeepers: Creep[]
  hostiles: Creep[]
  dangerousHostiles: Creep[]
  playerHostiles: Creep[]
  invaders: Creep[]
  dangerousPlayerHostiles: Creep[]
  fleeDefaults: HasPos[]
  hostileStructures: Structure[]
  structures: Structure[]
  flags: Flag[]
  // Cached structures
  tombstones: Tombstone[]
  drops: Record<string, Resource[]>
  droppedEnergy: Resource[]
  droppedPower: Resource[]
  // Room structures
  _refreshStructureCache: () => void
  // Multiple structures
  spawns: StructureSpawn[]
  extensions: StructureExtension[]
  roads: StructureRoad[]
  walls: StructureWall[]
  constructedWalls: StructureWall[]
  ramparts: StructureRampart[]
  walkableRamparts: StructureRampart[]
  barriers: Array<StructureWall | StructureRampart>
  storageUnits: StorageUnit[]
  keeperLairs: StructureKeeperLair[]
  portals: StructurePortal[]
  links: StructureLink[]
  towers: StructureTower[]
  labs: StructureLab[]
  containers: StructureContainer[]
  powerBanks: StructurePowerBank[]
  // Single structures
  observer: StructureObserver | undefined
  powerSpawn: StructurePowerSpawn | undefined
  extractor: StructureExtractor | undefined
  nuker: StructureNuker | undefined
  repairables: Structure[]
  rechargeables: rechargeObjectType[]
  sources: Source[]
  mineral: Mineral | undefined
  constructionSites: ConstructionSite[]
  // Used by movement library
  // _defaultMatrix: CostMatrix;
  // _directMatrix: CostMatrix;
  _creepMatrix: CostMatrix
  // _priorityMatrices: { [priority: number]: CostMatrix };
  // _skMatrix: CostMatrix;
  _kitingMatrix: CostMatrix
}

interface RoomObject {
  ref: Id<Structure | Creep>
  targetedBy: string[]

  serialize: () => ProtoRoomObject
}

interface RoomPosition {
  print: string
  printPlain: string
  room: Room | undefined
  name: string
  coordName: string
  isEdge: boolean
  isVisible: boolean
  rangeToEdge: number
  roomCoords: Coord
  neighbors: RoomPosition[]

  inRangeToPos: (pos: RoomPosition, range: number) => boolean

  inRangeToXY: (x: number, y: number, range: number) => boolean

  getRangeToXY: (x: number, y: number) => number

  getPositionsAtRange: (
    range: number,
    includeWalls?: boolean,
    includeEdges?: boolean,
  ) => RoomPosition[]

  getPositionsInRange: (
    range: number,
    includeWalls?: boolean,
    includeEdges?: boolean,
  ) => RoomPosition[]

  getOffsetPos: (dx: number, dy: number) => RoomPosition

  lookFor: <T extends keyof AllLookAtTypes>(
    structureType: T,
  ) => Array<AllLookAtTypes[T]>

  lookForStructure: (structureType: StructureConstant) => Structure | undefined

  isWalkable: (ignoreCreeps?: boolean) => boolean

  availableNeighbors: (ignoreCreeps?: boolean) => RoomPosition[]

  getPositionAtDirection: (
    direction: DirectionConstant,
    range?: number,
  ) => RoomPosition

  getMultiRoomRangeTo: (pos: RoomPosition) => number

  findClosestByLimitedRange: <T>(
    objects: T[] | RoomPosition[],
    rangeLimit: number,
  ) => T | undefined

  findClosestByMultiRoomRange: <T extends _HasRoomPosition>(
    objects: T[],
  ) => T | undefined

  findClosestByRangeThenPath: <T extends _HasRoomPosition>(
    objects: T[],
  ) => T | undefined
}

interface RoomVisual {
  box: (
    x: number,
    y: number,
    w: number,
    h: number,
    style?: LineStyle,
  ) => RoomVisual

  infoBox: (
    info: string[],
    x: number,
    y: number,
    opts?: {
      color: string
      textstyle: boolean
      textsize: number
      textfont: string
      opacity: number
    },
  ) => RoomVisual

  multitext: (
    textLines: string[],
    x: number,
    y: number,
    opts: {
      color?: string
      textstyle?: string
      textsize?: number
      textfont?: string
      opacity?: number
    } = {},
  ) => RoomVisual

  structure: (
    x: number,
    y: number,
    type: string,
    opts?: Record<string, number>,
  ) => RoomVisual

  connectRoads: (opts?: Record<string, number>) => RoomVisual | void

  speech: (
    text: string,
    x: number,
    y: number,
    opts?: Record<string, number>,
  ) => RoomVisual

  animatedPosition: (
    x: number,
    y: number,
    opts?: {
      color?: string
      opacity?: number
      radius?: number
      frames?: number
    },
  ) => RoomVisual

  resource: (
    type: ResourceConstant,
    x: number,
    y: number,
    size?: number,
    opacity?: number,
  ) => number

  _fluid: (
    type: string,
    x: number,
    y: number,
    size?: number,
    opacity?: number,
  ) => void

  _mineral: (
    type: string,
    x: number,
    y: number,
    size?: number,
    opacity?: number,
  ) => void

  _compound: (
    type: string,
    x: number,
    y: number,
    size?: number,
    opacity?: number,
  ) => void

  test: () => RoomVisual
}

interface Structure {
  isWalkable: boolean
}

interface StructureContainer {
  energy: number
  isFull: boolean
  isEmpty: boolean
}

interface StructureController {
  reservedByMe: boolean
  signedByMe: boolean
  signedByScreeps: boolean

  needsReserving: (reserveBuffer: number) => boolean
}

interface StructureExtension {
  isFull: boolean
  isEmpty: boolean
}

interface StructureLink {
  isFull: boolean
  isEmpty: boolean
}

interface StructureStorage {
  energy: number
  isFull: boolean
  isEmpty: boolean
}

interface StructureSpawn {
  isFull: boolean
  isEmpty: boolean

  cost: (bodyArray: string[]) => number
}

interface StructureTerminal {
  energy: unknown
  isFull: boolean
  isEmpty: boolean
  // _send(resourceType: ResourceConstant, amount: number, destination: string, description?: string): ScreepsReturnCode;
}

interface StructureTower {
  isFull: boolean
  isEmpty: boolean

  // run(): void;
  //
  // attackNearestEnemy(): number;
  //
  // healNearestAlly(): number;
  //
  // repairNearestStructure(): number;
  //
  // preventRampartDecay(): number;
}

interface Tombstone {
  energy: number
}

interface String {
  padRight: (length: number, char?: string) => string

  padLeft: (length: number, char?: string) => string
}

interface Number {
  toPercent: (decimals?: number) => string

  truncate: (decimals: number) => number
}

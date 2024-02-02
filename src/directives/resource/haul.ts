import _ from "lodash";
import { isStoreStructure } from "../../declarations/typeGuards";
import { HaulingOverlord } from "../../overlords/situational/hauler";
import { profile } from "../../profiler/decorator";
import { Directive } from "../Directive";
import { getStoreUsage } from "utilities/utils";

interface DirectiveHaulMemory extends FlagMemory {
	totalResources?: number;
}

/**
 * Hauling directive: spawns hauler creeps to move large amounts of resourecs from a location (e.g. draining a storage)
 */
@profile
export class DirectiveHaul extends Directive {
	static directiveName = "haul";
	static color = COLOR_YELLOW;
	static secondaryColor = COLOR_BLUE;

	private _store: StoreDefinition;
	private _drops: Record<string, Resource[]>;

	memory: DirectiveHaulMemory;

	constructor(flag: Flag) {
		super(flag);
	}

	spawnMoarOverlords() {
		this.overlords.haul = new HaulingOverlord(this);
	}

	get targetedBy(): string[] {
		return Overmind.cache.targets[this.ref];
	}

	get drops(): Record<string, Resource[]> {
		if (!this.pos.isVisible) {
			return {};
		}
		if (!this._drops) {
			const drops = this.pos.lookFor(LOOK_RESOURCES) || [];
			this._drops = _.groupBy(drops, drop => drop.resourceType);
		}
		return this._drops;
	}

	get hasDrops(): boolean {
		return _.keys(this.drops).length > 0;
	}

	get storeStructure(): StructureStorage | StructureTerminal | StructureNuker | undefined {
		if (this.pos.isVisible) {
			return (
				(this.pos.lookForStructure(STRUCTURE_STORAGE) as StructureStorage) ||
				(this.pos.lookForStructure(STRUCTURE_TERMINAL) as StructureTerminal) ||
				(this.pos.lookForStructure(STRUCTURE_NUKER) as StructureNuker)
			);
		}
		return undefined;
	}

	get store(): StoreDefinition {
		if (!this._store) {
			// Merge the "storage" of drops with the store of structure
			let store: StoreDefinition;
			if (this.storeStructure) {
				if (isStoreStructure(this.storeStructure)) {
					store = this.storeStructure.store;
				} else {
					store = this.storeStructure.store;
				}
			} else {
				store = { energy: 0 } as StoreDefinition;
			}
			// Merge with drops
			for (const resourceType of RESOURCES_ALL) {
				const totalResourceAmount = _.sumBy(this.drops[resourceType], drop => drop.amount);
				if (store[resourceType]) {
					store[resourceType] += totalResourceAmount;
				} else {
					store[resourceType] = totalResourceAmount;
				}
			}
			this._store = store;
		}
		return this._store;
	}

	/**
	 * Total amount of resources remaining to be transported; cached into memory in case room loses visibility
	 */
	get totalResources(): number {
		if (this.pos.isVisible) {
			this.memory.totalResources = this.store.getUsedCapacity(); // update total amount remaining
		} else {
			if (this.memory.totalResources == undefined) {
				return 1000; // pick some non-zero number so that haulers will spawn
			}
		}
		return this.memory.totalResources;
	}

	init(): void {
		this.alert(`Haul directive active - ${this.totalResources}`);
	}

	run(): void {
		if (this.totalResources == 0) {
			this.remove();
		}
	}
}

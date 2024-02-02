import { profile } from "../../profiler/decorator";
import { Task } from "../Task";

export type pickupTargetType = Resource;
export const pickupTaskName = "pickup";

@profile
export class TaskPickup extends Task {
	get target(): pickupTargetType {
		return super.target as pickupTargetType;
	}

	constructor(target: pickupTargetType, options = {} as TaskOptions) {
		super("pickup", target, options);
		this.settings.oneShot = true;
	}

	isValidTask() {
		return this.creep.carry.getUsedCapacity() < this.creep.carryCapacity;
	}

	isValidTarget() {
		return this.target && this.target.amount > 0;
	}

	work() {
		return this.creep.pickup(this.target);
	}
}

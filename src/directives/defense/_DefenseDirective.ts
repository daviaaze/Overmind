import { type CombatOverlord } from "../../overlords/CombatOverlord";
import { type Overseer } from "../../Overseer";
import { Directive } from "../Directive";

export abstract class DefenseDirective extends Directive {
	overlord: CombatOverlord;
	overlords: {};

	constructor(flag: Flag) {
		super(flag);
		(Overmind.overseer as Overseer).combatPlanner.directives.push(this);
	}
}

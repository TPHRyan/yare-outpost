interface Memory {
	[key: string]: unknown;
}

declare const memory: Memory;

type Position = [x: number, y: number];
type PlayerId = string;
type SpiritId = `${PlayerId}_${number}`;
type BaseId<P extends PlayerId = PlayerId> = `base_${P}`;
type OutpostId = `outpost_${string}`;
type StarId = `star_${string}`;
type StructureId = BaseId | OutpostId | StarId;
type EntityId = SpiritId | StructureId;
type Shape = "circles" | "squares" | "triangles";

interface OutpostSight {
	enemies: SpiritId[];
}

interface Sight extends OutpostSight {
	friends: SpiritId[];
	friends_beamable: SpiritId[];
	enemies_beamable: SpiritId[];
	structures: StructureId[];
}

interface Entity {
	id: string;
	position: Position;
	size: number;
	energy: number;
	last_energized: "" | EntityId;
	energy_capacity: number;
}

interface Destructible extends Entity {
	hp: number;
	sight: Sight;

	player_id: PlayerId;
	shape: Shape;
	color: string;
}

interface BaseSpirit extends Destructible {
	id: SpiritId;

	hp: 0 | 1;
	merged: SpiritId[];
	move_speed: number;
	mark: string;

	move(target: Position): void;

	energize(target: Entity): void;

	shout(message: string): void;

	set_mark(label: string): void;
}

interface CircleSpirit extends BaseSpirit {
	merge(target: CircleSpirit): void;

	divide(): void;

	shape: "circles";
}

interface SquareSpirit extends BaseSpirit {
	size: 10;
	energy_capacity: 100;

	shape: "squares";

	jump(target: Position): void;
}

interface TriangleSpirit extends BaseSpirit {
	size: 3;
	energy_capacity: 30;

	explode(): void;

	shape: "triangles";
}

type Spirit = CircleSpirit | SquareSpirit | TriangleSpirit;

interface BaseStructure extends Entity {
	structure_type: string;
	collision_radius: number;
}

interface BaseBase extends BaseStructure, Destructible {
	id: BaseId;
	structure_type: "base";
	size: 40;
	current_spirit_cost: number;
}

interface CircleBase extends BaseBase {
	energy_capacity: 400;

	shape: "circles";
}

interface SquareBase extends BaseBase {
	energy_capacity: 1000;

	shape: "squares";
}

interface TriangleBase extends BaseBase {
	energy_capacity: 600;

	shape: "triangles";
}

type Base = SquareBase | CircleBase | TriangleBase;

interface Outpost extends BaseStructure {
	id: OutpostId;
	structure_type: "outpost";
	position: [2200, 1100];
	size: 20;
	energy_capacity: 1000;
	range: 400 | 600;
	sight: OutpostSight;

	control: PlayerId;
}

interface _Star extends BaseStructure {
	id: StarId;
	structure_type: "star";

	active_in: number;
	active_at: number;
}

interface LargeStar extends _Star {
	size: 220;

	active_at: 0;
}

interface SmallStar extends _Star {
	size: 80;

	active_at: 100;
}

interface Graphics {
	style: string;
	linewidth: number;

	line(start: Position, end: Position): void;

	circle(pos: Position, r: number): void;

	rect(tl: Position, br: Position): void;
}

type Star = LargeStar | SmallStar;

type Structure = Base | Outpost | Star;
type StructureType = Structure["structure_type"];

declare const my_spirits: CircleSpirit[] | SquareSpirit[] | TriangleSpirit[];
declare const spirits:
	| Record<SpiritId, CircleSpirit | SquareSpirit>
	| Record<SpiritId, CircleSpirit | TriangleSpirit>
	| Record<SpiritId, SquareSpirit | TriangleSpirit>;
declare const base: Base;
declare const enemy_base: Base;
declare const bases:
	| Record<BaseId, CircleBase | SquareBase>
	| Record<BaseId, CircleBase | TriangleBase>
	| Record<BaseId, SquareBase | TriangleBase>;
declare const outpost_mdo: Outpost;
declare const outpost: Outpost;
declare const outposts: Record<OutpostId, Outpost>;
declare const star_zxq: LargeStar;
declare const star_a1c: LargeStar;
declare const star_p89: SmallStar;
declare const stars: Record<StarId, Star>;

declare const this_player_id: PlayerId;
declare const players: { p1: PlayerId; p2: PlayerId };

declare const tick: number;

declare const graphics: Graphics;

declare function atob(input: string): Uint8Array;

declare const CODE_VERSION: string;

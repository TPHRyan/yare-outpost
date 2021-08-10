/// <reference types="yare-io" />

type Players = [player1: string, player2: string];

export type Color<
	R extends number = number,
	G extends number = number,
	B extends number = number,
	A extends number = 1,
> = `rgba(${R}, ${G}, ${B}, ${A})`;
type Colors = [Color, Color];

type Shapes = [Shape, Shape];

export type ColorGBlue = Color<58, 197, 240>;
export type ColorRedish = Color<232, 97, 97>;
export type ColorPistagre = Color<148, 176, 108>;

export interface InitialGameData {
	units: Spirit[];
	stars: Star[];
	bases: Base[];
	outposts: Outpost[];
	players: Players;
	colors: Colors;
	shapes: Shapes;
}

export type UnitState = [
	id: SpiritId,
	position: Position,
	size: number,
	energy: number,
	hp: 0 | 1,
];

export type BaseState = [
	energy: number,
	nextSpiritAt: number,
	underAttack: 0 | 1,
	hp: number,
];

export type StarEnergies = [zxq: number, a1c: number, p89: number];

export type OutpostState = [energy: number, controlled_by: PlayerId];

export type EnergizeAction = [
	source: EntityId,
	destination: EntityId,
	energy: number,
];

export type SetStyleAction = [action: "st", style: string];
export type DrawLineAction = [
	action: "l",
	x1: number,
	y1: number,
	x2: number,
	y2: number,
];
export type DrawCircleAction = [
	action: "c",
	x: number,
	y: number,
	radius: number,
];
export type DrawRectangleAction = [
	action: "s",
	x1: number,
	y1: number,
	x2: number,
	y2: number,
];
export type DrawAction =
	| SetStyleAction
	| DrawLineAction
	| DrawCircleAction
	| DrawRectangleAction;

export interface TickData {
	t: number;
	p1: UnitState[];
	p2: UnitState[];
	b1: BaseState;
	b2: BaseState;
	st: StarEnergies;
	ou: OutpostState;
	e: EnergizeAction[];
	s: [];
	er1: string[];
	er2: string[];
	c1: unknown[];
	c2: unknown[];
	end: number;
	g1: DrawAction[];
	g2: DrawAction[];
}

export type GameData = InitialGameData | TickData;

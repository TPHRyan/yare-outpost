/// <reference types="yare-io" />

export interface NotFoundGameInfo {
	data: "no game found";
}

export interface FinishedGameInfo {
	data: "finished";
	server: string;
	ranked: 0 | 1;
	winner: PlayerId;
	p1: PlayerId;
	p1_shape: Shape;
	p1_color: `color${number}`;
	p1_rating: number;
	p2: PlayerId;
	p2_shape: Shape;
	p2_color: `color${number}`;
	p2_rating: number;
	c_day: string;
}

export type GameInfo = FinishedGameInfo;

/// <reference types="yare-io" />

import { intersection, partial, string, Type, type } from "io-ts";

export interface GameMetadata {
	id: string;
	server: string;
	pl1?: PlayerId;
	pl2?: PlayerId;
}

export const GameMetadata: Type<GameMetadata> = intersection(
	[
		type({
			id: string,
			server: string,
		}),
		partial({
			pl1: string,
			pl2: string,
		}),
	],
	"GameMetadata",
);

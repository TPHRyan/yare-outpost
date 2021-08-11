import { either } from "fp-ts";
import { pipe } from "fp-ts/function";
import { array, string, Type, UnknownRecord, Validation } from "io-ts";

import { mapLastError } from "../local-util";
import { GameMetadata } from "./game/game-metadata.model";

export type GameIds = string[];

export interface GameIdsResponse {
	data?: string | string[];
}

export const GameIdsFromServer: Type<GameIds, GameIdsResponse> = new Type(
	"GameIdsFromServer",
	(value: unknown): value is GameIds =>
		Array.isArray(value) && value.every((item) => typeof item === "string"),
	(input: unknown): Validation<GameIds> =>
		pipe(
			UnknownRecord.decode(input),
			either.mapLeft((errs) =>
				mapLastError(errs, (e) => ({
					...e,
					message: "GameIds server response should be an object!",
				})),
			),
			either.chain((unknownRecord): Validation<GameIds> => {
				return Array.isArray(unknownRecord.data)
					? array(string).decode(unknownRecord.data)
					: either.right([]);
			}),
		),
	(gameIds: GameIds): GameIdsResponse => ({ data: gameIds }),
);

export interface GameMetadataResponse {
	data?: GameMetadata[];
}

export const GameMetadataFromServer: Type<
	GameMetadata[],
	GameMetadataResponse
> = new Type(
	"GameMetadataFromServer",
	(value: unknown): value is GameMetadata[] =>
		Array.isArray(value) && value.every((item) => typeof item === "object"),
	(input: unknown): Validation<GameMetadata[]> =>
		pipe(
			UnknownRecord.decode(input),
			either.mapLeft((errs) =>
				mapLastError(errs, (e) => ({
					...e,
					message:
						"GameMetadata server response should be an object!",
				})),
			),
			either.chain((unknownRecord): Validation<GameMetadata[]> => {
				return Array.isArray(unknownRecord.data)
					? array(GameMetadata).decode(unknownRecord.data)
					: either.right([]);
			}),
		),
	(metadata: GameMetadata[]): GameMetadataResponse => ({ data: metadata }),
);

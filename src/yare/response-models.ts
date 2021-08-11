import { either } from "fp-ts";
import { pipe } from "fp-ts/function";
import { array, string, Type, UnknownRecord, Validation } from "io-ts";

import { mapLastError } from "../local-util";

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

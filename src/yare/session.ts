import {
	Context,
	identity,
	string,
	Type,
	type,
	UnknownRecord,
	Validation,
} from "io-ts";
import { pipe } from "fp-ts/function";
import { either } from "fp-ts";
import { mapLastError } from "../local-util";

export interface UserSession {
	user_id: string;
	session_id: string;
}

const _UserSession: Type<UserSession> = type({
	user_id: string,
	session_id: string,
});

export const UserSession: Type<UserSession> = new Type(
	"UserSession",
	(value: unknown): value is UserSession => {
		return _UserSession.is(value);
	},
	(input: unknown, context: Context): Validation<UserSession> =>
		pipe(
			UnknownRecord.decode(input),
			either.mapLeft((errs) =>
				mapLastError(errs, (e) => ({
					...e,
					message: "UserSession should be an object!",
				})),
			),
			either.map((session) => ({
				...session,
				session_id: session.session_id ?? session.data,
			})),
			either.chain((session) => _UserSession.validate(session, context)),
		),
	identity,
);

import {
	Context,
	failure,
	identity,
	string,
	Type,
	type,
	Validation,
} from "io-ts";

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
	(input: unknown, context: Context): Validation<UserSession> => {
		if (typeof input !== "object" || null === input) {
			return failure(input, context, "Input must be an object!");
		}
		const objInput = input as Record<string, unknown>;
		if ("data" in objInput && undefined === objInput.session_id) {
			objInput.session_id = objInput.data;
		}
		return _UserSession.validate(objInput, context);
	},
	identity,
);

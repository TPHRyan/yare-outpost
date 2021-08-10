import { string, Type, type, UnknownRecord } from "io-ts";
import { DataMappedTo, DataMapping } from "./data-mapping-codec";

const _UserSession: Type<UserSession, DataMappedTo<"session_id">> = type({
	user_id: string,
	session_id: string,
});

export interface UserSession {
	user_id: string;
	session_id: string;
}

export const UserSession = UnknownRecord.pipe(
	DataMapping("DataToSession", "session_id"),
).pipe(_UserSession, "UserSession");

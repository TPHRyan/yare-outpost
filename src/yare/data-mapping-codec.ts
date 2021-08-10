import { Type, Validation } from "io-ts";
import { either } from "fp-ts";

interface ObjectWithData {
	[key: string]: unknown;

	data?: unknown;
}

export type DataMappedTo<S extends string> = Omit<ObjectWithData, "data"> &
	{ [K in S]: ObjectWithData["data"] };

export function DataMapping<S extends string>(
	codecName: string,
	mapTo: S,
): Type<DataMappedTo<S>, ObjectWithData, ObjectWithData> {
	return new Type<DataMappedTo<S>, ObjectWithData, ObjectWithData>(
		codecName,
		(value: unknown): value is DataMappedTo<S> =>
			typeof value === "object" && null !== value && mapTo in value,
		(value: ObjectWithData): Validation<DataMappedTo<S>> =>
			either.right({
				...value,
				[mapTo]: value[mapTo] ?? value.data,
			} as DataMappedTo<S>),
		(mappedObject: DataMappedTo<S>): ObjectWithData => ({
			...mappedObject,
			data: mappedObject[mapTo],
		}),
	);
}

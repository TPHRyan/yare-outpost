import { isLeft } from "fp-ts/Either";
import { Errors, Validation, ValidationError } from "io-ts";
import { PathReporter } from "io-ts/PathReporter";

export function mapLastError(
	errors: Errors,
	mapFn: (err: Readonly<ValidationError>) => ValidationError,
): Errors {
	if (errors.length < 1) {
		return errors;
	}
	const lastError = errors.slice(0, -1)[0];
	return errors.slice(-1).concat([mapFn(lastError)]);
}

export function throwIfError<A>(result: Validation<A>): A {
	if (isLeft(result)) {
		const msg = JSON.stringify(PathReporter.report(result));
		throw new Error(msg);
	}
	return result.right;
}

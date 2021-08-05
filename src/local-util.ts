import { Validation } from "io-ts";
import { isLeft } from "fp-ts/Either";
import { PathReporter } from "io-ts/PathReporter";

export function throwIfError<A>(result: Validation<A>): A {
	if (isLeft(result)) {
		const msg = JSON.stringify(PathReporter.report(result));
		throw new Error(msg);
	}
	return result.right;
}

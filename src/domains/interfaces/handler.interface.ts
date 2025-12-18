import type { BunRequest } from "bun";

export type RequestHandler = {
	get path(): string;
	handle(request: BunRequest<string>): Promise<Response>;
};

import type { BunRequest } from "bun";
import { inject, registry, singleton } from "tsyringe";
import { TaskCreateHandler } from "../handlers/task-create.handler";
import { TaskStatusHandler } from "../handlers/task-status.handler";
import { TOKEN } from "../token";

@singleton()
@registry([
	{
		token: TOKEN.TaskCreateHandler,
		useClass: TaskCreateHandler,
	},
	{
		token: TOKEN.TaskStatusHandler,
		useClass: TaskStatusHandler,
	},
])
export class BunServer {
	constructor(
		@inject(TOKEN.TaskCreateHandler)
		private readonly createHandler: TaskCreateHandler,
		@inject(TOKEN.TaskStatusHandler)
		private readonly statusHandler: TaskStatusHandler,
	) {}
	async start() {
		Bun.serve({
			routes: {
				"/task": {
					POST: async (request: Request) =>
						await this.createHandler.handle(request),
				},
				"/task/:token": {
					GET: async (request: BunRequest<"/task/:token">) =>
						await this.statusHandler.handle(request),
				},
			},
		});
	}
}

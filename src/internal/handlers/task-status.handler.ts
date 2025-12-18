import type { BunRequest } from "bun";
import { inject, registry, singleton } from "tsyringe";
import type { RequestHandler } from "@/domains/interfaces/handler.interface";
import type { TaskEventService } from "@/external/task-event";
import { TaskStatusProviderFactory } from "../factories/task-status-provider.factory";
import { TOKEN } from "../token";

@singleton()
@registry([
	{
		token: TOKEN.TaskStatusFactory,
		useClass: TaskStatusProviderFactory,
	},
])
export class TaskStatusHandler implements RequestHandler {
	path = "/task/:token";
	constructor(
		@inject(TOKEN.TaskEvent) private eventService: TaskEventService,
		@inject(TOKEN.TaskStatusFactory)
		private readonly factory: TaskStatusProviderFactory,
	) {}
	async handle(request: BunRequest<"/task/:token">): Promise<Response> {
		const event = await this.eventService.getEvent(request.params.token);
		const provider = this.factory.getProvider(event.name);
		const task = await provider.getTask(event.token);
		return new Response(task.toJSON());
	}
}

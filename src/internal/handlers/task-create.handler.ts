import { randomUUIDv7 } from "bun";
import { inject, registry, singleton } from "tsyringe";
import type { RequestHandler } from "@/domains/interfaces/handler.interface";
import type { TaskEventService } from "@/external/task-event";
import { TaskCreateProviderFactory } from "../factories/task-create-provider.factory";
import { TOKEN } from "../token";

@singleton()
@registry([
	{
		token: TOKEN.TaskCreateFactory,
		useClass: TaskCreateProviderFactory,
	},
])
export class TaskCreateHandler implements RequestHandler {
	path = "/task";
	constructor(
		@inject(TOKEN.TaskCreateFactory)
		private readonly factory: TaskCreateProviderFactory,
		@inject(TOKEN.TaskEvent) private readonly event: TaskEventService,
	) {}
	async handle(request: Request): Promise<Response> {
		const data = await request.json();
		const provider = this.factory.getProvider(data.name);
		const token = randomUUIDv7();
		const [task] = await Promise.all([
			provider.create(token, data.data),
			this.event.setEvent({
				name: data.name,
				token,
				input: data.data,
			}),
		]);
		return new Response(task.toJSON());
	}
}

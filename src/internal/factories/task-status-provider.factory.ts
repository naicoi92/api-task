import { injectAll, singleton } from "tsyringe";
import type { TaskResult } from "@/domains/interfaces/result.interface";
import { TOKEN } from "../token";

@singleton()
export class TaskStatusProviderFactory {
	constructor(
		@injectAll(TOKEN.TaskStatusProvider)
		private readonly providers: TaskResult[],
	) {}
	getProvider(name: string): TaskResult {
		const provider = this.providers.find((p) => p.isSupportTask(name));
		if (!provider)
			throw new Error(`not found any provider support task for: ${name}`);
		return provider;
	}
}

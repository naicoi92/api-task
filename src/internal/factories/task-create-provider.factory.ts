import { injectAll, singleton } from "tsyringe";
import type { TaskCreator } from "@/domains/interfaces/create.interface";
import { TOKEN } from "../token";

@singleton()
export class TaskCreateProviderFactory {
	constructor(
		@injectAll(TOKEN.TaskCreateProvider)
		private readonly providers: TaskCreator[],
	) {}
	getProvider(name: string): TaskCreator {
		const provider = this.providers.find((p) => p.isSupportTask(name));
		if (!provider)
			throw new Error(`not found any provider support task for: ${name}`);
		return provider;
	}
}

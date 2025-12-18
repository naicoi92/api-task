import type IORedis from "ioredis";
import { singleton } from "tsyringe";
import { TaskEventSchema } from "@/domains/schemas/event.schema";
import type { TaskEvent } from "@/domains/types/event.type";
import { ioredis } from "./ioredis";

@singleton()
export class TaskEventService {
	private redis: IORedis;
	constructor() {
		this.redis = ioredis();
	}
	async setEvent(data: TaskEvent): Promise<void> {
		const key = `task:${data.token}`;
		await this.redis
			.pipeline()
			.hset(key, {
				name: data.name,
				token: data.token,
				input: JSON.stringify(data.input),
			})
			.expire(key, 300)
			.exec();
	}
	async getEvent(token: string): Promise<TaskEvent> {
		const data = await this.redis.hgetall(`task:${token}`);
		const zodTask = TaskEventSchema.safeParse({
			name: data.name,
			token: data.token,
			input: JSON.parse(data.input ?? "{}"),
		});
		if (!zodTask.success) throw new Error(`not found task: ${token}`);
		return zodTask.data;
	}
}

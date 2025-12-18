import type { Inngest } from "inngest";
import type IORedis from "ioredis";
import { isEmpty } from "lodash-es";
import { singleton } from "tsyringe";
import { CloudflareEntity } from "@/domains/entities/cloudflare.entity";
import type {
	CloudflareInput,
	CloudflareOutput,
} from "@/domains/types/cloudflare.type";
import { TaskEntity } from "../../domains/entities/task.entity";
import { TaskStatus } from "../../domains/enums/status.enum";
import type { TaskCreator } from "../../domains/interfaces/create.interface";
import type { TaskResult } from "../../domains/interfaces/result.interface";
import {
	CloudflareInputSchema,
	CloudflareOutputSchema,
} from "../../domains/schemas/cloudflare.schema";
import { cloudflareInngest } from "../inngest";
import { ioredis } from "../ioredis";

@singleton()
export class CamoufoxProvider implements TaskCreator, TaskResult {
	inputSchema = CloudflareInputSchema;
	private inngest: Inngest;
	private redis: IORedis;
	private supportTasks: string[] = ["cloudflare.camoufox"];
	constructor() {
		this.inngest = cloudflareInngest();
		this.redis = ioredis();
	}
	isSupportTask(name: string): boolean {
		return this.supportTasks.includes(name);
	}
	async create(token: string, input: unknown): Promise<TaskEntity> {
		const data = CloudflareInputSchema.parse(input);
		await Promise.all([this.sendEvent(token, data), this.saveRedis(token)]);
		return new TaskEntity(token);
	}
	async getTask(token: string): Promise<TaskEntity> {
		const task = new TaskEntity(token);
		const data = await this.getRedis(token);
		const cloudflareEntity = new CloudflareEntity(data);
		task.setData(cloudflareEntity);
		return task;
	}
	private async sendEvent(token: string, input: CloudflareInput) {
		this.inngest.send({
			name: "cloudflare",
			data: {
				id: token,
				url: input.url,
				selector: input.selector,
				proxy: input.proxy,
			},
		});
	}
	private async getRedis(token: string): Promise<CloudflareOutput> {
		const key = `cloudflare:${token}`;
		const data = await this.redis.hgetall(key);
		return CloudflareOutputSchema.parse(
			isEmpty(data)
				? {
						status: "error",
						message: "timeout request. not found response",
					}
				: data,
		);
	}
	private async saveRedis(token: string) {
		const key = `cloudflare:${token}`;
		await this.redis
			.pipeline()
			.hset(key, {
				status: TaskStatus.pending,
			})
			.expire(key, 180)
			.exec();
	}
}

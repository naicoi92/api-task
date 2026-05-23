import type { Inngest } from "inngest";
import type IORedis from "ioredis";
import { isEmpty } from "lodash-es";
import { singleton } from "tsyringe";
import { RecaptchaEntity } from "@/domains/entities/recaptcha.entity";
import type {
	RecaptchaOutput,
	RecaptchaV2Input,
} from "@/domains/types/recaptcha.type";
import { TaskEntity } from "../../domains/entities/task.entity";
import { TaskStatus } from "../../domains/enums/status.enum";
import type { TaskCreator } from "../../domains/interfaces/create.interface";
import type { TaskResult } from "../../domains/interfaces/result.interface";
import {
	RecaptchaOutputSchema,
	RecaptchaV2InputSchema,
} from "../../domains/schemas/recaptcha.schema";
import { cloudflareInngest } from "../inngest";
import { ioredis } from "../ioredis";

@singleton()
export class RecaptchaV2Provider implements TaskCreator, TaskResult {
	inputSchema = RecaptchaV2InputSchema;
	private inngest: Inngest;
	private redis: IORedis;

	private static readonly TASK_NAME = "recaptcha-v2";
	private static readonly REDIS_PREFIX = "recaptcha-v2";

	constructor() {
		this.inngest = cloudflareInngest();
		this.redis = ioredis();
	}

	isSupportTask(name: string): boolean {
		return name === RecaptchaV2Provider.TASK_NAME;
	}

	async create(
		_taskName: string,
		token: string,
		input: unknown,
	): Promise<TaskEntity> {
		const data = RecaptchaV2InputSchema.parse(input);
		await Promise.all([this.sendEvent(token, data), this.saveRedis(token)]);
		return new TaskEntity(token);
	}

	async getTask(token: string): Promise<TaskEntity> {
		const task = new TaskEntity(token);
		const data = await this.getRedis(token);
		const recaptchaEntity = new RecaptchaEntity(data);
		task.setData(recaptchaEntity);
		return task;
	}

	private async sendEvent(token: string, input: RecaptchaV2Input) {
		await this.inngest.send({
			name: RecaptchaV2Provider.TASK_NAME,
			data: {
				id: token,
				url: input.url,
				siteKey: input.siteKey,
				invisible: input.invisible,
				enterprise: input.enterprise,
				payload: input.payload,
				proxy: input.proxy,
			},
		});
	}

	private async getRedis(token: string): Promise<RecaptchaOutput> {
		const key = `${RecaptchaV2Provider.REDIS_PREFIX}:${token}`;
		const data = await this.redis.hgetall(key);
		return RecaptchaOutputSchema.parse(
			isEmpty(data)
				? {
						status: "error",
						message: "timeout request. not found response",
					}
				: data,
		);
	}

	private async saveRedis(token: string) {
		const key = `${RecaptchaV2Provider.REDIS_PREFIX}:${token}`;
		await this.redis
			.pipeline()
			.hset(key, {
				status: TaskStatus.pending,
			})
			.expire(key, 180)
			.exec();
	}
}

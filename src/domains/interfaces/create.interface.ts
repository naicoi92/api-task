import type z from "zod";
import type { TaskEntity } from "../entities/task.entity";

export interface TaskCreator {
	inputSchema: z.ZodSchema;
	create<T = unknown>(
		taskName: string,
		token: string,
		input: T,
	): Promise<TaskEntity>;
	isSupportTask(name: string): boolean;
}

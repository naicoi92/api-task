import type { TaskEntity } from "../entities/task.entity";

export interface TaskResult {
	getTask(token: string): Promise<TaskEntity>;
	isSupportTask(name: string): boolean;
}

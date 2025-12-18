import type { TaskStatus } from "../enums/status.enum";

export interface TaskData<T> {
	get status(): TaskStatus;
	get data(): T;
}

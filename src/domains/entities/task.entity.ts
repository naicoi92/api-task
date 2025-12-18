import { TaskStatus } from "../enums/status.enum";
import type { TaskData } from "../interfaces/task.interface";

export class TaskEntity {
	private _data?: TaskData<unknown>;
	constructor(private _token: string) {}

	get status(): TaskStatus {
		return this._data?.status ?? TaskStatus.pending;
	}

	get token(): string {
		return this._token;
	}

	getData(): unknown | null {
		return this._data?.data ?? null;
	}

	setData(data: TaskData<unknown>) {
		this._data = data;
	}

	toJSON() {
		return JSON.stringify({
			status: this.status,
			token: this.token,
			data: this.getData(),
		});
	}
}

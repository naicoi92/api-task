import type { TaskStatus } from "../enums/status.enum";
import type { TaskData } from "../interfaces/task.interface";
import { CloudflareOutputSchema } from "../schemas/cloudflare.schema";
import type { CloudflareOutput } from "../types/cloudflare.type";

export class CloudflareEntity implements TaskData<CloudflareOutput> {
	constructor(private readonly _output: CloudflareOutput) {}
	get status(): TaskStatus {
		return this._output.status;
	}
	get data(): CloudflareOutput {
		return this._output;
	}
	static fromData(data: unknown) {
		const output = CloudflareOutputSchema.parse(data);
		return new CloudflareEntity(output);
	}
}

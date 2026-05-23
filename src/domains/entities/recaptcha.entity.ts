import type { TaskStatus } from "../enums/status.enum";
import type { TaskData } from "../interfaces/task.interface";
import { RecaptchaOutputSchema } from "../schemas/recaptcha.schema";
import type { RecaptchaOutput } from "../types/recaptcha.type";

export class RecaptchaEntity implements TaskData<RecaptchaOutput> {
	constructor(private readonly _output: RecaptchaOutput) {}
	get status(): TaskStatus {
		return this._output.status;
	}
	get data(): RecaptchaOutput {
		return this._output;
	}
	static fromData(data: unknown) {
		const output = RecaptchaOutputSchema.parse(data);
		return new RecaptchaEntity(output);
	}
}

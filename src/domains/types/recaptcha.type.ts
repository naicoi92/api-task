import type z from "zod";
import type {
	RecaptchaOutputSchema,
	RecaptchaV2InputSchema,
	RecaptchaV3InputSchema,
} from "../schemas/recaptcha.schema";

export type RecaptchaV2Input = z.infer<typeof RecaptchaV2InputSchema>;
export type RecaptchaV3Input = z.infer<typeof RecaptchaV3InputSchema>;
export type RecaptchaOutput = z.infer<typeof RecaptchaOutputSchema>;

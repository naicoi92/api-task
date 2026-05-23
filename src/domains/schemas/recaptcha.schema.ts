import z from "zod";
import { TaskStatus } from "../enums/status.enum";

export const RecaptchaV2InputSchema = z.object({
	url: z.url(),
	siteKey: z.string(),
	invisible: z.boolean().default(false),
	enterprise: z.boolean().default(false),
	proxy: z.url().optional(),
});

export const RecaptchaV3InputSchema = z.object({
	url: z.url(),
	siteKey: z.string(),
	action: z.string().default("submit"),
	enterprise: z.boolean().default(false),
	proxy: z.url().optional(),
});

export const RecaptchaOutputSchema = z.discriminatedUnion("status", [
	z.object({
		status: z.literal(TaskStatus.success),
		token: z.string(),
		userAgent: z.string(),
	}),
	z.object({
		status: z.literal(TaskStatus.pending),
	}),
	z.object({
		status: z.literal(TaskStatus.error),
		message: z.string(),
	}),
]);

import type z from "zod";
import type {
	CloudflareInputSchema,
	CloudflareOutputSchema,
} from "../schemas/cloudflare.schema";

export type CloudflareOutput = z.infer<typeof CloudflareOutputSchema>;
export type CloudflareInput = z.infer<typeof CloudflareInputSchema>;

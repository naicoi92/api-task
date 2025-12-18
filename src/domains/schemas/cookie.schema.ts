import dayjs from "dayjs";
import { isDate, startCase, toLower } from "lodash-es";
import z from "zod";
import { CookieSameSite } from "../enums/cookie.enum";

export const CookieSameSiteSchema = z
	.preprocess(
		(val: string) => startCase(toLower(val)),
		z.enum(CookieSameSite).default(CookieSameSite.None),
	)
	.default(CookieSameSite.None)
	.transform((val) =>
		val === CookieSameSite.Unspecified ? CookieSameSite.None : val,
	);

export const CookieExpiresSchema = z
	.union([z.number(), z.date(), z.null()])
	.default(-1)
	.transform((val) => {
		if (!val) return -1;
		if (isDate(val)) return dayjs(val).unix();
		return val;
	});

export const CookieSchema = z.object({
	name: z.string(),
	value: z.string(),
	domain: z.string(),
	path: z.string().default("/"),
	expires: CookieExpiresSchema,
	httpOnly: z.boolean().default(false),
	secure: z.boolean().default(false),
	sameSite: CookieSameSiteSchema,
});

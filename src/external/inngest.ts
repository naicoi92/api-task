import { Inngest } from "inngest";
import { once } from "lodash-es";

export const cloudflareInngest = once(
	() =>
		new Inngest({
			id: "cloudflare",
			baseUrl: "https://ings.fly.dev",
			eventKey:
				"GbS6CB7xvTUDhLBIFXHIN7Ju28kz-sc6H9iXW78bTGtE14Szkfu2TGVnFBoHEU41XfL_PJ1kvAUX1kx7NLNHDQ",
		}),
);
export const captchaTSInngest = once(
	() =>
		new Inngest({
			id: "captcha-ts",
			baseUrl: "https://mct-inngest.fly.dev",
			eventKey:
				"f6e20335b177f62ff5ac13014775c031365840de9cfc788593383e63973ba59e",
		}),
);

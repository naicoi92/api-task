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
				"bd29fe2fca42b4b607024edd591a181e431318176b2dfbd9644f177745795ddc",
		}),
);

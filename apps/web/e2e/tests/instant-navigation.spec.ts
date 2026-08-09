import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

const viewports = [
	{ name: "desktop", width: 1280, height: 720 },
	{ name: "mobile", width: 390, height: 844 },
] as const;

for (const viewport of viewports) {
	test(`privacy shell is instant on ${viewport.name}`, async ({
		page,
		baseURL,
	}) => {
		await page.setViewportSize(viewport);
		const url = new URL("/privacy", baseURL).toString();

		await instant(
			page,
			async () => {
				await page.goto(url);
				await expect(page.getByTestId("copyright")).toBeVisible();
			},
			{ baseURL: new URL(url).origin },
		);
	});
}

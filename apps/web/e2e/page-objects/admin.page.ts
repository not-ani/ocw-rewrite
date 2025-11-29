/**
 * Admin Page Object Model
 *
 * Encapsulates interactions with the admin panel.
 */

import { Locator, Page } from "@playwright/test";

export class AdminPage {
	readonly page: Page;
	readonly coursesTable: Locator;
	readonly adminsTable: Locator;
	readonly addCourseButton: Locator;
	readonly addAdminButton: Locator;
	readonly forkCourseButton: Locator;
	readonly siteContentLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.coursesTable = page.locator('[class*="courses-table"], table').first();
		this.adminsTable = page.locator('[class*="admins-table"], table').last();
		this.addCourseButton = page.getByRole("button", {
			name: /add.*course|create.*course|new.*course/i,
		});
		this.addAdminButton = page.getByRole("button", {
			name: /add.*admin|invite.*admin/i,
		});
		this.forkCourseButton = page.getByRole("button", { name: /fork/i });
		this.siteContentLink = page.getByRole("link", { name: /site.*content/i });
	}

	async goto() {
		await this.page.goto("/admin");
		await this.page.waitForLoadState("networkidle");
	}

	async goToSiteContent() {
		await this.page.goto("/admin/site-content");
		await this.page.waitForLoadState("networkidle");
	}

	async canAddCourse() {
		return this.addCourseButton.isVisible();
	}

	async canAddAdmin() {
		return this.addAdminButton.isVisible();
	}

	async canForkCourse() {
		return this.forkCourseButton.isVisible();
	}

	async clickAddCourse() {
		await this.addCourseButton.click();
	}

	async clickAddAdmin() {
		await this.addAdminButton.click();
	}

	async clickForkCourse() {
		await this.forkCourseButton.click();
	}

	async clickSiteContent() {
		if (await this.siteContentLink.isVisible()) {
			await this.siteContentLink.click();
			await this.page.waitForLoadState("networkidle");
		}
	}

	async getCourseCount() {
		const rows = this.coursesTable.locator("tbody tr");
		return rows.count();
	}

	async getAdminCount() {
		const rows = this.adminsTable.locator("tbody tr");
		return rows.count();
	}

	async isUnauthorized() {
		const unauthorized = this.page.getByText(
			/unauthorized|access denied|permission/i
		);
		return unauthorized.isVisible();
	}
}


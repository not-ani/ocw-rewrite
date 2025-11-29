/**
 * Course Dashboard Page Object Model
 *
 * Encapsulates interactions with the course dashboard.
 */

import type { Locator, Page } from "@playwright/test";

export class CourseDashboardPage {
	readonly page: Page;
	readonly sidebar: Locator;
	readonly createUnitButton: Locator;
	readonly unitsTable: Locator;
	readonly usersLink: Locator;
	readonly settingsLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.sidebar = page.locator('[data-sidebar], [class*="sidebar"]');
		this.createUnitButton = page.getByRole("button", {
			name: /create.*unit|add.*unit|new.*unit/i,
		});
		this.unitsTable = page.locator('table, [class*="table"]');
		this.usersLink = page.getByRole("link", { name: /users/i });
		this.settingsLink = page.getByRole("link", { name: /settings/i });
	}

	async goto(courseId: string) {
		await this.page.goto(`/course/${courseId}/dashboard`);
		await this.page.waitForLoadState("networkidle");
	}

	async goToUsers(courseId: string) {
		await this.page.goto(`/course/${courseId}/dashboard/users`);
		await this.page.waitForLoadState("networkidle");
	}

	async goToSettings(courseId: string) {
		await this.page.goto(`/course/${courseId}/dashboard/settings`);
		await this.page.waitForLoadState("networkidle");
	}

	async goToUnit(courseId: string, unitId: string) {
		await this.page.goto(`/course/${courseId}/dashboard/unit/${unitId}`);
		await this.page.waitForLoadState("networkidle");
	}

	async goToLesson(courseId: string, lessonId: string) {
		await this.page.goto(`/course/${courseId}/dashboard/lesson/${lessonId}`);
		await this.page.waitForLoadState("networkidle");
	}

	async isSidebarVisible() {
		return this.sidebar.isVisible();
	}

	async canCreateUnit() {
		return this.createUnitButton.isVisible();
	}

	async clickCreateUnit() {
		await this.createUnitButton.click();
	}

	async clickUsersLink() {
		await this.usersLink.click();
		await this.page.waitForLoadState("networkidle");
	}

	async clickSettingsLink() {
		await this.settingsLink.click();
		await this.page.waitForLoadState("networkidle");
	}

	async getUnitRows() {
		const rows = this.page.locator("table tbody tr, [class*='unit-row']");
		return rows.count();
	}
}

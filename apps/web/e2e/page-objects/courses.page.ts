/**
 * Courses Page Object Model
 *
 * Encapsulates interactions with the courses listing page.
 * Use page objects to keep tests clean and maintainable.
 */

import type { Locator, Page } from "@playwright/test";

export class CoursesPage {
	readonly page: Page;
	readonly searchInput: Locator;
	readonly courseCards: Locator;
	readonly pagination: Locator;
	readonly noResultsMessage: Locator;

	constructor(page: Page) {
		this.page = page;
		this.searchInput = page.getByPlaceholder(/search/i);
		this.courseCards = page.locator('a[href^="/course/"]');
		this.pagination = page.locator('[class*="pagination"]');
		this.noResultsMessage = page.getByText(/no courses found/i);
	}

	async goto(subdomain?: string) {
		// In production, courses page is on subdomains
		// For local testing, navigate to /courses
		const url = "/courses";
		await this.page.goto(url);
		await this.page.waitForLoadState("networkidle");
	}

	async search(query: string) {
		await this.searchInput.fill(query);
		// Wait for debounce
		await this.page.waitForTimeout(500);
		await this.page.waitForLoadState("networkidle");
	}

	async clearSearch() {
		await this.searchInput.clear();
		await this.page.waitForTimeout(500);
		await this.page.waitForLoadState("networkidle");
	}

	async getCourseCount() {
		return this.courseCards.count();
	}

	async clickCourse(index = 0) {
		const course = this.courseCards.nth(index);
		await course.click();
		await this.page.waitForLoadState("networkidle");
	}

	async getCourseName(index = 0) {
		const course = this.courseCards.nth(index);
		const heading = course.locator("h3");
		return heading.textContent();
	}

	async goToNextPage() {
		const nextButton = this.page.getByRole("button", { name: /next/i });
		if (await nextButton.isVisible()) {
			await nextButton.click();
			await this.page.waitForLoadState("networkidle");
		}
	}

	async goToPreviousPage() {
		const prevButton = this.page.getByRole("button", { name: /prev/i });
		if (await prevButton.isVisible()) {
			await prevButton.click();
			await this.page.waitForLoadState("networkidle");
		}
	}

	async isSearchVisible() {
		return this.searchInput.isVisible();
	}

	async hasNoResults() {
		return this.noResultsMessage.isVisible();
	}

	async hasPagination() {
		return this.pagination.isVisible();
	}
}

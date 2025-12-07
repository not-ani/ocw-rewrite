import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";
import type { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);

export const setSchoolDefaultValue = migrations.define({
	table: "siteUser",
	migrateOne: async (ctx, doc) => {
		if (doc.school === undefined) {
			await ctx.db.patch(doc._id, { school: "creek" });
		}
	},
});

export const setSchoolCourseDefaultValue = migrations.define({
	table: "courses",
	migrateOne: async (ctx, doc) => {
		if (doc.school === undefined) {
			await ctx.db.patch(doc._id, { school: "creek" });
		}
	},
});

export const setSchoolCourseUsersDefaultValue = migrations.define({
	table: "courseUsers",
	migrateOne: async (ctx, doc) => {
		if (doc.school === undefined) {
			await ctx.db.patch(doc._id, { school: "creek" });
		}
	},
});

export const setSchoolUnitsDefaultValue = migrations.define({
	table: "units",
	migrateOne: async (ctx, doc) => {
		if (doc.school === undefined) {
			await ctx.db.patch(doc._id, { school: "creek" });
		}
	},
});

export const setSchoolLessonsDefaultValue = migrations.define({
	table: "lessons",
	migrateOne: async (ctx, doc) => {
		if (doc.school === undefined) {
			await ctx.db.patch(doc._id, { school: "creek" });
		}
	},
});

export const setSchoolLessonEmbedsDefaultValue = migrations.define({
	table: "lessonEmbeds",
	migrateOne: async (ctx, doc) => {
		if (doc.school === undefined) {
			await ctx.db.patch(doc._id, { school: "creek" });
		}
	},
});

export const setSchoolLogsDefaultValue = migrations.define({
	table: "logs",
	migrateOne: async (ctx, doc) => {
		if (doc.school === undefined) {
			await ctx.db.patch(doc._id, { school: "creek" });
		}
	},
});

export const runAllSchoolDefaultValue = migrations.runner([
	internal.migrations.setSchoolDefaultValue,
	internal.migrations.setSchoolCourseDefaultValue,
	internal.migrations.setSchoolCourseUsersDefaultValue,
	internal.migrations.setSchoolUnitsDefaultValue,
	internal.migrations.setSchoolLessonsDefaultValue,
	internal.migrations.setSchoolLessonEmbedsDefaultValue,
	internal.migrations.setSchoolLogsDefaultValue,
]);

const defaultPhoto =
	"https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcf1bAHpXv5c4nkOatgwsmYj96KRpli3hUEdx1";
const creekContributors = [
	{
		name: "Aniketh Chenjeri",
		role: " Co-Founder | Project Lead",
		avatar: defaultPhoto,
		description:
			"Aniketh is the President of the Computer Science Honor Society and lead developer of our platform",
	},
	{
		name: "Jason Chen",
		role: "Co-Founder | Developer",
		avatar:
			"https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcBOk5v5CzYZbKVLiWvQ9r1lpMUyjw58osCXnO",
		description:
			"Jason is the Co-Founder of the old OpenCourseWare site and is helping develop this platform.",
	},
	{
		name: "Matthew Anderson",
		role: "Co-Founder | Writer",
		avatar: defaultPhoto,
		description: "Matthew was is the Co-Founder of the old OpenCourseWare site",
	},

	{
		name: "Cooper Shine",
		role: "Mathematics Lead | Writer",
		avatar: defaultPhoto,
		description:
			"Cooper is the co-maintainer of the Mathematics section of the platform",
	},
	{
		name: "Krit Krishna",
		role: "Mathematics Lead | Writer",
		avatar: defaultPhoto,
		description:
			"Krit is the co-maintainer of the Mathematics section of the platform",
	},
	{
		name: "Andrew Doyle",
		role: "Mathematics Lead | Writer",
		avatar: defaultPhoto,
		description:
			"Andrew is theco-maintainer of the Mathematics & Chemistry section of the platform",
	},
	{
		role: "Writer",
		name: "Rodrigo Salgado Vallarino",
		avatar:
			"https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcbTcMMoLZTl6LHeR2dnPrGuZSo1VBEa3gxciU",
		description:
			"Rodrigo is a contributor to many courses on the platform and maintained the content on OpenCourseWare for the 2023-2024 school year",
	},
	{
		name: "Jonathan Varghese",
		role: "Writer",
		avatar: defaultPhoto,
		description:
			"Jonathan is a contributor to many of the courses on the platform, including the AP US Government and Politics course",
	},

	{
		name: "Aimee Resnick",
		role: "Writer",
		avatar: defaultPhoto,
		description:
			"Aimee is a contributor to many of the courses on the platform, including the AP Biology course",
	},
	{
		name: " Josh Guthrie",
		role: "Writer",
		avatar: defaultPhoto,
		description:
			"Josh is a contributor to many of the courses on the platform, including the AP Environmental Science course",
	},
	{
		name: "Anna Liu",
		role: "Writer",
		avatar: defaultPhoto,
		description:
			"Anna is a contributor to many of the courses on the platform, including the AP Statistics course",
	},

	{
		name: "Rohith Thomas",
		role: "Writer",
		avatar: defaultPhoto,
		description:
			"Rohith is a mathematical specialist and contributor to physical and high level mathematics courses on the platform",
	},
	{
		name: "Ani Gadepalli",
		role: "Writer",
		avatar: defaultPhoto,
		description:
			"Ani has contributed to the AP Comparative Government Course on the platform",
	},
	{
		avatar: defaultPhoto,
		name: "Kartikey Mishra",
		role: "Marketing Lead",
		description:
			"Kartikey is the Marketing Lead and leads our marketing efforts",
	},
	{
		name: "Kaushik Vukanti",
		avatar: defaultPhoto,
		role: "Director of Content @ Grandview",
		description:
			"Kaushik is the Director of Content at Grandview and is responsible for the content on the platform related to grandview high school",
	},
];
export const siteConfigMigration = migrations.define({
	table: "siteConfig",
	migrateOne: async (ctx, doc) => {
		// Check if contributors already exist in the new table
		const existingContributors = await ctx.db
			.query("contributors")
			.withIndex("by_school", (q) => q.eq("school", doc.school))
			.first();

		// Skip if contributors already exist in the new table
		if (existingContributors !== undefined) return;

		if (doc.school === "creek") {
			// Insert contributors into the new table
			for (let i = 0; i < creekContributors.length; i++) {
				await ctx.db.insert("contributors", {
					school: doc.school,
					name: creekContributors[i].name,
					role: creekContributors[i].role,
					avatar: creekContributors[i].avatar,
					description: creekContributors[i].description,
					order: i,
				});
			}

			await ctx.db.patch(doc._id, {
				personsContact: [
					{
						name: "Aniketh Chenjeri",
						email: "anikethchenjeri@gmail.com",
						description:
							"Aniketh is lead developer, co-founder and curriculum maintainer of the platform",
					},
					{
						name: "Jason Chen",
						email: "jasonchen@gmail.com",
						description:
							"Jason is the co-founder of the platform and is assists with the development of the platform",
					},
				],
				siteContributeLink: "https://forms.gle/ALUL2GEsCRv7eifp9",
				club: {
					name: "Computer Science Honor Society",
					email: "cherrycreekcshs@gmail.com",
				},
			});
		}
		if (doc.school === "grandview") {
			// Insert contributors into the new table
			await ctx.db.insert("contributors", {
				school: doc.school,
				name: "Kaushik Vukanti",
				role: "Director of Content",
				avatar: defaultPhoto,
				description:
					"Kaushik is the Director of Content and leads our content efforts at Grandview High School",
				order: 0,
			});

			await ctx.db.patch(doc._id, {
				siteContributeLink: "https://forms.gle/ee99ZcrpxHN3FDpF9",
				club: {
					name: "CS4CO Grandview",
					email: "kaushikvukanti0203@gmail.com",
				},
				personsContact: [
					{
						name: "Kaushik Vukanti",
						email: "kaushikvukanti0203@gmail.com",
						description:
							"Kaushik is the Director of Content and leads our content efforts at Grandview High School",
					},
				],
			});
		}
		if (doc.school === "ct") {
			// Insert contributors into the new table
			await ctx.db.insert("contributors", {
				school: doc.school,
				name: "Girish Verma",
				role: "Director of Content",
				avatar: defaultPhoto,
				description:
					"Girish is the Director of Content and leads our content efforts at CT High School",
				order: 0,
			});

			await ctx.db.patch(doc._id, {
				siteContributeLink: "https://forms.gle/1553NJdhy8CGeXNcA",
				personsContact: [
					{
						name: "Girish Verma",
						email: "gverma0824@outlook.com",
						description:
							"Girish is the Director of Content and leads our content efforts at CT High School",
					},
				],
			});
		}
	},
});

export const setUnitLengthDefaultValue = migrations.define({
	table: "courses",
	migrateOne: async (ctx, doc) => {
		const units = await ctx.db
			.query("units")
			.withIndex("by_course_id", (q) => q.eq("courseId", doc._id))
			.collect();
		await ctx.db.patch(doc._id, {
			unitLength: units.length,
		});
	},
});

export const setCorrectEmbedType = migrations.define({
	table: "lessonEmbeds",
	migrateOne: async (ctx, doc) => {
		const url = new URL(doc.embedUrl);

		if (url.hostname.includes("drive.google.com")) {
			await ctx.db.patch(doc.lessonId, {
				contentType: "google_drive",
			});
		}
	},
});

export const runSetCorrectEmbedType = migrations.runner(
	internal.migrations.setCorrectEmbedType,
);

export const migrateContributorsToSeparateTable = migrations.define({
	table: "siteConfig",
	migrateOne: async (ctx, doc) => {
		// Type assertion to access old contributors field that may exist in old data
		const docWithContributors = doc

		if (docWithContributors?.contributors === undefined) return;
		// Get existing contributors for this school to determine next order value
		const existingContributors = await ctx.db
			.query("contributors")
			.withIndex("by_school", (q) => q.eq("school", doc.school))
			.collect();

		const maxOrder =
			existingContributors.length > 0
				? Math.max(...existingContributors.map((c) => c.order))
				: -1;

		// Create contributor records
		for (let i = 0; i < docWithContributors?.contributors?.length; i++) {
			const contributor = docWithContributors?.contributors?.[i];
			await ctx.db.insert("contributors", {
				school: doc.school,
				name: contributor.name,
				role: contributor.role,
				avatar: contributor.avatar,
				description: contributor.description,
				order: maxOrder + 1 + i,
			});
		}

		// Note: We don't need to remove contributors from siteConfig here
		// as it's already been removed from the schema. The migration will
		// just move the data to the new table.
	},
});

export const runMigrateContributorsToSeparateTable = migrations.runner(
	internal.migrations.migrateContributorsToSeparateTable,
);

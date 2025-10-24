import { TrafficChart, type MonthlyTraffic } from "@/components/linear-chart";
import { tryCatch } from "@/lib/try-catch";
import { Statis } from "./stats";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | The OpenCourseWare Platform",
  description: "See how many people view and use courses on The OpenCourseWare Platform"
}

type TrafficData = {
  pageviews: number;
  visitors: number;
};

const posthogUrl = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const apiKey = process.env.PERSONAL_ACCESS_API_KEY;
const projectId = process.env.PROJECT_ID;

export async function getTrafficData(): Promise<TrafficData> {
  const queryBody = {
    query: {
      kind: "HogQLQuery",
      query: `
        SELECT
          count() AS total_pageviews,
          count(DISTINCT person_id) AS unique_visitors
        FROM events
        WHERE event = '$pageview'
      `,
    },
    name: "server_component_global_traffic",
  };

  const { data, error } = await tryCatch(
    fetch(`${posthogUrl}/api/projects/${projectId}/query/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(queryBody),
      cache: "no-store",
    }).then(async (res) => {
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`PostHog API error ${res.status}: ${errText}`);
      }
      return res.json();
    }),
  );

  if (error) {
    console.error("PostHog fetch error:", error);
    throw new Error("Failed to fetch analytics data");
  }

  const [result] = data.results;
  const [pageviews, visitors] = result || [0, 0];

  return { pageviews, visitors };
}

export async function getTrafficTrends(): Promise<MonthlyTraffic[]> {
  const body = {
    query: {
      kind: "HogQLQuery",
      query: `
SELECT
  formatDateTime(toStartOfMonth(timestamp), '%Y-%m') AS month_key,
  countIf(event = '$pageview') AS pageviews,
  count(DISTINCT if(event = '$pageview', person_id, null)) AS visitors
FROM events
WHERE event = '$pageview'
GROUP BY toStartOfMonth(timestamp), month_key
ORDER BY toStartOfMonth(timestamp)
LIMIT 6
      `,
    },
    name: "embedded_monthly_traffic_trends",
  };
  const { data, error } = await tryCatch(
    fetch(`${posthogUrl}/api/projects/${projectId}/query/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      cache: "no-store", // Always fresh data
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`PostHog API error: ${text}`);
      }
      return res.json();
    }),
  );

  if (error) throw error;

  // PostHog returns an array like [[month, pageviews, visitors], ...]
  return data.results.map(
    ([month, pageviews, visitors]: [string, number, number]) => ({
      month,
      pageviews,
      users: visitors,
    }),
  );
}

export default async function Page() {
  const [trafficData, trafficTrends] = await Promise.all([
    getTrafficData(),
    getTrafficTrends(),
  ]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Here are our numbers, they're provided by{" "}
            <Link
              className="text-blue-300 underline"
              href="https://posthog.com"
            >
              {" "}
              posthog.com{" "}
            </Link>
          </p>
        </div>

        <Statis
          visitors={trafficData.visitors}
          pageviews={trafficData.pageviews}
        />
        {/* Traffic Chart */}
        <TrafficChart data={trafficTrends} />
      </div>
    </div>
  );
}

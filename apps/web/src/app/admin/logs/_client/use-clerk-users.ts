"use client";

import { useEffect, useState } from "react";
import type { ClerkUser } from "./types";

/**
 * Hook to fetch Clerk users
 */
export function useClerkUsers(): ClerkUser[] {
	const [users, setUsers] = useState<ClerkUser[]>([]);

	useEffect(() => {
		let cancelled = false;

		fetch("/api/clerk-users")
			.then((res) => {
				if (!res.ok) throw new Error("Failed to fetch users");
				return res.json();
			})
			.then((data: ClerkUser[]) => {
				if (!cancelled) {
					setUsers(data);
				}
			})
			.catch((err) => {
				console.error("Error fetching clerk users:", err);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return users;
}

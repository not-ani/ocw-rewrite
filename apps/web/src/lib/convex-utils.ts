/**
 * Validates if a string is a valid Convex ID format
 * @param id - The ID string to validate
 * @returns true if the ID appears to be valid, false otherwise
 */
export function isValidConvexId(id: string | undefined | null): boolean {
  if (!id) return false;
  
  // Convex IDs have a specific format - they should be longer than 10 characters
  // and should not contain special characters that would indicate a malformed URL
  return (
    id.length > 10 &&
    !id.includes("/") &&
    !id.includes(" ") &&
    id !== "undefined" &&
    id !== "null"
  );
}


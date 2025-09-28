import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server'

export const coursesSearchParams = {
  search: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
}

export const loadCourseParams = createLoader(coursesSearchParams);

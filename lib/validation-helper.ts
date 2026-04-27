import { z } from "zod";
import type { FormikErrors } from "formik";

export function zodToFormik<T extends Record<string, any>>(
  schema: z.ZodTypeAny,
  values: T
): FormikErrors<T> {
  const result = schema.safeParse(values);
  if (result.success) return {};

  const errors: any = {};

  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    // handle form-level errors (no path)
    if (!path) {
      errors._form = issue.message;
      continue;
    }
    // keep the first error per field (Formik shows one string)
    if (!errors[path]) errors[path] = issue.message;
  }

  return errors as FormikErrors<T>;
}

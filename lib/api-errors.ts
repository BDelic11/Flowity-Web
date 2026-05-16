import type { AxiosError } from "axios";

/**
 * Backend ProblemDetails for FluentValidation failures looks like:
 *   { status: 400, type: "ValidationFailure", title: "Validation error",
 *     detail: "...", errors: [{ propertyName, errorMessage }, ...] }
 *
 * Other backend failures use the Result<T> pattern:
 *   { code: "User.InvalidCredentials", description: "..." }  (BadRequest body)
 */
export type FieldErrors = Record<string, string>;

export type ApiErrorShape = {
  /** General message to show as a toast / form-level error. */
  message: string;
  /** Per-field messages keyed by lowercase property name (matches form keys). */
  fieldErrors: FieldErrors;
};

interface ValidationItem {
  propertyName?: string;
  errorMessage?: string;
}

interface ProblemDetailsLike {
  title?: string;
  detail?: string;
  errors?: ValidationItem[];
  code?: string;
  description?: string;
}

function lower(s: string | undefined): string {
  if (!s) return "";
  // BE sends "FirstName" — FE forms use "firstName".
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function parseApiError(error: unknown, fallback = "Something went wrong"): ApiErrorShape {
  const axiosErr = error as AxiosError<ProblemDetailsLike> | undefined;
  const data = axiosErr?.response?.data;

  // Validation errors → field map.
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const fieldErrors: FieldErrors = {};
    for (const e of data.errors) {
      const key = lower(e.propertyName);
      if (key && !fieldErrors[key] && e.errorMessage) fieldErrors[key] = e.errorMessage;
    }
    return {
      message: data.detail ?? data.title ?? "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  // Result<T> failure shape.
  if (data?.description || data?.code) {
    return { message: data.description ?? data.code ?? fallback, fieldErrors: {} };
  }

  // Plain ProblemDetails.
  if (data?.detail || data?.title) {
    return { message: data.detail ?? data.title ?? fallback, fieldErrors: {} };
  }

  // Network / timeout / unknown.
  return { message: axiosErr?.message ?? fallback, fieldErrors: {} };
}

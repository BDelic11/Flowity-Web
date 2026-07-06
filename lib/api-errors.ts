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
  /** Backend Result<T> failure — Error record serializes { code, name } not { code, description } */
  name?: string;
  description?: string;
}

function lower(s: string | undefined): string {
  if (!s) return "";
  // BE sends "FirstName" — FE forms use "firstName".
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** Croatian translations for backend error codes. */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  "User.InvalidCredentials": "Pogrešna e-pošta ili lozinka.",
  "User.EmailAlreadyInUse": "E-pošta je već u upotrebi.",
  "User.Found": "Korisnik s navedenim identifikatorom nije pronađen.",
  "User.InvalidRefreshToken": "Sesija je istekla. Molimo prijavite se ponovo.",
  "User.InvalidVerificationToken": "Poveznica za potvrdu e-pošte je nevažeća ili je istekla.",
  "User.EmailAlreadyVerified": "Ova e-pošta je već potvrđena.",
  "Organization.NotFound": "Organizacija nije pronađena.",
  "Organization.Forbidden": "Nemate pristup ovoj organizaciji.",
  "Organization.SlugAlreadyInUse": "Ovaj URL je već zauzet.",
  "Booking.NotFound": "Rezervacija nije pronađena.",
  "Booking.InvalidStatus": "Prijelaz statusa rezervacije nije moguć.",
  "Booking.ClientNameRequired": "Ime klijenta je obavezno.",
  "Customer.NotFound": "Klijent nije pronađen.",
  "Customer.AlreadyBlocked": "Klijent je već blokiran.",
  "Customer.PhoneAlreadyInUse": "Klijent s ovim brojem telefona već postoji.",
  "Subscription.NotFound": "Pretplata nije pronađena.",
  "Subscription.PlanNotChosen": "Molimo odaberite plan pretplate.",
  "Subscription.BookingLimitReached": "Dostigli ste limit rezervacija za vaš plan.",
  "Subscription.ClientLimitReached": "Dostigli ste limit klijenata za vaš plan.",
  "Subscription.StaffLimitReached": "Dostigli ste limit djelatnika za vaš plan.",
  "Subscription.OrganizationLimitReached": "Dostigli ste limit organizacija za vaš plan.",
  "Product.NotFound": "Proizvod nije pronađen.",
  "Product.Forbidden": "Nemate pristup ovom proizvodu.",
  "Product.InvalidDelta": "Delta ne može biti nula.",
  "Product.InvalidQuantity": "Količina mora biti veća od nule.",
  "Service.NotFound": "Usluga nije pronađena ili je neaktivna.",
  "Service.NoWorkers": "Usluzi mora biti dodijeljen barem jedan djelatnik.",
  "ServiceCatalogItem.NotFound": "Stavka kataloga usluga nije pronađena.",
  "AvailabilityRule.NotFound": "Pravilo dostupnosti nije pronađeno.",
  "Google.InvalidToken": "Google prijava nije uspjela. Pokušajte ponovo.",
  "Google.PersistFailed": "Pohrana Google podataka nije uspjela. Pokušajte ponovo.",
  "Org.NotFound": "Organizacija nije pronađena.",
};

export function parseApiError(
  error: unknown,
  fallback = "Došlo je do greške. Pokušajte ponovo."
): ApiErrorShape {
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
      message: data.detail ?? data.title ?? "Ispravite označena polja.",
      fieldErrors,
    };
  }

  // Result<T> failure shape — translate code first.
  // Backend Error record serializes as { code, name } — check both name and
  // description so we always show a human-readable message, never a raw code.
  if (data?.code || data?.description || data?.name) {
    const translated = data.code ? ERROR_CODE_MESSAGES[data.code] : undefined;
    return { message: translated ?? data.description ?? data.name ?? data.code ?? fallback, fieldErrors: {} };
  }

  // Plain ProblemDetails.
  if (data?.detail || data?.title) {
    return { message: data.detail ?? data.title ?? fallback, fieldErrors: {} };
  }

  // Network / timeout / unknown.
  return { message: axiosErr?.message ?? fallback, fieldErrors: {} };
}

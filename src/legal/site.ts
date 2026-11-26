/* ===========================================================================
   Facts the accessibility and privacy statements quote.
   ---------------------------------------------------------------------------
   One place, so both pages and the registration form agree.

   !!! BEFORE MERGING: replace every value marked TODO. The Israeli
   accessibility regulations require a reachable accessibility contact
   (name plus phone and/or email); the privacy statement needs the same.

   PRIVACY_VERSION is stored with each account's consent at registration.
   Change it (and PRIVACY_UPDATED) whenever the privacy statement's
   substance changes, so it is known which text each player accepted.
   =========================================================================== */

export const SITE_NAME = "Investments";

export const OPERATOR = {
  // The site is operated by Gal personally (decision 2026-11-26).
  name: { he: "גל עומר", en: "Gal Omer" }, // TODO: confirm the exact name to publish
  email: "TODO-contact@example.com", // TODO: contact email
};

export const ACCESSIBILITY_CONTACT = {
  name: { he: "גל עומר", en: "Gal Omer" }, // TODO: accessibility coordinator's name
  email: "TODO-accessibility@example.com", // TODO
  phone: "TODO-050-0000000", // TODO: phone (optional if email is given)
};

/** Days within which an accessibility request or a deletion request is answered. */
export const RESPONSE_DAYS = 30;

export const MIN_AGE = 16;

export const ACCESSIBILITY_UPDATED = "2026-11-26";
export const PRIVACY_UPDATED = "2026-11-26";
export const PRIVACY_VERSION = "2026-11-26";

/** True while any contact detail is still a placeholder; the pages show a warning. */
export const HAS_PLACEHOLDERS = [OPERATOR.email, ACCESSIBILITY_CONTACT.email, ACCESSIBILITY_CONTACT.phone].some(
  (v) => v.startsWith("TODO")
);

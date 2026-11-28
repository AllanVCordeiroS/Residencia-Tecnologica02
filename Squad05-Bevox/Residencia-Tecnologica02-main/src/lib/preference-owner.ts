// A preference namespace, never proof of authentication. Do not persist identity here.
let preferenceOwner: string | null = null;

export function setPreferenceOwner(userId: string | null) {
  preferenceOwner = userId;
}

export function getPreferenceOwner(): string {
  return preferenceOwner === null ? "default" : encodeURIComponent(preferenceOwner);
}

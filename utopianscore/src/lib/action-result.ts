// Shared shape for Server Actions wired to useFormState. This exists
// so the UI can show a real success/error message tied to what the
// server actually did — never a setTimeout-based fake confirmation.
export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

export const initialActionResult: ActionResult = { ok: true, message: "" };

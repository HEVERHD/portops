import { randomBytes } from "crypto"

/** Genera un ID único para uso en el servidor */
export function cuid(): string {
  return randomBytes(12).toString("hex")
}

import * as JSum from 'jsum'

export function jsonChecksum(json: unknown): string {
  return JSum.digest(json, 'SHA256', 'hex')
}
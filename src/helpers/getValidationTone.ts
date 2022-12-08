import {CardTone} from '@sanity/ui'
import {ArrayOfObjectsMember} from 'sanity'

export function getValidationTone(member: ArrayOfObjectsMember): CardTone | undefined {
  // @ts-ignore
  if (member.kind === 'error') {
    return 'critical'
  }

  // Check for validation errors
  const {validation} = member.item ?? {}

  if (!validation?.length) {
    return undefined
  }

  if (validation.some((v) => v.level === 'error')) {
    return 'critical'
  } else if (validation.some((v) => v.level === 'warning')) {
    return 'caution'
  }

  return undefined
}

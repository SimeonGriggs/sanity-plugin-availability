import {defineField} from 'sanity'

import {HOURS_OF_THE_DAY} from '../helpers/data'
import {AvailabilityTime} from '../helpers/types'

export default defineField({
  name: 'availabilityDuration',
  title: 'Duration',
  type: 'object',
  options: {columns: 2},
  initialValue: {
    from: HOURS_OF_THE_DAY[36], // 9:00 AM
    to: HOURS_OF_THE_DAY[68], // 5:00 PM
  },
  validation: (rule) =>
    rule.custom((value) => {
      const {from, to} = (value as AvailabilityTime) ?? {}

      if (!from && !to) {
        return `Must contain both times`
      }

      const fromIndex = HOURS_OF_THE_DAY.indexOf(from)
      const toIndex = HOURS_OF_THE_DAY.indexOf(to)

      if (fromIndex === -1 || toIndex === -1) {
        return `Time must be selected from the list`
      }

      if (fromIndex >= toIndex) {
        return `"To" time must be later than "From" time`
      }

      return true
    }),
  fields: [
    {
      name: 'from',
      type: 'string',
      options: {
        list: HOURS_OF_THE_DAY,
      },
    },
    {
      name: 'to',
      type: 'string',
      options: {
        list: HOURS_OF_THE_DAY,
      },
    },
  ],
  preview: {
    select: {
      from: 'from',
      to: 'to',
    },
    prepare({from, to}) {
      return {
        title: from && to ? `${from} – ${to}` : `Incomplete time`,
      }
    },
  },
})

import {defineField, Rule} from 'sanity'

import {hoursOfTheDay} from '../helpers/data'
import {AvailabilityTime} from '../helpers/types'

export default defineField({
  name: 'availabilityDuration',
  type: 'object',
  options: {columns: 2},
  initialValue: {
    from: hoursOfTheDay[36], // 9:00 AM
    to: hoursOfTheDay[68], // 5:00 PM
  },
  validation: (rule: Rule) =>
    rule.custom((value: AvailabilityTime) => {
      const {from, to} = value ?? {}

      if (!from && !to) {
        return `Must contain both times`
      }

      const fromIndex = hoursOfTheDay.indexOf(from)
      const toIndex = hoursOfTheDay.indexOf(to)

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
        list: hoursOfTheDay,
      },
    },
    {
      name: 'to',
      type: 'string',
      options: {
        list: hoursOfTheDay,
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

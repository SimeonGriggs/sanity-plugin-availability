import {defineField, Rule} from 'sanity'

import {hoursOfTheDay, daysOfTheWeek} from '../helpers/data'
import {AvailabilityTime} from '../helpers/types'

export default defineField({
  name: 'availabilityDay',
  type: 'object',
  fields: [
    {
      name: 'day',
      type: 'string',
      options: {
        list: daysOfTheWeek,
      },
    },
    {
      name: 'availableTimes',
      type: 'array',
      validation: (rule: Rule) =>
        rule.custom((times: AvailabilityTime[]) => {
          if (!times?.length) return true

          const timesOrdered = times.map(({from, to}) => {
            const fromIndex = hoursOfTheDay.indexOf(from)
            const toIndex = hoursOfTheDay.indexOf(to)

            return fromIndex + toIndex
          })
          const timesSorted = [...timesOrdered].sort((a, b) => a - b)

          return timesOrdered.join() === timesSorted.join()
            ? true
            : `Times must be sorted from earliest to latest`
        }),
      of: [{type: 'availabilityDuration', name: 'availabilityDuration'}],
    },
  ],
  preview: {
    select: {
      title: 'day',
      timesLength: 'availableTimes.length',
      times0from: 'availableTimes.0.from',
      times0to: 'availableTimes.0.to',
      times1from: 'availableTimes.1.from',
      times1to: 'availableTimes.1.to',
    },
    prepare(select) {
      const {title, timesLength, times0from, times0to, times1from, times1to} = select as Record<
        string,
        string
      >

      const timesDisplay = []
      if (times0from && times0to) {
        timesDisplay.push(`${times0from} – ${times0to}`)
      } else if (times1from && times1to) {
        timesDisplay.push(`${times1from} – ${times1to}`)
      } else if (!timesDisplay.length) {
        return {
          title,
          subtitle: `Unavailable`,
        }
      }
      return {
        title,
        subtitle:
          typeof timesLength === 'number' && timesLength > 2
            ? `${timesDisplay.join(', ')} and ${timesLength - 2} more`
            : timesDisplay.join(', '),
      }
    },
  },
})

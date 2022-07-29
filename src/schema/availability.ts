import {defineField, Path, Rule} from 'sanity'

import Availability from '../components/Availability'
import {daysOfTheWeek, defaultAvailabilityDays} from '../helpers/data'
import {AvailabilityDay} from '../helpers/types'

export default defineField({
  name: 'availability',
  type: 'array',
  components: {input: Availability},
  // Bug in Studio currently gives these items the wrong keys, must be set at document level
  // initialValue: defaultAvailabilityDays(),
  validation: (rule: Rule) =>
    rule
      .min(7)
      .max(7)
      .unique()
      .custom<AvailabilityDay[]>((value) => {
        if (!value?.length) {
          return true
        }

        const outOfOrderDays = value.reduce((acc, row, rowIndex) => {
          if (row.day === daysOfTheWeek[rowIndex]) {
            return acc
          }

          return [...acc, [{_key: row._key as string}] as Path]
        }, [] as Path[])

        return outOfOrderDays?.length
          ? {
              message: `Days must be in the correct order`,
              paths: outOfOrderDays,
            }
          : true
      }),
  of: [{type: 'availabilityDay', name: 'availabilityDay'}],
})

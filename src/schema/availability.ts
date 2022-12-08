import {defineField, Path} from 'sanity'

import Availability from '../components/Availability'
import {DAYS_OF_THE_WEEK} from '../helpers/data'
import {AvailabilityDay} from '../helpers/types'

export default defineField({
  name: 'availability',
  type: 'array',
  components: {
    // @ts-ignore
    input: Availability,
  },
  validation: (rule) =>
    rule
      .min(7)
      .max(7)
      .unique()
      .custom<AvailabilityDay[]>((value) => {
        if (!value?.length) {
          return true
        }

        const outOfOrderDays = value.reduce((acc, row, rowIndex) => {
          if (row.day === DAYS_OF_THE_WEEK[rowIndex]) {
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

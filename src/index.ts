import {createPlugin} from 'sanity'
import {defaultAvailabilityDays} from './helpers/data'

import availabilitySchema from './schema/availability'
import availabilityDay from './schema/availabilityDay'
import availabilityDuration from './schema/availabilityDuration'
export {defaultAvailabilityDays} from './helpers/data'

interface PluginConfig {
  /* nothing here yet */
}

export const availability = createPlugin<PluginConfig | void>((config = {}) => {
  return {
    name: 'sanity-plugin-availability',
    schema: {
      types: [availabilitySchema, availabilityDay, availabilityDuration],
    },
  }
})

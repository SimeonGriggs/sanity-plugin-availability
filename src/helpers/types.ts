import {ArraySchemaType} from 'sanity'
import {ArrayOfObjectsInputProps} from 'sanity'

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type AvailabilityTime = {
  _type: 'availabilityDuration'
  _key: string
  from: string
  to: string
}

export type AvailabilityTimeKey = 'from' | 'to'

export type AvailabilityDay = {
  _type: 'availabilityDay'
  _key: DayKey
  day: Day
  availableTimes: AvailabilityTime[]
}

export type ArraySchemaWithDaySchema = ArraySchemaType & {
  of: [AvailabilityDay]
}

export type AvailabilityProps = ArrayOfObjectsInputProps<AvailabilityDay, ArraySchemaWithDaySchema>

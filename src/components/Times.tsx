import React from 'react'
import {Box, Card, Flex, Stack, Button, Autocomplete} from '@sanity/ui'
import {ArrayOfObjectsMember} from 'sanity'
import {FormFieldValidationStatus} from 'sanity/form'

import {handleAutocompleteFilter} from '../helpers/handleAutocompleteFilter'
import {getValidationTone} from '../helpers/getValidationTone'
import {daysOfTheWeek, hoursOfTheDay} from '../helpers/data'
import {TrashIcon} from '@sanity/icons'
import {AvailabilityTimeKey, DayKey} from '../helpers/types'
const autocompleteStyles = {maxWidth: 120}

type TimesProps = {
  members: ArrayOfObjectsMember[]
  readOnly: boolean
  dayKey: DayKey
  handleUpdateTime: (
    newTime: string,
    dayKey: DayKey,
    timeKey: string,
    fieldName: AvailabilityTimeKey
  ) => void
  handleDeleteTime: (dayKey: DayKey, timeKey: string) => void
}

export default function Times(props: TimesProps) {
  const {members, readOnly, dayKey, handleUpdateTime, handleDeleteTime} = props

  return (
    <Stack space={1}>
      {/* @ts-ignore */}
      {members.map((time) => (
        <Flex gap={1} key={time.key} align="center" justify="flex-end">
          {time?.item?.validation?.length > 0 ? (
            <Box paddingRight={2}>
              <FormFieldValidationStatus validation={time.item.validation} />
            </Box>
          ) : null}

          {[`from`, `to`].map((fieldName) => (
            <Card key={fieldName} tone={getValidationTone(time)}>
              <Autocomplete
                id={`${time.key}-${fieldName}`}
                filterOption={handleAutocompleteFilter}
                radius={1}
                // @ts-ignore
                value={time?.item?.value?.[fieldName] ?? ``}
                options={hoursOfTheDay.map((hour) => ({value: hour}))}
                onChange={(newValue) =>
                  handleUpdateTime(newValue, dayKey, time.key, fieldName as 'from' | 'to')
                }
                style={autocompleteStyles}
                disabled={readOnly}
              />
            </Card>
          ))}

          <Button
            onClick={() => handleDeleteTime(dayKey, time.key)}
            aria-label="Remove Hours"
            disabled={daysOfTheWeek.length === 1 || readOnly}
            icon={TrashIcon}
            tone="critical"
            mode="ghost"
          />
        </Flex>
      ))}
    </Stack>
  )
}

import React from 'react'
import {Box, Flex, Text, Switch} from '@sanity/ui'
import {AvailabilityDay, DayKey} from '../helpers/types'

type AvailableToggleProps = {
  value: AvailabilityDay
  handleToggle: (day: DayKey, hasAvailableTimes: boolean) => void
  readOnly?: boolean
}

export default function AvailableToggle(props: AvailableToggleProps) {
  const {value, readOnly, handleToggle} = props

  return (
    <>
      <Flex align="center" gap={1}>
        <Switch
          checked={Boolean(value.availableTimes?.length > 0)}
          onChange={() => handleToggle(value._key, value.availableTimes?.length > 0)}
          disabled={typeof readOnly === 'boolean' && readOnly}
        />
      </Flex>
      <Box flex={1}>
        <Text size={2}>{value.day}</Text>
      </Box>
    </>
  )
}

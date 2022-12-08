import React, {useCallback, useEffect, useState} from 'react'
import {Box, Card, Flex, Stack, Text, Switch, Label, Button, Code} from '@sanity/ui'
import {AddIcon, RevertIcon} from '@sanity/icons'
import {set, unset, setIfMissing, insert, FormFieldValidationStatus} from 'sanity'

import {getValidationTone} from '../helpers/getValidationTone'
import {
  DAYS_OF_THE_WEEK,
  defaultAvailabilityTimes,
  HOURS_OF_THE_DAY,
  defaultAvailabilityDays,
} from '../helpers/data'
import {AvailabilityProps, AvailabilityTime, AvailabilityTimeKey, DayKey} from '../helpers/types'
import AvailableToggle from './AvailableToggle'
import Times from './Times'

const WEEKDAYS = DAYS_OF_THE_WEEK.slice(0, 5).map((day) => day.toLowerCase())
const WEEKEND_DAYS = DAYS_OF_THE_WEEK.slice(5).map((day) => day.toLowerCase())

let hasValue = false

export default function Availability(props: AvailabilityProps) {
  const {onChange, value, members, readOnly} = props

  const [syncWeekdays, setSyncWeekdays] = useState(true)
  const [syncWeekendDays, setSyncWeekendDays] = useState(false)

  // Value does not always load on first render
  // Set the sync states to align with their values
  useEffect(() => {
    if (value?.length && !hasValue) {
      hasValue = true

      const allWeekdayTimeStrings = value?.length
        ? value
            .filter((day) => WEEKDAYS.includes(day._key))
            .map((day) => day.availableTimes)
            .flat()
            .map((time) => `${time?.from}-${time?.to}`)
        : []
      const allWeekdaysAreSynced =
        allWeekdayTimeStrings.length >= WEEKDAYS.length &&
        allWeekdayTimeStrings.every((v) => v === allWeekdayTimeStrings[0])

      if (allWeekdaysAreSynced) {
        setSyncWeekdays(true)
      }

      const allWeekendTimeStrings = value?.length
        ? value
            .filter((day) => WEEKEND_DAYS.includes(day._key))
            .map((day) => day.availableTimes)
            .flat()
            .map((time) => `${time?.from}-${time?.to}`)
        : []
      const allWeekendDaysAreSynced =
        allWeekendTimeStrings.length >= WEEKEND_DAYS.length &&
        allWeekendTimeStrings.every((v) => v === allWeekendTimeStrings[0])

      if (allWeekendDaysAreSynced) {
        setSyncWeekendDays(true)
      }
    }
  }, [value])

  // Should this function sync to multiple days?
  const shouldSyncPatch = useCallback(
    (dayKey: string) =>
      (syncWeekdays && WEEKDAYS.includes(dayKey)) ||
      (syncWeekendDays && WEEKEND_DAYS.includes(dayKey)),
    [syncWeekdays, syncWeekendDays]
  )

  // Replaces the entire tradingHours array with the passed-in times
  const syncedPatch = useCallback(
    (updatedAvailabilityTimes: AvailabilityTime[], clickedDayKey: DayKey) => {
      // Create array of patches for synced days
      const syncedPatches = DAYS_OF_THE_WEEK.map((day) => day.toLowerCase() as DayKey).reduce(
        (allPatches: any[], dayKey) => {
          const path = [{_key: dayKey}, `availableTimes`]

          if (syncWeekdays && WEEKDAYS.includes(dayKey) && WEEKDAYS.includes(clickedDayKey)) {
            return updatedAvailabilityTimes?.length
              ? [setIfMissing([], path), set(updatedAvailabilityTimes, path), ...allPatches]
              : [unset(path), ...allPatches]
          }

          if (
            syncWeekendDays &&
            WEEKEND_DAYS.includes(dayKey) &&
            WEEKEND_DAYS.includes(clickedDayKey)
          ) {
            return updatedAvailabilityTimes.length
              ? [setIfMissing([], path), set(updatedAvailabilityTimes, path), ...allPatches]
              : [unset(path), ...allPatches]
          }

          return allPatches
        },
        []
      )

      if (!syncedPatches.length) {
        return null
      }

      return onChange(syncedPatches)
    },
    [syncWeekdays, syncWeekendDays, onChange]
  )

  // Removes open times or adds default open times
  const handleToggle = useCallback(
    (dayKey: DayKey, hasAvailableTimes: boolean) => {
      // Remove or reset a single day
      if (!shouldSyncPatch(dayKey)) {
        const path = [{_key: dayKey}, `availableTimes`]

        return onChange(
          hasAvailableTimes
            ? set([], path)
            : [setIfMissing([], path), set(defaultAvailabilityTimes(), path)]
        )
      }

      // Remove or reset open times for all synced days
      const updatedAvailabilityTimes = hasAvailableTimes ? [] : defaultAvailabilityTimes()

      return syncedPatch(updatedAvailabilityTimes, dayKey)
    },
    [shouldSyncPatch, syncedPatch, onChange]
  )

  const handleUpdateTime = useCallback(
    (newTime: string, dayKey: DayKey, timeKey: string, fieldName: AvailabilityTimeKey) => {
      // Perform a single day patch
      // Or clear a single dropdown if no newTime was passed in
      if (!shouldSyncPatch(dayKey) || !newTime) {
        const path = [{_key: dayKey}, `availableTimes`, {_key: timeKey}, fieldName]
        return onChange(newTime ? set(newTime, path) : unset(path))
      }

      // Perform a synced multi-day patch
      // Get all trading times for the updated day
      const currentAvailableTimes = value?.find((day) => day._key === dayKey)?.availableTimes ?? []

      // Add new time to current day values
      const updatedAvailabilityTimes = currentAvailableTimes.map((time) => {
        if (time._key === timeKey) {
          time[fieldName] = newTime
        }

        return time
      })

      return syncedPatch(updatedAvailabilityTimes, dayKey)
    },
    [shouldSyncPatch, value, syncedPatch, onChange]
  )

  const handleDeleteTime = useCallback(
    (dayKey: DayKey, timeKey: string) => {
      // Delete a single days time
      if (!shouldSyncPatch(dayKey)) {
        const path = [{_key: dayKey}, `availableTimes`, {_key: timeKey}]
        return onChange(unset(path))
      }

      // Perform a synced multi-day patch
      // Get all trading times for the updated day
      const currentAvailableTimes = value?.find((day) => day._key === dayKey)?.availableTimes ?? []

      // Unset this trading time from the array
      const updatedAvailabilityTimes = currentAvailableTimes.filter(
        (time: AvailabilityTime) => time._key !== timeKey
      )

      return syncedPatch(updatedAvailabilityTimes, dayKey)
    },
    [value, onChange, shouldSyncPatch, syncedPatch]
  )

  const handleAddTime = useCallback(
    (dayKey: DayKey) => {
      // Create a new set of trading times that come after the last trading time
      const prevTimes = value?.find((day) => day._key === dayKey)?.availableTimes?.at(-1)
      let nextTimes = {...defaultAvailabilityTimes()[0]}

      if (prevTimes?.from && prevTimes?.to) {
        const nextIndex = HOURS_OF_THE_DAY.indexOf(prevTimes.to) + 1

        nextTimes = {
          ...nextTimes,
          from: HOURS_OF_THE_DAY[nextIndex],
          to: HOURS_OF_THE_DAY[nextIndex + 1],
        }
      }

      // Add a single new set of times after the last one
      if (!shouldSyncPatch(dayKey)) {
        const path = [{_key: dayKey}, `availableTimes`, -1]

        return onChange(insert([nextTimes], 'after', path))
      }

      // Perform a synced multi-day patch
      // Get all trading times for the updated day
      const currentAvailableTimes = value?.find((day) => day._key === dayKey)?.availableTimes ?? []

      // Add new next time to every day
      const updatedAvailabilityTimes = [...currentAvailableTimes, nextTimes]

      return syncedPatch(updatedAvailabilityTimes, dayKey)
    },
    [onChange, shouldSyncPatch, syncedPatch, value]
  )

  const handleReset = useCallback(() => {
    onChange(set(defaultAvailabilityDays()))
  }, [onChange])

  return (
    <Stack space={[2, 2, 2, 1]}>
      {members?.length > 0
        ? members.map((dayMember, dayMemberIndex) => {
            if (dayMember.kind === 'error') {
              return (
                <Card key={dayMember.key} tone="critical" flex={1}>
                  <Code size={1}>{dayMember.error.type}</Code>
                </Card>
              )
            }

            return (
              <React.Fragment key={dayMember.key}>
                {dayMember.key === `monday` ? (
                  <Flex align="center" gap={3} paddingY={2}>
                    <Card flex={1} borderBottom />
                    <Label>Sync Weekdays</Label>
                    <Switch
                      disabled={readOnly}
                      checked={syncWeekdays}
                      onChange={() => setSyncWeekdays(!syncWeekdays)}
                    />
                  </Flex>
                ) : null}
                {dayMember.key === `saturday` ? (
                  <Flex align="center" gap={3} paddingY={2}>
                    <Card flex={1} borderBottom />
                    <Label>Sync Weekend</Label>
                    <Switch
                      disabled={readOnly}
                      checked={syncWeekendDays}
                      onChange={() => setSyncWeekendDays(!syncWeekendDays)}
                    />
                  </Flex>
                ) : null}
                <Card radius={2} padding={2} tone={getValidationTone(dayMember)}>
                  <Flex align="center" gap={3}>
                    <Flex
                      direction={[`column-reverse`, `column-reverse`, `column-reverse`, `row`]}
                      gap={[3, 3, 3, 0]}
                      align={[`flex-start`, `flex-start`, `flex-start`, `center`]}
                    >
                      {value && value[dayMemberIndex] ? (
                        <AvailableToggle
                          readOnly={readOnly}
                          value={value[dayMemberIndex]}
                          handleToggle={handleToggle}
                        />
                      ) : null}

                      {dayMember?.item?.validation?.length > 0 ? (
                        <FormFieldValidationStatus validation={dayMember.item.validation} />
                      ) : null}
                    </Flex>

                    {dayMember?.item?.members?.length > 0 ? (
                      <Stack flex={1} space={2}>
                        {dayMember.item.members
                          // TODO: Resolve this Type issue
                          // @ts-ignore
                          .filter((timeMember) => timeMember.name === 'availableTimes')
                          .map((timeMember) => {
                            switch (timeMember.kind) {
                              // @ts-ignore
                              case 'error':
                                return (
                                  <Card tone="critical" flex={1}>
                                    {/* @ts-ignore */}
                                    <Code size={1}>{dayMember.error.type}</Code>
                                  </Card>
                                )
                              case 'field':
                                return (
                                  <Flex
                                    key={timeMember.key}
                                    gap={2}
                                    flex={1}
                                    justify="flex-end"
                                    align="center"
                                  >
                                    {/* @ts-ignore */}
                                    {timeMember.field.members?.length > 0 ? (
                                      <Times
                                        // @ts-ignore
                                        members={timeMember.field.members}
                                        readOnly={typeof readOnly === 'boolean' ? readOnly : false}
                                        dayKey={dayMember.key as DayKey}
                                        handleUpdateTime={handleUpdateTime}
                                        handleDeleteTime={handleDeleteTime}
                                      />
                                    ) : (
                                      <Box paddingRight={2}>
                                        <Text size={1} muted>
                                          Unavailable
                                        </Text>
                                      </Box>
                                    )}
                                  </Flex>
                                )
                              default:
                                return null
                            }
                          })}
                      </Stack>
                    ) : (
                      <Box flex={1} />
                    )}

                    <Button
                      onClick={() => handleAddTime(dayMember.key as DayKey)}
                      aria-label="Add Hours"
                      icon={AddIcon}
                      tone="primary"
                      padding={2}
                      fontSize={1}
                      disabled={readOnly}
                    />
                  </Flex>
                </Card>
              </React.Fragment>
            )
          })
        : null}

      <Button
        icon={RevertIcon}
        tone="critical"
        text="Reset to Default"
        onClick={handleReset}
        mode="ghost"
      />
    </Stack>
  )
}

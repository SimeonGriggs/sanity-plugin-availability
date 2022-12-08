type Option = {
  value: string
}

export const handleAutocompleteFilter = (query: string, option: Option): boolean => {
  // Return a search for `1.15` as `1:15`
  const queryFuzzy = query.includes(`.`) ? query.replace(`.`, `:`) : query
  const queryUpper = queryFuzzy.toUpperCase()

  // Return a search for `2a` as `2:00 AM`
  const shortTime = option.value
    .split(`:`)
    .map((t, i) => (i ? t.slice(3) : t))
    .join(``)

  // Return a search for `23:45` as `11:45 PM`
  const twentyFourHourTime = option.value.endsWith(`PM`)
    ? option.value
        .split(`:`)
        .map((t, i) => (i ? t : parseInt(t, 10) + 12))
        .join(`:`)
    : ``

  return (
    option.value.startsWith(queryUpper) ||
    twentyFourHourTime?.startsWith(queryUpper) ||
    shortTime.startsWith(queryUpper)
  )
}

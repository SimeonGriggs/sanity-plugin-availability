# sanity-plugin-availability

Studio v3 exclusive Schema and Custom Input to indicate and rapidly author availability data.

![Custom input component showing days of the week and available times](https://raw.githubusercontent.com/SimeonGriggs/sanity-plugin-availability/main/img/availability.png)

## Installation

```
npm install --save sanity-plugin-availability
```

or

```
yarn add sanity-plugin-availability
```

## Usage

Add it as a plugin in sanity.config.ts (or .js):

```ts
// ./sanity.config.ts

 import {defineConfig} from 'sanity'
 import {availability} from 'sanity-plugin-availability'

 export const defineConfig({
  // all other settings...
  plugins: [
    availability()
  ]
 })
```

Then use the `availability` field `type` as a field in your schema files.

```ts
defineField({
  name: 'availability',
  type: 'availability',
})
```

To create default times for all new documents, set an Initial Value at the document level. The helper function `defaultAvailabilityDays` is exported from the plugin for this.

(In future the plugin will do this itself, but a bug in the Studio presently requires this to be done at the document level so that the correct array `_key` values are set)

```ts
import {defineType} from 'sanity'
import {defaultAvailabilityDays} from 'sanity-plugin-availability'

export default defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  initialValue: {
    availability: defaultAvailabilityDays(),
  },
  // ... all other schema settings
})
```

## Caveats

To get this first version launched choices have been made and there are currently no configurable options:

- Default availability times are Monday-Friday, 9am-5pm.
- Time increments are only available in 15 minutes.
- Time is shown in 12 hour time, but can be searched by 24 hour time queries.
- Days must be sorted Monday to Sunday, times from earliest to latest, but there are no controls for adjusting sorting if they happen to get out of sync.

## License

MIT © Simeon Griggs
See LICENSE


## License

[MIT](LICENSE) © Simeon Griggs


## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.

### Release new version

Run ["CI & Release" workflow](https://github.com/SimeonGriggs/sanity-plugin-availability/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.
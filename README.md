# usefirestore

> This package helps you to easy combine React, Redux and Firestore using hook.

[![NPM](https://img.shields.io/npm/v/usefirestore.svg)](https://www.npmjs.com/package/usefirestore) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save usefirestore
```

## Usage

```tsx
import * as React from 'react'

import { useMyHook } from 'usefirestore'

const Example = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
```

## License

MIT © [shapkar](https://github.com/shapkar)

---

This hook is created using [create-react-hook](https://github.com/hermanya/create-react-hook).

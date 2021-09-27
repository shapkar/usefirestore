import React from 'react'

import { useMyHook } from 'usefirestore'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App

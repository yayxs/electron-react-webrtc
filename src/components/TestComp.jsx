import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import useStateWithCallback from '../hooks/useStateWithCallback'
export default function TestComp() {
  //   const [state, setState] = useStateWithCallback({}, (state) => {
  //     // console.log(state)
  //   })
  const [state, setState] = useState({})
  const handleChange = () => {
    const transtraction = uuidv4()
    setState({
      [transtraction]: {
        id: transtraction,
        finish: () => {
          console.log(`finish 执行`)
        },
      },
    })
    console.log(state)
  }

  //   setInterval(() => {
  //     handleChange()
  //   }, 2000)
  console.log(state)
  return (
    <div>
      <button onClick={handleChange}>setState执行</button>
      <p>{JSON.stringify(state)}</p>
    </div>
  )
}

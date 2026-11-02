import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useGSAP(
  callback: (context: gsap.Context) => void,
  deps: React.DependencyList = []
) {
  const contextRef = useRef<gsap.Context | null>(null)

  useEffect(() => {
    contextRef.current = gsap.context(callback)
    return () => {
      contextRef.current?.revert()
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return contextRef
}

export default useGSAP

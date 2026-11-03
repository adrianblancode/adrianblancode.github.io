import { useEffect, useRef } from 'react'
import markup from './markup.html?raw'
import { BlueprintScene } from './scene.js'
import './blueprint.scss'

// Swap the design's asset tokens for the URLs Vite gives the bundled images
const assetUrls = import.meta.glob<string>('./assets/*.png', { eager: true, query: '?url', import: 'default' })
const html = markup
  .replace(/%asset:(\w+)%/g, (_, name: string) => assetUrls[`./assets/${name}.png`])
  .replaceAll('%base%', import.meta.env.BASE_URL)

// The scene drives its own DOM (scroll, drag and per-frame 3D transforms),
// so React renders the markup once and hands it over
function BlueprintHero() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = new BlueprintScene()
    scene.mount(rootRef.current!)
    return () => scene.unmount()
  }, [])

  return <div className="blueprint" ref={rootRef} dangerouslySetInnerHTML={{ __html: html }} />
}

export default BlueprintHero

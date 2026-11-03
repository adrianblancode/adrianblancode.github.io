export const defaultProps: {
  lightBg: number
  darkBg: number
  showGuides: boolean
  scrollLength: number
}

export class BlueprintScene {
  constructor(props?: typeof defaultProps)
  mount(root: HTMLElement): void
  unmount(): void
}

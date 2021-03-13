// Placing components and CSS classNames outside stories.tsx files bloats the production build for next.js
// And the Storybook complains if there's no stories in files that have the stories.tsx suffix
// Keeping it in this file seems like an ok compromise?

import React from 'react'

export function StorySequence({ children }: { children: React.ReactNode }) {}

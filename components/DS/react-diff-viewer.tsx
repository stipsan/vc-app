import ReactDiffViewer from 'react-diff-viewer'
import type { ReactDiffViewerProps } from 'react-diff-viewer'
import { memo, useMemo } from 'react'
import { useColorScheme, useThemeVariables } from '../../lib/utils'

export default memo(function CustomReactDiffViewer({
  original,
  modification,
  ...extra
}: {
  original: object
  modification: object
} & Omit<ReactDiffViewerProps, 'oldValue' | 'newValue'>) {
  const theme = useThemeVariables()
  const colorScheme = useColorScheme()
  const useDarkTheme = colorScheme === 'dark'

  const styles = useMemo(() => {
    const styles: ReactDiffViewerProps['styles'] = {
      variables: {
        light: {
          diffViewerBackground: theme.backgroundColor.white,
          diffViewerColor: theme.colors.gray[900],
          addedBackground: theme.colors.green[50],
          addedColor: theme.colors.green[900],
          removedBackground: theme.colors.red[50],
          removedColor: theme.colors.red[900],
          wordAddedBackground: theme.colors.green[200],
          wordRemovedBackground: theme.colors.red[200],
          codeFoldBackground: 'transparent',
          emptyLineBackground: '#fafbfc',
          codeFoldContentColor: theme.colors.gray[500],
        },
        dark: {
          diffViewerBackground: theme.backgroundColor.gray[900],
          diffViewerColor: theme.colors.white,
          addedBackground: theme.colors.green[900],
          addedColor: theme.colors.green[100],
          removedBackground: theme.colors.red[900],
          removedColor: theme.colors.red[100],
          wordAddedBackground: '#055d67',
          wordRemovedBackground: theme.colors.red[700],
          codeFoldBackground: 'transparent',
          emptyLineBackground: '#363946',
          codeFoldContentColor: theme.colors.gray[500],
        },
      },
      diffContainer: {
        borderRadius: theme.borderRadius.DEFAULT,
        'td:empty': {
          padding: '0px',
        },
      },
      // @ts-expect-error
      codeFold: {
        'td a': {
          // react-diff-viewer why do you insist???
          textDecoration: 'none !important',
          '&:focus': {
            outline: 'none',
          },
          '&:focus-visible pre, &:hover pre': {
            textDecoration: 'underline currentColor !important',
          },
        },
      },
    }
    return styles
  }, [theme])

  // TODO use prettier to format
  const oldValue = useMemo(() => JSON.stringify(original, null, 2), [original])
  const newValue = useMemo(() => JSON.stringify(modification, null, 2), [
    modification,
  ])

  return (
    <ReactDiffViewer
      oldValue={oldValue}
      newValue={newValue}
      splitView={false}
      useDarkTheme={useDarkTheme}
      hideLineNumbers
      extraLinesSurroundingDiff={1}
      styles={styles}
      {...extra}
    />
  )
})

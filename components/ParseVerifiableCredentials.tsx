import { Suspense, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createAsset } from 'use-asset'
import { useMachineSelector, useMachineSend } from '../lib/contexts'
import { useIdsList, useJsonMap } from '../lib/selectors'
import { useStore } from '../lib/useStore'
import ReactJason from './DS/react-jason'
import { ErrorMessage, Panel } from './Formatted'
import ReportRow from './ReportRow'
import styles from './uglyworkarounds.module.css'

const work = createAsset(async (editor: string) => {
  try {
    const [
      { default: babelParser },
      { default: prettier },
    ] = await Promise.all([
      import('prettier/parser-babel'),
      import('prettier/standalone'),
    ])
    // Prettier will handle annoying things like forgetting to use double quotes on keys, or forgetting to remove trailing slashes
    const formatted = prettier
      .format(editor, {
        tabWidth: 4,
        parser: 'json',
        plugins: [babelParser],
      })
      .trim()

    const data = JSON.parse(formatted)
    const items = [].concat(data?.verifiableCredential || data?.items || data)

    if (!items.length) {
      throw new Error(`Failed to find Verifiable Credentials in the editor`)
    }

    return { ok: true, data: items }
  } catch (error) {
    return { ok: false, error }
  }
}, 15000)

function ParseVerifiableCredentials() {
  const send = useMachineSend()
  const ids = useIdsList()
  const json = useJsonMap()

  const isCurrent = useMachineSelector(
    useCallback((state) => state.value === 'parsing', [])
  )
  const editor = useStore((state) => state.editor)

  const result = isCurrent ? work.read(editor) : undefined

  useEffect(() => {
    if (result?.ok === true) {
      send({
        type: 'PARSE_SUCCESS',
        input: result.data.map((item) => {
          if ('verifiableCredential' in item) return item.verifiableCredential
          return item
        }),
      })
    }
    if (result?.ok === false) {
      send({ type: 'PARSE_FAILURE', input: result.error.message })
      toast.error(`Failed finding Verifiable Credentials in the editor`)
    }
  }, [result, send])

  switch (true) {
    case result?.ok === false:
      return (
        <ReportRow readyState="error">
          <Panel variant="error">
            <ErrorMessage>{result.error}</ErrorMessage>
          </Panel>
        </ReportRow>
      )
    case ids.length > 0:
      return (
        <ReportRow readyState="success">
          <Panel>
            Found <span className="font-bold">{ids.length}</span>
            {ids.length === 1
              ? ' Verifiable Credential'
              : ' Verifiable Credentials'}
          </Panel>
          {ids.map((id) => (
            <Panel key={id} className={styles.maxWidth2}>
              <ReactJason value={json.get(id)} />
            </Panel>
          ))}
        </ReportRow>
      )

    default:
      return null
  }
}

export default function ParseVerifiableCredentialsSuspender() {
  return (
    <Suspense
      fallback={
        <ReportRow readyState="loading">
          <Panel>Parsing Verifiable Credentials from editor...</Panel>
        </ReportRow>
      }
    >
      <ParseVerifiableCredentials />
    </Suspense>
  )
}

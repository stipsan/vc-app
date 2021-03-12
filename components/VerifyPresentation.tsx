import { useImmer } from 'use-immer'
import cx from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Interpreter } from '../lib/stateMachine'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

function VerifyPresentationRow({
  state,
  send,
}: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { ids, json, jsonld, verifiedCredentials } = state.context
  const [readyState, setReadyState] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [verifiablePresentation, setVerifiablePresentation] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [error, setError] = useState(null)
  const [log, updateLog] = useImmer(new Map<string, string | object>())
  console.log(log)
  useEffect(() => {
    let cancelled = false

    Promise.all([
      import('@transmute/did-key-ed25519'),
      import('@transmute/ed25519-signature-2018'),
      import('@transmute/vc.js'),
      import('../lib/documentLoader'),
    ])
      .then(
        async ([
          { Ed25519KeyPair },
          { Ed25519Signature2018 },
          { ld: vc },
          { default: documentLoaderFactory },
        ]) => {
          if (cancelled) return

          ///* figure out why this fails
          const key = await Ed25519KeyPair.generate({
            secureRandom: () =>
              window.crypto.getRandomValues(new Uint8Array(32)),
          })
          //*/
          //const key = await Ed25519KeyPair.from(didDoc.publicKey[0])
          // TODO temp workaround issue with libs out of sync
          ///*
          Object.defineProperty(key, 'publicKeyBase58', {
            get() {
              console.log('get!')
              return key.toKeyPair().publicKeyBase58
            },
          })
          //*/
          key.id = key.controller + key.id
          console.log({ key }, key.id)
          const suite = new Ed25519Signature2018({ key })
          console.log({ suite })

          const documentLoader = async (url: string) => {
            console.warn(url.startsWith(key.controller), key.controller, url)
            if (url.startsWith(key.controller) && false) {
              return {
                contextUrl: null,
                document: {
                  '@context': [
                    'https://w3id.org/did/v0.11',
                    {
                      '@base': key.controller,
                    },
                  ],
                  id: key.controller,
                  publicKey: [key.toKeyPair()],
                  authentication: [key.id],
                  assertionMethod: [key.id],
                  capabilityDelegation: [key.id],
                  capabilityInvocation: [key.id],
                },
                documentUrl: url,
              }
            }
            updateLog((draft) => {
              if (!draft.has(url)) draft.set(url, 'loading')
            })
            try {
              const result = await documentLoaderFactory(url)
              updateLog((draft) => {
                if (draft.get(url) === 'loading')
                  draft.set(url, JSON.parse(JSON.stringify(result)))
              })
              return result
            } catch (err) {
              updateLog((draft) => {
                if (draft.get(url) === 'loading') draft.set(url, err.message)
              })
              throw err
            }
          }

          const id = 'ebc6f1c2'
          const holder = 'did:ex:12345'
          const challenge = '123'
          const presentation = await vc.createPresentation({
            verifiableCredential: JSON.parse(
              JSON.stringify([...json.values()])
            ),
            id,
            holder,
            documentLoader,
          })
          /*
          presentation.verifiableCredential = presentation.verifiableCredential.map(
            (_, i) => {
              if (i % 2) return _
              _.id = new Date().toISOString()
              return _
            }
          )
          // */
          console.log({ presentation })
          const verifiablePresentation = await vc.signPresentation({
            presentation,
            suite,
            challenge,
            documentLoader,
          })

          setVerifiablePresentation(verifiablePresentation)

          console.log({ verifiablePresentation })
          /*
          verifiablePresentation.verifiableCredential = verifiablePresentation.verifiableCredential.map(
            (_) => {
              _.id = new Date().toISOString()
              return _
            }
          )
          // */
          const presentationVerified = await vc.verify({
            presentation: verifiablePresentation,
            suite: new Ed25519Signature2018({}),
            //suite,
            challenge,
            documentLoader,
          })
          console.log({ presentationVerified })

          if (cancelled) return

          setExpanded(presentationVerified)
          if (presentationVerified.verified) {
            setReadyState('success')
            send({ type: 'VERIFIED_PRESENTATION_SUCCESS', input: id })
          } else {
            setReadyState('error')
            setError(presentationVerified.error)
            toast.error(`${id} Failed verification`)
            send({ type: 'VERIFIED_PRESENTATION_FAILURE', input: id })
          }
        }
      )
      .catch((err) => {
        if (cancelled) return
        setReadyState('error')
        setError(err)
        toast.error(`The Verifiable Presentation didn't verify`)
        send({ type: 'VERIFIED_PRESENTATION_FAILURE', input: '' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const message =
    readyState === 'loading'
      ? 'Creating and Verifying Verifiable Presentation...'
      : readyState === 'error'
      ? `The Verifiable Presentation didn't verify`
      : `The Verifiable Presentation is verifiable`

  return (
    <>
      {verifiablePresentation && (
        <Panel key="first" variant="success">
          Created Verifiable Presentation with
          {verifiablePresentation.verifiableCredential.length === 1
            ? ' Verifiable Credential'
            : ' Verifiable Credentials'}
          <SuperReadonlyTextarea
            value={JSON.stringify(verifiablePresentation)}
          />
        </Panel>
      )}
      <Panel
        key="second"
        className={cx({
          'animate-pulse': readyState === 'loading',
        })}
        variant={
          readyState === 'error'
            ? 'error'
            : readyState === 'success'
            ? 'success'
            : 'default'
        }
      >
        {message}
        {readyState === 'success' && expanded && (
          <SuperReadonlyTextarea value={JSON.stringify(expanded)} />
        )}
        {readyState === 'error' &&
          (expanded ? (
            <SuperReadonlyTextarea
              className="bg-red-100 dark:bg-red-900 dark:bg-opacity-20 focus:ring-inset focus:ring-red-200 dark:focus:ring-red-900 focus:ring-2"
              value={JSON.stringify(expanded)}
            />
          ) : (
            error && (
              <div className="rounded py-2 my-1 px-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-20">
                {error.message}
                <br />
                {error.stack}
              </div>
            )
          ))}
      </Panel>
    </>
  )
}

export default function VerifyPresentation({
  state,
  send,
}: {
  state: Interpreter['state']
  send: Interpreter['send']
}) {
  const { verifiedPresentation } = state.context
  const isCurrent = state.matches('verifyingPresentation')

  if (isCurrent || verifiedPresentation !== 'pending') {
    return (
      <ReportRow>
        <VerifyPresentationRow state={state} send={send} />
      </ReportRow>
    )
  }

  return null
}

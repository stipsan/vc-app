import { Suspense, useCallback, useEffect, useMemo } from 'react'
import { createAsset } from 'use-asset'
import { useMachineSelector, useMachineSend } from '../lib/contexts'
import { useJsonMap } from '../lib/selectors'
import ReactJason from './DS/react-jason'
import { Collapsible, Panel } from './Formatted'
import ReportRow from './ReportRow'

const work = createAsset(async (verifiableCredential: any) => {
  try {
    const [
      { Ed25519KeyPair },
      { Ed25519Signature2018 },
      { ld: vc },
      { default: documentLoaderFactory },
    ] = await Promise.all([
      import(
        /* webpackChunkName: "did-key-ed25519" */ '@transmute/did-key-ed25519'
      ),
      import(
        /* webpackChunkName: "ed25519-signature-2018" */ '@transmute/ed25519-signature-2018'
      ),
      import(/* webpackChunkName: "vc-js" */ '@transmute/vc.js'),
      import(/* webpackChunkName: "documentLoader" */ '../lib/documentLoader'),
    ])

    const key = await Ed25519KeyPair.generate({
      secureRandom: () => window.crypto.getRandomValues(new Uint8Array(32)),
    })
    /*
    Object.defineProperty(key, 'publicKeyBase58', {
      get() {
        console.log('get!')
        return key.toKeyPair().publicKeyBase58
      },
    })
    //*/
    key.id = key.controller + key.id
    const date = process.env.STORYBOOK
      ? new Date('2021-03-16T15:17:11.053Z')
      : new Date()
    const suite = new Ed25519Signature2018({ key, date })

    const documentLoader = async (url: string) => {
      if (url.startsWith(key.controller)) {
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

      try {
        const result = await documentLoaderFactory(url)

        return result
      } catch (err) {
        throw err
      }
    }

    const id = 'ebc6f1c2'
    const holder = 'did:ex:12345'
    const challenge = '123'
    const presentation = await vc.createPresentation({
      verifiableCredential,
      id,
      holder,
      documentLoader,
    })

    const verifiablePresentation = await vc.signPresentation({
      presentation,
      suite,
      challenge,
      documentLoader,
    })

    try {
      const result = await vc.verify({
        presentation: verifiablePresentation,
        suite: new Ed25519Signature2018({}),
        //suite,
        challenge,
        documentLoader,
      })

      if (result.verified) {
        return { ok: true, verifiablePresentation, result }
      } else {
        console.log({ result })
        return {
          ok: false,
          verifiablePresentation,
          error:
            result.error ??
            // @ts-expect-error
            result.credentialResults.find((_: any) => !_.verified)?.error,
        }
      }
    } catch (error) {
      return { ok: false, verifiablePresentation, error }
    }
  } catch (error) {
    return { ok: false, error }
  }
})

function VerifyPresentationRow() {
  const send = useMachineSend()
  const json = useJsonMap()
  const verifiableCredential = useMemo(
    () => JSON.parse(JSON.stringify([...json.values()])),
    [json]
  )

  const result = work.read(verifiableCredential)

  useEffect(() => {
    if (result?.ok === true) {
      send({
        type: 'VERIFIED_PRESENTATION_SUCCESS',
        input: '',
      })
    }
    if (result?.ok === false) {
      console.error('VERIFIED_PRESENTATION_FAILURE', result, result?.error)
      send({
        type: 'VERIFIED_PRESENTATION_FAILURE',
        input: result.error.message,
      })
    }
  }, [result, send])

  const { verifiablePresentation, error } = result

  return (
    <>
      {verifiablePresentation && (
        <Panel
          key="first"
          className="w-[calc(100vw-2rem)] md:w-[calc(100vw-3rem)]"
        >
          {`Created Verifiable Presentation with `}
          <span className="font-bold">
            {verifiablePresentation.verifiableCredential.length}
          </span>
          {verifiablePresentation.verifiableCredential.length === 1
            ? ' Verifiable Credential'
            : ' Verifiable Credentials'}
          <Collapsible>
            <ReactJason value={verifiablePresentation} />
          </Collapsible>
        </Panel>
      )}
      <Panel
        key="second"
        variant={result.ok === false ? 'error' : 'default'}
        className="w-[calc(100vw-2rem)] md:w-[calc(100vw-3rem)]"
      >
        {result.ok === false
          ? `The Verifiable Presentation didn't verify`
          : `The Verifiable Presentation is verifiable`}
        {result.ok === true && result.result && (
          <Collapsible>
            <ReactJason value={result.result} />
          </Collapsible>
        )}
        {result.ok === false && error && (
          <div className="rounded py-2 my-1 px-3 bg-red-100 dark:bg-red-900 dark:bg-opacity-20">
            {error.message}
            {!process.env.STORYBOOK && (
              <>
                <br />
                {error.stack}
              </>
            )}
          </div>
        )}
      </Panel>
    </>
  )
}

export default function VerifyPresentation() {
  const verifiedPresentation = useMachineSelector(
    useCallback((state) => state.context.verifiedPresentation, [])
  )
  const isCurrent = useMachineSelector(
    useCallback((state) => state.value === 'verifyingPresentation', [])
  )

  if (isCurrent || verifiedPresentation !== 'pending') {
    return (
      <ReportRow>
        <Suspense
          fallback={
            <Panel className="motion-safe:animate-pulse">
              Creating and Verifying Verifiable Presentation...
            </Panel>
          }
        >
          <VerifyPresentationRow />
        </Suspense>
      </ReportRow>
    )
  }

  return null
}

import { Suspense, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createAsset } from 'use-asset'
import { useMachineSelector, useMachineSend } from '../lib/contexts'
import { useJsonMap } from '../lib/selectors'
import { Panel, SuperReadonlyTextarea } from './Formatted'
import ReportRow from './ReportRow'

const work = createAsset(async (json: Map<string, object>) => {
  try {
    const [
      { Ed25519KeyPair },
      { Ed25519Signature2018 },
      { ld: vc },
      { default: documentLoaderFactory },
    ] = await Promise.all([
      import('@transmute/did-key-ed25519'),
      import('@transmute/ed25519-signature-2018'),
      import('@transmute/vc.js'),
      import('../lib/documentLoader'),
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
    const suite = new Ed25519Signature2018({ key })

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
      verifiableCredential: JSON.parse(JSON.stringify([...json.values()])),
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
        // send({ type: 'VERIFIED_PRESENTATION_SUCCESS', input: id })
      } else {
        return { ok: false, verifiablePresentation, error: result.error }
        // toast.error(` Failed verification`)
        // send({ type: 'VERIFIED_PRESENTATION_FAILURE', input: id })
      }
    } catch (error) {
      return { ok: false, verifiablePresentation, error }
      // toast.error(` Failed verification`)
      // send({ type: 'VERIFIED_PRESENTATION_FAILURE', input: id })
    }
  } catch (error) {
    return { ok: false, error }
  }
})

function VerifyPresentationRow() {
  const send = useMachineSend()
  const json = useJsonMap()

  const result = work.read(json)

  useEffect(() => {
    if (result?.ok === true) {
      send({
        type: 'VERIFIED_PRESENTATION_SUCCESS',
        input: '',
      })
    }
    if (result?.ok === false) {
      console.error('VERIFIED_PRESENTATION_FAILURE', result.error)
      send({
        type: 'VERIFIED_PRESENTATION_FAILURE',
        input: result.error.message,
      })
      toast.error(`Failed verification`)
    }
  }, [result, send])

  const { verifiablePresentation, error } = result

  return (
    <>
      {verifiablePresentation && (
        <Panel key="first">
          {`Created Verifiable Presentation with `}
          <span className="font-bold">
            {verifiablePresentation.verifiableCredential.length}
          </span>
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
        variant={
          result.ok === false
            ? 'error'
            : result.ok === true
            ? 'success'
            : 'default'
        }
      >
        {result.ok === false
          ? `The Verifiable Presentation didn't verify`
          : `The Verifiable Presentation is verifiable`}
        {result.ok === true && result.result && (
          <SuperReadonlyTextarea value={JSON.stringify(result.result)} />
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
            <Panel className="animate-pulse">
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

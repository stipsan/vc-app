import {
  contexts as _contexts,
  documentLoaderFactory,
} from '@transmute/jsonld-document-loader'
import DataLoader from 'dataloader'
import { Resolver } from 'did-resolver'
import didDoc from './did.json'
//import { getResolver } from 'web-did-resolver'
import { getResolver } from './webResolver'

const contexts = {
  ..._contexts.W3C_Verifiable_Credentials,
  ..._contexts.W3ID_Security_Vocabulary,
  ..._contexts.W3C_Decentralized_Identifiers,
}
const webResolver = getResolver()
// @ts-expect-error
const didResolver = new Resolver({ ...webResolver })

export const fetchLoader = new DataLoader(async (urls) =>
  urls.map(async (url: string) => {
    if (url in contexts) return contexts[url]
    if (process.env.STORYBOOK) {
      console.debug(
        `Loading document ${url} using the /api/cors?url= reverse proxy to get around CORS limitations`
      )
    }
    const res = await fetch(
      process.env.STORYBOOK ? url : `/api/cors?url=${url}`,
      { credentials: 'omit' }
    )
    if (!res.ok) console.warn(url, res.statusText)
    if (!res.ok) throw new Error(res.statusText)
    const data = await res.json()
    console.debug(`Successfully loaded ${url}`, data)
    return data
  })
)

const documentLoader = documentLoaderFactory.pluginFactory
  .build({ contexts })
  .addResolver({ [didDoc.id]: { resolve: async () => didDoc } })
  .addResolver({
    'did:web': { resolve: (did: string) => didResolver.resolve(did) },
  })
  .addResolver({
    'https:': { resolve: (url: string) => fetchLoader.load(url) },
  })
  .addResolver({
    'https://w3id.org/did/v0.11': {
      resolve: async () => (await import('./did-v0.11.json')).default,
    },
  })
  .buildDocumentLoader()

export default documentLoader

export type DocumentLoader = typeof documentLoader

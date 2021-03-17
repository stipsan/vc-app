import {
  contexts as _contexts,
  documentLoaderFactory
} from '@transmute/jsonld-document-loader'
import DataLoader from 'dataloader'
import { Resolver } from 'did-resolver'
import type { Draft } from 'immer'
import { createAsset } from 'use-asset'
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
   if(url in contexts) return contexts[url]
    console.debug(
      `Loading document ${url} using the /api/cors?url= reverse proxy to get around CORS limitations`
    )
    const res = await fetch(`/api/cors?url=${url}`, {
      credentials: 'omit',
    })
    if (!res.ok) console.warn(url, res.statusText)
    if (!res.ok) throw new Error(res.statusText)
    const data = await res.json()
    console.debug(`Successfully loaded ${url}`, data)
    return data
  })
)


// TODO refactor this, it's not entirely optimal
const documentLoader = documentLoaderFactory.pluginFactory
  .build({    contexts  })
  .addResolver({
    [didDoc.id]: {
      resolve: async (did: string) => {
        return didDoc
      },
    },
  })
  .addResolver({
    'did:web': {
      resolve: (did: string) => {
        return didResolver.resolve(did)
      },
    },
  })
  
  .addResolver({
    'https:': { resolve: async (url: string) => await fetchLoader.load(url) },
  })
  .addResolver({
    // Defined down here instead of in the `contexts` object because it shouldn't bloat the default JS bundles
    'https://w3id.org/did/v0.11': {
      resolve: async () =>  (await import('./contexts/did-v0.11.json')).default
    }
  })
  .addResolver({
    // Fallback to local cache until it's published
    'https://proxy.com/citizenship/v1': {
      resolve: async () =>  (await import('./contexts/proxy-citizenship-v1.json')).default
      ,
    },
  })
  .buildDocumentLoader()

export default documentLoader


import {
  contexts, documentLoaderFactory
} from '@transmute/jsonld-document-loader'
import DataLoader from 'dataloader'
import { Resolver } from 'did-resolver'
import citizenship from './citizenship-v1.json'
import didDoc from './did.json'
//import { getResolver } from 'web-did-resolver'
import { getResolver } from './webResolver'

const webResolver = getResolver()
// @ts-expect-error
const didResolver = new Resolver({ ...webResolver })
let citizenshipPromise

export const fetchLoader = new DataLoader(async urls => urls.map(async url => {
  console.debug(`Loading document ${url} using the /api/cors?url= reverse proxy to get around CORS limitations`)
  const res = await fetch(`/api/cors?url=${url}`, {
    credentials: 'omit',
  })
  if (!res.ok) throw new Error(res.statusText)
  const data = await res.json()
  console.debug(`Successfully loaded ${url}`, data)
  return data
}))


const documentLoader = documentLoaderFactory.pluginFactory
  .build({
    contexts: {
      ...contexts.W3C_Verifiable_Credentials,
      ...contexts.W3ID_Security_Vocabulary,
      ...contexts.W3C_Decentralized_Identifiers,
    },
  })
  .addResolver({
    ['https://proxy.com/citizenship/v1']: {
      resolve: async (url: string) => {
        if (!citizenshipPromise) {
          console.info('Attempting to load https://proxy.com/citizenship/v1')
          citizenshipPromise = fetchLoader.load(
            'https://proxy.com/citizenship/v1'
            
          ).catch(() => {
              console.info('Failed to fetch', url, 'loading local copy')
              return citizenship
          })
        }

        return citizenshipPromise
      },
    },
  })
  .addResolver({ ['https://w3id.org/did/v0.11']: { resolve: async (url: string) => await fetchLoader.load(url) } })
  .addResolver({
    ['did:web']: {
      resolve: (did: string) => {
        return didResolver.resolve(did)
      },
    },
  })
  .addResolver({
    [didDoc.id]: {
      resolve: async (did: string) => {
        return didDoc
      },
    },
  })
  .buildDocumentLoader()

export default documentLoader

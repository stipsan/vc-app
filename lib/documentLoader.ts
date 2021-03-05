import {
  documentLoaderFactory,
  contexts,
} from '@transmute/jsonld-document-loader'
import citizenship from './citizenship-v1.json'

let citizenshipPromise

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
          citizenshipPromise = fetch(
            '/api/cors?url=https://proxy.com/citizenship/v1',
            { credentials: 'omit' }
          ).then(async (res) => {
            try {
              if (!res.ok) throw new Error(res.statusText)
              return res.json()
            } catch {
              console.warn('Failed to fetch', url, 'loading local copy')
              return citizenship
            }
          })
        }

        return citizenshipPromise
      },
    },
  })
  .buildDocumentLoader()

export default documentLoader

import DocumentLoaderLogsComponent from './DocumentLoaderLogs'
import ReportRow from './ReportRow'

export const DocumentLoaderLogs = () => {
  return (
    <div className="w-screen min-h-screen pt-20">
      <ReportRow readyState="success">
        <DocumentLoaderLogsComponent
          log={{
            'https://w3id.org/did/v0.11': { '@context': '{...}' },
            'https://w3c-ccg.github.io/vc-examples/covid-19/v1/v1.jsonld': new Error(
              'Not Found'
            ),
            'https://w3c-ccg.github.io/vc-examples/covid-19/v2/v2.jsonld':
              'loading',
          }}
          loading={true}
        />
      </ReportRow>
    </div>
  )
}

export default {
  title: 'Design System',
}

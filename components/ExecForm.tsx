import { useMachineSend } from '../lib/contexts'

export default function ExecForm({ children }: { children: React.ReactNode }) {
  const send = useMachineSend()
  return (
    <form
      className="min-h-screen"
      onSubmit={(event) => {
        event.preventDefault()

        send({ type: 'EXEC', input: '' })
      }}
    >
      {children}
    </form>
  )
}

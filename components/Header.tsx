import cx from 'classnames'

export default function Header() {
  return (
    <header>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          console.log('hey ho!')
        }}
      >
        <label className="block">
          <span className="text-gray-700">API URL</span>
          <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            type="url"
            required
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Authorization</span>
          <input
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            type="text"
            placeholder="Bearer ..."
            required
          />
        </label>
        <button
          type="submit"
          className={cx(
            'focus:outline-none hover:bg-blue-200 hover:text-blue-800 group flex items-center rounded-md bg-blue-100 text-blue-600 text-sm font-medium px-4 py-2 focus:border-blue-200 focus:ring focus:ring-blue-100 focus:ring-opacity-50'
          )}
        >
          Check availability
        </button>
      </form>
    </header>
  )
}

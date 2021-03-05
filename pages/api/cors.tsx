import type { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const [url] = [].concat(req.query.url)
  console.log({ url }, req.headers)
  const proxy = await fetch(url, {
    // @ts-expect-error
    headers: {
      authorization: req.headers.authorization,
      accept: req.headers.accept,
      'user-agent': req.headers['user-agent'],
      'accept-encoding': req.headers['accept-encoding'],
    },
  })

  Object.entries(proxy.headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  res.status(proxy.status).send(proxy.body)
}

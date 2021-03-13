import type { NextApiRequest, NextApiResponse } from 'next'
import fetch from 'node-fetch'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const [queryUrl] = [].concat(req.query.url)
  const url = new URL(queryUrl)
  const proxyRes = await fetch(url.toString(), {
    method: req.method,
    // @ts-expect-error
    headers: Object.assign(
      { 'x-forwarded-host': req.headers.host },
      req.headers,
      { host: url.host }
    ),
    //body: req,
    compress: false,
    redirect: 'manual',
  })

  // Forward status code
  res.statusCode = proxyRes.status

  // Forward headers
  const headers = proxyRes.headers.raw()
  for (const key of Object.keys(headers)) {
    res.setHeader(key, headers[key])
  }
  if (res.hasHeader('location')) {
    const [location] = [].concat(res.getHeader('location'))
    res.setHeader('Location', `/api/cors?url=${location}`)
  }

  // Stream the proxy response
  proxyRes.body.pipe(res)
  proxyRes.body.on('error', (err) => {
    console.error(`Error on proxying url: ${url}`)
    console.error(err.stack)
    res.end()
  })

  req.on('abort', () => {
    // @ts-expect-error
    proxyRes.body.destroy()
  })
}

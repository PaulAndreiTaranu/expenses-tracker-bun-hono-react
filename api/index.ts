import app from './app'

const server = Bun.serve({
    port: process.env.PORT || 3002,
    hostname: '0.0.0.0',
    fetch: app.fetch,
})

console.log(`Listening on ${server.url}`)

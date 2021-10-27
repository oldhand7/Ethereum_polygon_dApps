const { createServer } = require('http')
const next = require('next')

const app = next({
    dev: process.env.NODE_ENV !== 'production'
})

// Sets up environmental variable used for Heroku (port)
const port = process.env.PORT || 3000
const routes = require('./routes')
const handler = routes.getRequestHandler(app)

app.prepare().then( () => {
    createServer(handler).listen(port, (err) => {
        if (err) throw err;
        console.log('Ready on localhost:3000')
    })
})
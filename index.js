import * as path from 'path'

import { Server } from 'socket.io'
import { createServer } from 'http'
import express from 'express'

const app = express()
const http = createServer(app)
const ioServer = new Server(http)
const port = process.env.PORT || 8000

// Serveer client-side bestanden
app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.static(path.resolve('public')))

// Routing met fallback naar 404 pagina
app.get('/', (req, res) => res.render('chatroom'))
app.get('*', (req, res) => res.render('404'))

// Start de socket.io server op
ioServer.on('connection', (client) => {

  // Log de connectie naar console
  console.log(`user ${client.id} connected`)

  // Luister naar een message van een gebruiker
  client.on('message', (message) => {

    let data = { message: message, client: client.id }

    // Log het ontvangen bericht
    console.log(`user ${client.id} sent message: ${data.message}`)

    // Verstuur het bericht naar alle clients
    ioServer.emit('message', { ...data })
  })

  // Luister naar een disconnect van een gebruiker
  client.on('disconnect', () => {
    // Log de disconnect
    console.log(`user ${client.id} disconnected`)
  })
})

// Start een http server op het ingestelde poortnummer en log de url
http.listen(port, () => {
  console.log('listening on http://localhost:' + port)
})
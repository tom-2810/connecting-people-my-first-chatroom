import * as path from 'path'

import { Server } from 'socket.io'
import { createServer } from 'http'
import express from 'express'

const app = express()
const http = createServer(app)
const ioServer = new Server(http)
const port = process.env.PORT || 8000

const historySize = 50

let history = []

// Serveer client-side bestanden
app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.static(path.resolve('public')))

// Routing
app.get('*', (req, res) => res.render('chatroom'))

// Start de socket.io server op
ioServer.on('connection', (client) => {

  // Log de connectie naar console
  console.log(`user ${client.id} connected`)

  // Stuur de history
  client.emit('history', history)

  // Luister naar een message van een gebruiker
  client.on('message', (message) => {

    // Check de maximum lengte van de historie
    while (history.length > historySize) {
      history.shift()
    }
    // Voeg het toe aan de historie
    history.push(message)

    let data = { message: message.message, username: message.username, avatarColor: message.avatarColor, client: client.id }

    // Log het ontvangen bericht
    console.log(`user ${client.id} sent message: ${data.message}`)

    // Verstuur het bericht naar alle clients
    ioServer.emit('message', { ...data })
  })

  // Luister naar een disconnect van een gebruiker
  client.on('disconnect', () => {
    // Log de disconnect
    console.log(`user ${client.id} disconnected`)

    let data = { client: client.id }

    ioServer.emit('status', { ...data })
  })
})

// Start een http server op het ingestelde poortnummer en log de url
http.listen(port, () => {
  console.log('listening on http://localhost:' + port)
})
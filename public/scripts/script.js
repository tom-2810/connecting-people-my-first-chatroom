let ioServer = io()
let messages = document.querySelector('ul')
let usernameInput = document.querySelector('input[name="username"]')
let avatarColorInput = document.querySelector('input[name="avatar-color"]')
let messageInput = document.querySelector('input[name="message"]')

let closeChatButton = document.querySelector('#close-chat-button')
let openChatButton = document.querySelector('#open-chat-button')

let chatroom = document.querySelector('#chatroom')

// State messages
const loadingState = document.querySelector('span.loading')
const emptyState = document.querySelector('span.empty')
const errorStateOffline = document.querySelector('span.error-offline')

let emojis = document.querySelectorAll('.emojis li button')

// Luister naar het submit event
document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault()

  // Als er überhaupt iets getypt is
  if (messageInput.value) {
    // Stuur het bericht naar de server
    ioServer.emit('message', { message: messageInput.value, username: usernameInput.value, avatarColor: avatarColorInput.value })

    // Leeg het form field
    usernameInput.parentElement.setAttribute('hidden', '')
    avatarColorInput.parentElement.setAttribute('hidden', '')
    messageInput.value = ''
  }
})

// Luister naar de historie van de chat
ioServer.on('history', (history) => {
  // Als er geen historie is tonen we de empty state
  if (history.length === 0) {
    loadingState.style.display = 'none'
    emptyState.style.display = 'flex'

    // Er zijn berichten, haal de states weg en loop ze op het scherm
  } else {
    loadingState.style.display = 'none'
    emptyState.style.display = 'none'
    history.forEach((message) => {
      addMessage(message)
    })
  }
})

// Luister naar berichten van de server
ioServer.on('message', (message) => {
  loadingState.style.display = 'none'
  emptyState.style.display = 'none'
  addMessage(message)
})

// Er gaat iets mis bij het verbinden
ioServer.io.on('error', (error) => {
  loadingState.style.display = 'none'
  emptyState.style.display = 'none'
  errorStateOffline.style.display = 'flex'
})

// Verbinding geslaagd
ioServer.io.on('reconnect', (attempt) => {
  loadingState.style.display = 'none'
  emptyState.style.display = 'none'
  errorStateOffline.style.display = 'none'
})

// Luister naar status
ioServer.on('status', (statusOfClient) => {
  let disconnectedClient = statusOfClient.client;

  document.querySelectorAll(`li#${disconnectedClient} .status`).forEach(messageStatus =>
    messageStatus.classList.toggle('online')
  )
  console.log(disconnectedClient)
})

/**
 * Impure function that appends a new li item holding the passed message to the
 * global messages object and then scrolls the list to the last message.
 * @param {*} message the message to append
 */
function addMessage(message) {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hour = date.getHours().toString();
  let minute = date.getMinutes().toString();

  if (hour.length == 1) hour = '0' + hour;
  if (minute.length == 1) minute = '0' + minute;

  let time = hour + ':' + minute;


  messages.insertAdjacentHTML('beforeend',
    `
    <li id="${message.client}" class="${message.client == ioServer.id ? "me" : ""}">
    <div style="background-color: ${message.avatarColor}" class="avatar">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15 29C22.7322 29 29 22.7322 29 15C29 7.2678 22.7322 1 15 1C7.2678 1 1 7.2678 1 15C1 22.7322 7.2678 29 15 29Z"
          stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path
          d="M15 14.3C15.9283 14.3 16.8185 13.9313 17.4749 13.2749C18.1313 12.6185 18.5 11.7283 18.5 10.8C18.5 9.87179 18.1313 8.98155 17.4749 8.32518C16.8185 7.6688 15.9283 7.30005 15 7.30005C14.0717 7.30005 13.1815 7.6688 12.5251 8.32518C11.8687 8.98155 11.5 9.87179 11.5 10.8C11.5 11.7283 11.8687 12.6185 12.5251 13.2749C13.1815 13.9313 14.0717 14.3 15 14.3Z"
          stroke="white" stroke-width="2" stroke-linejoin="round" />
        <path
          d="M5.21539 25.0324C5.45619 21.3847 8.49139 18.5 12.2 18.5H17.8C21.5037 18.5 24.5361 21.377 24.7839 25.0177"
          stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <div class="status online">
      </div>
    </div>

    <section class="message">
      <h2>
      ${message.client == ioServer.id ? "Ik" : message.username}
      </h2>

      <p>
        ${message.message}
      </p>
      <div class="date-time">
        ${day}-${month}-${year} ${time}
      </div>
    </section>

  </li>
    `
  )

  messages.scrollTop = messages.scrollHeight
}

/**
 * When emoji button is pressed it adds to input text for message
 */

emojis.forEach(emoji => {
  emoji.addEventListener('click', () => {
    messageInput.value = messageInput.value + emoji.innerHTML.toString();
  })
})

openChatButton.addEventListener('click', () => {
  openChatButton.classList.toggle('appear')
  openChatButton.classList.toggle('disappear')

  chatroom.classList.toggle('appear')
  chatroom.classList.toggle('disappear')
})

closeChatButton.addEventListener('click', () => {
  openChatButton.classList.toggle('appear')
  openChatButton.classList.toggle('disappear')

  chatroom.classList.toggle('appear')
  chatroom.classList.toggle('disappear')
})
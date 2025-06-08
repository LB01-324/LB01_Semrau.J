(async () => {
  const myUser = await generateRandomUser();
  let activeUsers = [];
  let typingUsers = [];

  const socket = new WebSocket(generateBackendUrl());
  socket.addEventListener('open', () => {
    console.log('WebSocket connected!');
    socket.send(JSON.stringify({ type: 'newUser', user: myUser }));
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    console.log('WebSocket message:', message);
    switch (message.type) {
      case 'message':
        const messageElement = generateMessage(message, myUser);
        document.getElementById('messages').appendChild(messageElement);
        setTimeout(() => {
          messageElement.classList.add('opacity-100');
        }, 100);
        break;
      case 'activeUsers':
        activeUsers = message.users;
        break;
      case 'typing':
        typingUsers = message.users;
        updateTypingIndicator();
        break;
      default:
        break;
    }
  });
  socket.addEventListener('close', (event) => {
    console.log('WebSocket closed.');
  });
  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });

  // Wait until the DOM is loaded before adding event listeners
  document.addEventListener('DOMContentLoaded', (event) => {
    // Send a message when the send button is clicked
    document.getElementById('sendButton').addEventListener('click', () => {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    });

    // Initialize the typing indicator
    updateTypingIndicator();
  });

  document.addEventListener('keydown', (event) => {
    // Only send if the typed in key is not a modifier key
    if (event.key.length === 1) {
      socket.send(JSON.stringify({ type: 'typing', user: myUser }));
    }
    // Only send if the typed in key is the enter key
    if (event.key === 'Enter') {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    }
  });

  // Function to update the typing indicator in the UI
  function updateTypingIndicator() {
    // Get the typing indicator element or create it if it doesn't exist
    let typingIndicator = document.getElementById('typingIndicator');
    if (!typingIndicator) {
      typingIndicator = document.createElement('div');
      typingIndicator.id = 'typingIndicator';
      typingIndicator.className = 'text-sm text-gray-400 italic px-4 py-2 transition-opacity duration-300 opacity-0';

      // Insert the typing indicator before the input area
      const messagesContainer = document.getElementById('messages');
      messagesContainer.parentNode.insertBefore(typingIndicator, messagesContainer.nextSibling);
    }

    // Filter out the current user from typing users
    const otherTypingUsers = typingUsers.filter(user => user.id !== myUser.id);

    // Check if any other user is typing (excluding the current user)
    if (otherTypingUsers.length === 0) {
      // No other users are typing, hide the indicator
      typingIndicator.textContent = '';
      typingIndicator.classList.remove('opacity-100');
      typingIndicator.classList.add('opacity-0');
    } else if (otherTypingUsers.length === 1) {
      // One other user is typing
      typingIndicator.textContent = `${otherTypingUsers[0].name} is typing...`;
      typingIndicator.classList.remove('opacity-0');
      typingIndicator.classList.add('opacity-100');
    } else {
      // Multiple other users are typing
      typingIndicator.textContent = 'Someone is typing...';
      typingIndicator.classList.remove('opacity-0');
      typingIndicator.classList.add('opacity-100');
    }
  }
})();

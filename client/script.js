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
        updateActiveUsersList();
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
  document.addEventListener('DOMContentLoaded', () => {
    // Send a message when the send button is clicked
    document.getElementById('sendButton').addEventListener('click', () => {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    });

    // Initialize the typing indicator and active users list
    updateTypingIndicator();
    updateActiveUsersList();
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

  // Function to update the active users list in the UI
  function updateActiveUsersList() {
    const activeUsersList = document.getElementById('activeUsersList');
    if (!activeUsersList) return;

    // Clear the current list
    activeUsersList.innerHTML = '';

    // Add each active user to the list
    activeUsers.forEach(user => {
      const userElement = document.createElement('div');
      userElement.className = 'flex items-center bg-gray-800 rounded-lg px-3 py-2 mb-2 transition-all duration-300 hover:bg-gray-700 shadow-md';

      // Add animation for new elements
      userElement.style.opacity = '0';
      userElement.style.transform = 'translateX(10px)';

      // Highlight the current user
      if (user.id === myUser.id) {
        userElement.className += ' border-l-4 border-green-500';
      }

      // Create avatar
      const avatar = document.createElement('img');
      avatar.src = `https://i.pravatar.cc/40?u=${user.id}`;
      avatar.alt = user.name;
      avatar.className = 'w-8 h-8 rounded-full mr-2';

      // Create name element with status in a column layout
      const userInfoContainer = document.createElement('div');
      userInfoContainer.className = 'flex flex-col flex-grow';

      const nameElement = document.createElement('span');
      nameElement.className = 'text-sm font-medium text-white';

      if (user.id === myUser.id) {
        nameElement.textContent = `${user.name} (You)`;
        nameElement.className += ' text-green-300';
      } else {
        nameElement.textContent = user.name;
      }

      // Add status indicator with text
      const statusContainer = document.createElement('div');
      statusContainer.className = 'flex items-center mt-1';

      const statusIndicator = document.createElement('span');
      statusIndicator.className = 'w-2 h-2 rounded-full mr-1 bg-green-500';

      const statusText = document.createElement('span');
      statusText.className = 'text-xs text-gray-400';
      statusText.textContent = 'Online';

      // Assemble the user element
      statusContainer.appendChild(statusIndicator);
      statusContainer.appendChild(statusText);
      userInfoContainer.appendChild(nameElement);
      userInfoContainer.appendChild(statusContainer);

      userElement.appendChild(avatar);
      userElement.appendChild(userInfoContainer);
      activeUsersList.appendChild(userElement);

      // Trigger animation after a small delay
      setTimeout(() => {
        userElement.style.opacity = '1';
        userElement.style.transform = 'translateX(0)';
      }, 50 * activeUsers.indexOf(user));
    });
  }
})();

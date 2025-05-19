document.getElementById('magicBtn').addEventListener('click', () => {
  const messages = ['You are awesome!', 'Coding is sexy 😏', 'Keep clicking...', 'You got this!'];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  document.getElementById('message').textContent = msg;
});
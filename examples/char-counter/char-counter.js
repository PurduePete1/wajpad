const inputBox = document.getElementById('inputBox');
const counter = document.getElementById('counter');

inputBox.addEventListener('input', () => {
  const len = inputBox.value.length;
  counter.textContent = `${len} character${len !== 1 ? 's' : ''}`;
});
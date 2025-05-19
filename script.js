import { injectVirtualFiles } from './injector.js';

const preview = document.getElementById('preview');
const themeToggle = document.getElementById('themeToggle');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const increaseFont = document.getElementById('increaseFont');
const decreaseFont = document.getElementById('decreaseFont');
const fileTabs = document.querySelectorAll('#file-tabs button');

let currentFile = 'html';
let fontSize = 14;

// Virtual files
let files = {
    html: `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
  </head>
  <body>
  
    <h1>Welcome to WajPad!</h1>
    <p>Edit HTML, CSS, and JS using the tabs on the left!</p>
  
  </body>
  </html>`,
  
    css: `
  body {
    background: #f2f2f2;
  }`,
  
    js: `// JS goes here
  console.log("WajPad is ready to spice up your code!");`
  };

// Initialize Ace
const editor = ace.edit("editor");

editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
    wrap: true // ← THIS IS THE MAGIC
  });

const themeSelector = document.getElementById('themeSelector');
const savedTheme = localStorage.getItem("wajpadTheme") || "tomorrow_night_bright";
themeSelector.value = savedTheme;

editor.setTheme("ace/theme/" + savedTheme);
  
  themeSelector.addEventListener("change", (e) => {
    const selectedTheme = e.target.value;
    editor.setTheme("ace/theme/" + selectedTheme);
    localStorage.setItem("wajpadTheme", selectedTheme);
  
    // Apply matching color to the dropdown
    themeSelector.style.backgroundColor = themeColors[selectedTheme];
    themeSelector.classList.add("glow-ring");
    setTimeout(() => {
      themeSelector.classList.remove("glow-ring");
    }, 600);
  });

// Editor config
const modeMap = {
    html: "ace/mode/html",
    css: "ace/mode/css",
    js: "ace/mode/javascript"
};
  
editor.session.setMode(modeMap[currentFile]);
editor.setFontSize(fontSize);
editor.setValue(files[currentFile], 1); // assumes files and currentFile already exist

// Enable autocompletion and snippets
editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true
  });


// Live preview build
function updatePreview() {
    const html = injectVirtualFiles(files.html, files.css, files.js);
    preview.srcdoc = html;
  
    // Wait for iframe to load, then inject the console override
    preview.onload = () => {
      preview.contentWindow.console.log = (...args) => {
        window.postMessage({ type: 'wajpad-log', logType: 'log', args }, '*');
      };
      preview.contentWindow.console.error = (...args) => {
        window.postMessage({ type: 'wajpad-log', logType: 'error', args }, '*');
      };
      preview.contentWindow.console.warn = (...args) => {
        window.postMessage({ type: 'wajpad-log', logType: 'warn', args }, '*');
      };
    };
  
    // Reset the console output
    const consoleOutput = document.getElementById('console-output');
    consoleOutput.textContent = '';
  }
  

// Tab switching
fileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Save current editor content before switching
      files[currentFile] = editor.getValue();
  
      // Update current file key
      currentFile = tab.dataset.file;
      document.getElementById('modeDisplay').innerText = currentFile.toUpperCase();
  
      // Highlight the active tab
      fileTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
  
      // Update editor mode & content
      const mode = modeMap[currentFile] || "ace/mode/text"; // fallback to plain text
      editor.session.setMode(mode);
      editor.setValue(files[currentFile], 1); // 1 = move cursor to top
  
      // Refresh live preview
      updatePreview();
    });
  });
  

// Live preview update on change
editor.session.on('change', () => {
  files[currentFile] = editor.getValue();
  updatePreview();
});

// Initial preview
updatePreview();

// Dark mode
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// Reset button
resetBtn.addEventListener('click', () => {
  if (confirm("Reset all files to starter code?")) {
    files.html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
  </head>
  <body>
  
    <h1>Welcome to WajPad!</h1>
    <p>Edit HTML, CSS, and JS using the tabs on the left!</p>
  
  </body>
  </html>`;
    files.css = `/* CSS goes here */
body {
  font-family: Arial, sans-serif;
  padding: 20px;
  background: #f2f2f2;
}`;
    files.js = `// JS goes here
console.log("WajPad loaded!");`;

    editor.setValue(files[currentFile], 1);
    updatePreview();
  }
});

// Font resizing
function updateEditorFont() {
  editor.setFontSize(fontSize);
}

increaseFont.addEventListener('click', () => {
  fontSize += 1;
  updateEditorFont();
});

decreaseFont.addEventListener('click', () => {
  if (fontSize > 8) {
    fontSize -= 1;
    updateEditorFont();
  }
});

// Download full HTML
downloadBtn.addEventListener('click', () => {
  const html = files.html;
  const css = `<style>${files.css}</style>`;
  const js = `<script>${files.js}<\/script>`;
  const combined = `<!DOCTYPE html><html><head>${css}</head><body>${html}${js}</body></html>`;

  const blob = new Blob([combined], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wajpad_project.html";
  a.click();
  URL.revokeObjectURL(url);
});

// Resizer logic
const resizer = document.getElementById('resizer');
let isDragging = false;

resizer.addEventListener('mousedown', function (e) {
  e.preventDefault(); // Prevent text selection
  isDragging = true;
  document.body.style.cursor = 'col-resize'; // Give user feedback
});

document.addEventListener('mousemove', function (e) {
  if (!isDragging) return;

  const container = document.querySelector('main');
  const tabs = document.getElementById('file-tabs');
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');

  const offsetLeft = tabs.offsetWidth;
  const newEditorWidth = e.clientX - offsetLeft;

  const minEditorWidth = 150;
  const maxEditorWidth = container.offsetWidth - 200;

  if (newEditorWidth > minEditorWidth && newEditorWidth < maxEditorWidth) {
    editor.style.width = `${newEditorWidth}px`;
    preview.style.width = `${container.offsetWidth - newEditorWidth - resizer.offsetWidth - offsetLeft}px`;
  }
});

window.addEventListener('message', (event) => {
    if (event.data.type === 'wajpad-log') {
      const output = document.getElementById('console-output');
      const tag = {
        log: '',
        warn: '[Warning] ',
        error: '[Error] '
      }[event.data.logType];
  
      output.textContent += tag + event.data.args.join(' ') + '\n';
      output.scrollTop = output.scrollHeight;
    }
  });  

document.addEventListener('mouseup', function () {
  if (isDragging) {
    isDragging = false;
    document.body.style.cursor = ''; // Reset cursor to default
  }
});

document.addEventListener('mouseup', function () {
  isDragging = false;
});

import { injectVirtualFiles } from './injector.js';

document.addEventListener('DOMContentLoaded', () => {
  const preview = document.getElementById('preview');
  const themeToggle = document.getElementById('themeToggle');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const increaseFont = document.getElementById('increaseFont');
  const decreaseFont = document.getElementById('decreaseFont');
  const fileTabs = document.querySelectorAll('#file-tabs button');
  const themeSelector = document.getElementById('themeSelector');

  let currentFile = 'html';
  let fontSize = 14;

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

  const editor = ace.edit("editor");

  editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true,
    wrap: true
  });

  const modeMap = {
    html: "ace/mode/html",
    css: "ace/mode/css",
    js: "ace/mode/javascript"
  };

  const savedTheme = localStorage.getItem("wajpadTheme") || "tomorrow_night_bright";
  themeSelector.value = savedTheme;
  editor.setTheme("ace/theme/" + savedTheme);

  themeSelector.addEventListener("change", (e) => {
    const selectedTheme = e.target.value;
    editor.setTheme("ace/theme/" + selectedTheme);
    localStorage.setItem("wajpadTheme", selectedTheme);
    themeSelector.classList.add("glow-ring");
    setTimeout(() => themeSelector.classList.remove("glow-ring"), 600);
  });

  editor.session.setMode(modeMap[currentFile]);
  editor.setFontSize(fontSize);
  editor.setValue(files[currentFile], 1);

  function updatePreview() {
    const html = injectVirtualFiles(files.html, files.css, files.js);
    preview.srcdoc = html;

    preview.onload = () => {
      preview.contentWindow.console.log = (...args) =>
        window.postMessage({ type: 'wajpad-log', logType: 'log', args }, '*');
      preview.contentWindow.console.error = (...args) =>
        window.postMessage({ type: 'wajpad-log', logType: 'error', args }, '*');
      preview.contentWindow.console.warn = (...args) =>
        window.postMessage({ type: 'wajpad-log', logType: 'warn', args }, '*');
    };

    const consoleOutput = document.getElementById('console-output');
    consoleOutput.textContent = '';
  }

  fileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      files[currentFile] = editor.getValue();
      currentFile = tab.dataset.file;
      document.getElementById('modeDisplay').innerText = currentFile.toUpperCase();
      fileTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      editor.session.setMode(modeMap[currentFile] || "ace/mode/text");
      editor.setValue(files[currentFile], 1);
      updatePreview();
    });
  });

  editor.session.on('change', () => {
    files[currentFile] = editor.getValue();
    updatePreview();
  });

  updatePreview();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
    });
  }

  resetBtn.addEventListener('click', () => {
    if (confirm("Reset all files to starter code?")) {
      files.html = files.html;
      files.css = files.css;
      files.js = files.js;
      editor.setValue(files[currentFile], 1);
      updatePreview();
    }
  });

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

  const resizer = document.getElementById('resizer');
  let isDragging = false;

  resizer.addEventListener('mousedown', function (e) {
    e.preventDefault();
    isDragging = true;
    document.body.style.cursor = 'col-resize';
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
      document.body.style.cursor = '';
    }
  });
});

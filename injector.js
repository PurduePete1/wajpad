export function injectVirtualFiles(html, css, js) {
    // Replace stylesheet link with actual style block
    html = html.replace(
      /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']\s*\/?>/i,
      `<style>${css}</style>`
    );
  
    // Replace script tag with actual JS block
    html = html.replace(
      /<script\s+src=["']script\.js["']\s*>\s*<\/script>/i,
      `<script>${js}<\/script>`
    );
  
    return html;
  }
  
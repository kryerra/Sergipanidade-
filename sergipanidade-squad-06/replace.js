const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColors(fullPath);
    } else if (fullPath.match(/\.(tsx|ts|css|html)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content
        .replace(/#E05C00/ig, '#000080')
        .replace(/224,\s*92,\s*0/g, '0,0,128')
        .replace(/235,\s*94,\s*40/g, '0,0,128')
        .replace(/255,\s*92,\s*0/g, '0,0,128')
        .replace(/#FF5C00/ig, '#000080')
        .replace(/#C25200/ig, '#000060');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

replaceColors('./src');

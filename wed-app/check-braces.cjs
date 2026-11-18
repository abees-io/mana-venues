const fs = require('fs')
const src = fs.readFileSync('src/pages/PackagesPage.tsx', 'utf8')
let open = 0, close = 0
for (const ch of src) {
  if (ch === '{') open++
  if (ch === '}') close++
}
console.log('Open {:', open, 'Close }:', close, 'Diff:', open - close)

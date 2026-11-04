import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/(.:)/, '$1'))
const files = ['index.html', 'styles.css', 'oauth.css', 'app.js', 'README.txt', 'package.json']
const forbidden = [/service[_-]?role/i,/sb_secret_/i,/eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/,/github_pat_/i,/ghp_[a-zA-Z0-9]{20,}/]
const hits = []
for (const file of files) { const text = fs.readFileSync(path.join(root, file), 'utf8'); for (const pattern of forbidden) if (pattern.test(text)) hits.push(`${file}: ${pattern}`) }
if (hits.length) { console.error(hits.join('\n')); process.exit(1) }
console.log(`Secret scan passed (${files.length} public files)`)

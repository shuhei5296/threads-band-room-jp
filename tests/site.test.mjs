import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const script = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8')
function loadHelpers() {
  const noop = () => {}
  const elements = new Map(['lookupForm','threadsUsername','lookupButton','lookupResult','copyBtn','copyMsg'].map(id => [id, { addEventListener: noop }]))
  const context = { window: { setTimeout: noop }, document: { getElementById: id => elements.get(id) }, navigator: {}, fetch: noop }
  vm.runInNewContext(script, context)
  return context.window.RoomLookup
}
test('Jitsiは埋め込みではなく同じ直接リンクを使う', () => { assert.doesNotMatch(html, /<iframe|external_api\.js/i); assert.match(html, /https:\/\/meet\.jit\.si\/ThreadsSuisougakubu2026Room/) })
test('登録確認を本人認証と表示しない', () => { assert.match(html, /この確認は本人認証ではありません/); assert.match(html, /第三者が在籍を推測する可能性/); assert.match(html, /ゲスト参加できます/) })
test('ユーザー名を正規化する', () => { const room = loadHelpers(); assert.equal(room.normalizeUsername('  ＠Shu.Hei_5296  '), 'shu.hei_5296'); assert.equal(room.normalizeUsername('@@ABC'), 'abc') })
test('ユーザー名形式を検証する', () => { const room = loadHelpers(); assert.equal(room.isValidUsername('@valid_name.1'), true); assert.equal(room.isValidUsername('bad-name'), false); assert.equal(room.isValidUsername(''), false) })
test('照合先とJitsi会議室が固定されている', () => { const room = loadHelpers(); assert.equal(room.lookupEndpoint, 'https://adofdnxbraakxynvclzd.supabase.co/functions/v1/threads-room-member-lookup'); assert.match(room.joinUrl, /ThreadsSuisougakubu2026Room/) })

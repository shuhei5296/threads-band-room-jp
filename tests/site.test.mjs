import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const script = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8')
function loadHelpers() {
  const noop = () => {}
  const elements = new Map(['lookupForm','threadsUsername','lookupButton','lookupResult','copyBtn','copyMsg','oauthButton','participantName','verifiedNamePanel','verifiedDisplayName','copyNameBtn','copyNameMsg'].map(id => [id, { addEventListener: noop, textContent: '', value: '', hidden: true, disabled: false, focus: noop }]))
  const context = { window: { setTimeout: noop }, document: { getElementById: id => elements.get(id) }, navigator: {}, fetch: noop }
  vm.runInNewContext(script, context)
  return context.window.RoomLookup
}
test('Jitsiは埋め込みではなく同じ直接リンクを使う', () => { assert.doesNotMatch(html, /<iframe|external_api\.js/i); assert.match(html, /https:\/\/meet\.jit\.si\/ThreadsSuisougakubu2026Room/) })
test('登録確認を本人認証と表示しない', () => { assert.match(html, /この確認は本人認証ではありません/); assert.match(html, /第三者が在籍を推測する可能性/); assert.match(html, /ゲスト参加できます/) })
test('ユーザー名を正規化する', () => { const room = loadHelpers(); assert.equal(room.normalizeUsername('  ＠Shu.Hei_5296  '), 'shu.hei_5296'); assert.equal(room.normalizeUsername('@@ABC'), 'abc') })
test('ユーザー名形式を検証する', () => { const room = loadHelpers(); assert.equal(room.isValidUsername('@valid_name.1'), true); assert.equal(room.isValidUsername('bad-name'), false); assert.equal(room.isValidUsername(''), false) })
test('照合先とJitsi会議室が固定されている', () => { const room = loadHelpers(); assert.equal(room.lookupEndpoint, 'https://adofdnxbraakxynvclzd.supabase.co/functions/v1/threads-room-member-lookup'); assert.match(room.joinUrl, /ThreadsSuisougakubu2026Room/) })
test('OAuthは外部承認まで無効', () => { const room = loadHelpers(); assert.equal(room.oauthEnabled, false); assert.match(html, /Threadsで本人確認（準備中）/); assert.match(html, /入力だけで名簿の表示名を返すことはありません/) })
test('本人確認済み表示名を安全に整える', () => { const room = loadHelpers(); assert.equal(room.sanitizeDisplayName('  \u0000山田　太郎  '), '山田 太郎'); assert.equal(room.sanitizeDisplayName('a'.repeat(90)).length, 80) })
test('表示名が空なら認証済みユーザー名へフォールバックする', () => { const room = loadHelpers(); assert.equal(room.chooseVerifiedDisplayName('', '＠Shu.Hei_5296'), '@shu.hei_5296'); assert.equal(room.chooseVerifiedDisplayName('奏者A', 'user'), '奏者A') })
test('表示名をJitsi URLへ含めない', () => { const room = loadHelpers(); assert.doesNotMatch(room.joinUrl, /displayName|userInfo|name=/i); assert.match(html, /表示名をコピー/); assert.match(html, /入室後もJitsi側で変更できます/) })
test('Threads IDを参加表示名の初期値にできる', () => { const room = loadHelpers(); assert.equal(room.initialDisplayName('＠Shu.Hei_5296'), '@shu.hei_5296'); assert.equal(room.initialDisplayName(''), '') })
test('表示名は自由編集・コピーしてJitsiへ直接参加する', () => { assert.match(html, /id="participantName"/); assert.match(html, /名前をコピー/); assert.match(html, /オンライン部室に入る/); assert.doesNotMatch(html, /<iframe/i) })
test('登録ありでも本人認証と誤表示しない', () => { const rendered = loadHelpers().messageForStatus('registered'); assert.equal(rendered.kind, 'registered'); assert.match(rendered.message, /本人認証ではありません/) })
test('未登録でもゲスト参加できる', () => { const rendered = loadHelpers().messageForStatus('unregistered'); assert.equal(rendered.kind, 'unregistered'); assert.match(rendered.message, /ゲストとして/) })
test('API障害でもゲスト参加できる', () => { const rendered = loadHelpers().messageForStatus('unavailable'); assert.equal(rendered.kind, 'unavailable'); assert.match(rendered.message, /ゲストとして/) })

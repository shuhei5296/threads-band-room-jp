(function () {
  'use strict'
  const LOOKUP_ENDPOINT = 'https://adofdnxbraakxynvclzd.supabase.co/functions/v1/threads-room-member-lookup'
  const JOIN_URL = 'https://meet.jit.si/ThreadsSuisougakubu2026Room#config.startWithAudioMuted=true&config.startWithVideoMuted=true&config.defaultLanguage=ja'
  const CLIENT_COOLDOWN_MS = 8000
  const form = document.getElementById('lookupForm')
  const input = document.getElementById('threadsUsername')
  const button = document.getElementById('lookupButton')
  const result = document.getElementById('lookupResult')
  const copyButton = document.getElementById('copyBtn')
  const copyMessage = document.getElementById('copyMsg')
  function normalizeUsername(value) { return String(value || '').normalize('NFKC').trim().replace(/^@+/, '').toLowerCase() }
  function isValidUsername(value) { return /^[a-z0-9._]{1,30}$/.test(normalizeUsername(value)) }
  function showResult(kind, message) { result.hidden = false; result.className = `lookup-result ${kind}`; result.textContent = message }
  async function lookup(username) {
    const response = await fetch(LOOKUP_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }), cache: 'no-store' })
    if (!response.ok) return { status: 'unavailable' }
    const data = await response.json()
    return data && typeof data.status === 'string' ? data : { status: 'unavailable' }
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const username = normalizeUsername(input.value)
    input.value = username ? `@${username}` : ''
    if (!isValidUsername(username)) { showResult('invalid', 'ユーザー名を確認してください。英数字・ピリオド・アンダースコアを30文字以内で入力できます。'); return }
    button.disabled = true; button.textContent = '確認中…'
    try {
      const data = await lookup(username)
      if (data.status === 'registered') showResult('registered', '登録あり：同じThreadsユーザー名が名簿にあります。これは本人認証ではありません。')
      else if (data.status === 'unregistered') showResult('unregistered', '未登録：同じユーザー名は見つかりませんでした。ゲストとして部室に参加できます。')
      else showResult('unavailable', '現在は登録状況を確認できません。ゲストとして部室に参加できます。')
    } catch (_) { showResult('unavailable', '照合APIに接続できませんでした。ゲストとして部室に参加できます。') }
    finally { window.setTimeout(() => { button.disabled = false; button.textContent = '登録を確認' }, CLIENT_COOLDOWN_MS) }
  })
  copyButton.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(JOIN_URL); copyMessage.textContent = 'コピーしました！' }
    catch (_) { copyMessage.textContent = 'コピーできない場合は参加ボタンを長押ししてください。' }
  })
  window.RoomLookup = { normalizeUsername, isValidUsername, lookupEndpoint: LOOKUP_ENDPOINT, joinUrl: JOIN_URL }
})()

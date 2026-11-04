(function () {
  'use strict'
  const LOOKUP_ENDPOINT = 'https://adofdnxbraakxynvclzd.supabase.co/functions/v1/threads-room-member-lookup'
  const JOIN_URL = 'https://meet.jit.si/ThreadsSuisougakubu2026Room#config.startWithAudioMuted=true&config.startWithVideoMuted=true&config.defaultLanguage=ja'
  const CLIENT_COOLDOWN_MS = 8000
  const OAUTH_ENABLED = false
  const form = document.getElementById('lookupForm')
  const input = document.getElementById('threadsUsername')
  const button = document.getElementById('lookupButton')
  const result = document.getElementById('lookupResult')
  const copyButton = document.getElementById('copyBtn')
  const copyMessage = document.getElementById('copyMsg')
  const oauthButton = document.getElementById('oauthButton')
  const participantName = document.getElementById('participantName')
  const verifiedNamePanel = document.getElementById('verifiedNamePanel')
  const verifiedDisplayName = document.getElementById('verifiedDisplayName')
  const copyNameButton = document.getElementById('copyNameBtn')
  const copyNameMessage = document.getElementById('copyNameMsg')
  function normalizeUsername(value) { return String(value || '').normalize('NFKC').trim().replace(/^@+/, '').toLowerCase() }
  function isValidUsername(value) { return /^[a-z0-9._]{1,30}$/.test(normalizeUsername(value)) }
  function sanitizeDisplayName(value) {
    return Array.from(String(value || '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, '').trim()).slice(0, 80).join('')
  }
  function chooseVerifiedDisplayName(displayName, username) {
    const safeName = sanitizeDisplayName(displayName)
    if (safeName) return safeName
    const safeUsername = normalizeUsername(username)
    return safeUsername ? `@${safeUsername}` : ''
  }
  function initialDisplayName(username) {
    const safeUsername = normalizeUsername(username)
    return safeUsername ? `@${safeUsername}` : ''
  }
  function showVerifiedName(displayName, username) {
    const selected = chooseVerifiedDisplayName(displayName, username)
    if (!selected) return false
    verifiedDisplayName.textContent = selected
    verifiedNamePanel.hidden = false
    return true
  }
  function showResult(kind, message) { result.hidden = false; result.className = `lookup-result ${kind}`; result.textContent = message }
  function messageForStatus(status) {
    if (status === 'registered') return { kind: 'registered', message: '登録あり：同じThreadsユーザー名が名簿にあります。これは本人認証ではありません。' }
    if (status === 'unregistered') return { kind: 'unregistered', message: '未登録：同じユーザー名は見つかりませんでした。ゲストとして部室に参加できます。' }
    return { kind: 'unavailable', message: '現在は登録状況を確認できません。ゲストとして部室に参加できます。' }
  }
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
    participantName.value = initialDisplayName(username)
    button.disabled = true; button.textContent = '確認中…'
    try {
      const data = await lookup(username)
      const rendered = messageForStatus(data.status)
      showResult(rendered.kind, rendered.message)
    } catch (_) { showResult('unavailable', '照合APIに接続できませんでした。ゲストとして部室に参加できます。') }
    finally { window.setTimeout(() => { button.disabled = false; button.textContent = '登録を確認' }, CLIENT_COOLDOWN_MS) }
  })
  copyButton.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(JOIN_URL); copyMessage.textContent = 'コピーしました！' }
    catch (_) { copyMessage.textContent = 'コピーできない場合は参加ボタンを長押ししてください。' }
  })
  copyNameButton.addEventListener('click', async () => {
    const name = sanitizeDisplayName(participantName.value)
    participantName.value = name
    if (!name) { copyNameMessage.textContent = 'コピーする表示名を入力してください。'; participantName.focus(); return }
    try { await navigator.clipboard.writeText(name); copyNameMessage.textContent = '表示名をコピーしました！' }
    catch (_) { copyNameMessage.textContent = 'コピーできない場合は表示名を長押ししてください。' }
  })
  oauthButton.disabled = !OAUTH_ENABLED
  window.RoomLookup = { normalizeUsername, isValidUsername, sanitizeDisplayName, initialDisplayName, messageForStatus, chooseVerifiedDisplayName, showVerifiedName, oauthEnabled: OAUTH_ENABLED, lookupEndpoint: LOOKUP_ENDPOINT, joinUrl: JOIN_URL }
})()

# Ver.2.1 Threads OAuth（本番未反映）

## 現在の停止条件

- Metaアプリは開発モードで、一般部員は認証できない。
- OAuthリダイレクトURIは未登録。
- `threads_basic` の許可用途には消費者アプリでの利用禁止が明記されているため、オンライン部室の本人確認用途が許可されるかMetaへ確認・審査が必要。
- 既存名簿はユーザー名を保持するが、Threadsの数値ユーザーIDとの検証済み対応表を持たない。

## 承認後のサーバー構成

1. 公開ページから専用Edge Functionの `/start` を開く。
2. Edge Functionが暗号学的に安全なstateを発行し、短時間・HttpOnly・Secure・SameSite=LaxのCookieへ保存する。
3. Metaの認可画面では必要最小限の `threads_basic` のみ要求する。
4. `/callback` でstateを照合し、認可コードをサーバー側で交換する。App Secretとアクセストークンはブラウザへ返さない。
5. 認証されたThreads数値IDを専用の非公開対応表で名簿1件に結び付ける。既存443名の名簿は変更しない。
6. 本人セッションに対してだけ表示名、または空欄時の `@username` を返す。
7. 表示名はコピーしてJitsiへ手動貼り付けする。Jitsi URLへ表示名を入れない。

## 必要な別途承認

- Metaへの用途確認、必要なApp Review、アプリ公開。
- 正式なOAuthリダイレクトURIの登録。
- App ID / App SecretのSupabase Secretsへの保存。
- 数値Threads IDを保持する専用・非公開の対応表とRLSの追加。
- Edge Functionの本番デプロイとGitHub Pagesへの公開。

## プライバシー原則

- 未認証のユーザー名照合から表示名を返さない。
- 他の部員の表示名、内部ID、メール、楽器、管理メモ、訂正履歴を返さない。
- アクセストークン、認可コード、state、App Secretをログへ出さない。
- OAuth失敗・API停止時もゲスト参加を維持する。

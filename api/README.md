# Evaluations API (Lambda + S3)

評価データを S3 上の単一 JSON (`evaluations.json`) に、ユーザーデータを `users.json` に保存する Lambda Function URL。

## 構成

- `template.yaml` — SAM テンプレート。S3 バケット + Lambda + Function URL
- `src/index.mjs` — ハンドラ。AWS SDK v3 は Node.js 22 ランタイム同梱のものを使用（依存インストール不要）

## エンドポイント

すべて `x-api-key: <ApiKey>` ヘッダ必須。

| メソッド | パス                | 内容                            |
| -------- | ------------------- | ------------------------------- |
| GET      | `/evaluations`      | 全件取得 `{ evaluations: [] }`  |
| GET      | `/evaluations/{id}` | 1件取得 `{ evaluation: {...} }` |
| PUT      | `/evaluations/{id}` | 追加・更新（body は評価1件）    |
| DELETE   | `/evaluations/{id}` | 削除（紐づく画像も削除）        |
| GET      | `/evaluations/{id}/images/{imageId}` | 画像1枚取得（バイナリ） |
| PUT      | `/evaluations/{id}/images/{imageId}` | 画像1枚登録（body は画像バイナリ、`content-type: image/jpeg\|png\|webp`、最大4MB） |
| DELETE   | `/evaluations/{id}/images/{imageId}` | 画像1枚削除             |
| GET      | `/users`             | 全件取得 `{ users: [] }`        |
| GET      | `/users/{id}`        | 1件取得 `{ user: {...} }`       |
| PUT      | `/users/{id}`        | 追加・更新（body は `{ id, name }`）|
| DELETE   | `/users/{id}`        | 削除                            |

同時書き込みは S3 の条件付き書き込み（`IfMatch` / `IfNoneMatch`）で検出し、最大5回リトライする。

## パラメータ

| 名前            | 説明                                                        |
| --------------- | ----------------------------------------------------------- |
| `ApiKey`        | クライアントが `x-api-key` ヘッダで送る共有シークレット     |
| `AllowedOrigin` | CORS で許可するオリジン（例: `https://aromabit.github.io`） |

## 環境変数（Lambda）

| 名前          | 既定値              | 説明                      |
| ------------- | ------------------- | ------------------------- |
| `BUCKET_NAME`       | スタックが自動設定  | データ保存先バケット           |
| `OBJECT_KEY`        | `evaluations.json`  | 評価データのオブジェクトキー   |
| `USERS_OBJECT_KEY`  | `users.json`         | ユーザーデータのオブジェクトキー |
| `API_KEY`           | `ApiKey` パラメータ | 空の場合すべて 401 を返す      |

## デプロイ

手順・運用・トラブルシュートは [`../DEPLOY.md`](../DEPLOY.md) を参照。

```sh
cd api
sam deploy   # 初回は DEPLOY.md の --guided 手順から
```

## 注意

- API キーは静的ビルドに埋め込まれるため、公開ページでは簡易的な抑止にしかならない。厳密な保護が必要なら Cognito などの認証に切り替える。
- `AllowedOrigin` を `*` のままにしない。
- 画像は `imageId`（UUID）ごとに S3 `images/{evaluationId}/{imageId}` へ保存する。評価1件につき最大3枚（`evaluation.imageIds` で管理）。評価本体との整合はクライアント側の責務で、画像PUT時にサーバ側で評価の存在確認はしない。

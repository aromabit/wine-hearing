# Evaluations API (Lambda + S3)

評価データを S3 上の単一 JSON (`evaluations.json`) に保存する Lambda Function URL。

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
| DELETE   | `/evaluations/{id}` | 削除                            |

同時書き込みは S3 の条件付き書き込み（`IfMatch` / `IfNoneMatch`）で検出し、最大5回リトライする。

## デプロイ

```sh
cd api
sam deploy --guided \
  --stack-name wine-hearing-api \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    ApiKey=<32文字程度のランダム文字列> \
    AllowedOrigin=https://<user>.github.io
```

出力の `ApiUrl` をフロント側の環境変数に設定する。

```sh
# .env.local
NEXT_PUBLIC_EVALUATIONS_API_URL=https://xxxxx.lambda-url.ap-northeast-1.on.aws
NEXT_PUBLIC_EVALUATIONS_API_KEY=<ApiKey と同じ値>
```

GitHub Pages 側は、リポジトリの Variables に `EVALUATIONS_API_URL`、Secrets に `EVALUATIONS_API_KEY` を登録すればデプロイワークフローがビルド時に埋め込む。

## 注意

- API キーは静的ビルドに埋め込まれるため、公開ページでは簡易的な抑止にしかならない。厳密な保護が必要なら Cognito などの認証に切り替える。
- `AllowedOrigin` を `*` のままにしない。

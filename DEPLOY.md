# デプロイ手順

本システムは 2 つのデプロイ対象で構成される。

| 対象           | 実体                              | デプロイ方法                          |
| -------------- | --------------------------------- | ------------------------------------- |
| フロントエンド | Next.js 静的エクスポート (`out/`) | GitHub Actions → GitHub Pages（自動） |
| バックエンド   | Lambda Function URL + S3 (`api/`) | AWS SAM CLI（手動）                   |

```
ブラウザ
  │  静的アセット
  ├─────────────▶ GitHub Pages  https://aromabit.github.io/wine-hearing/
  │
  │  fetch + x-api-key
  └─────────────▶ Lambda Function URL ──▶ S3 (evaluations.json)
```

バックエンドを先にデプロイし、その出力（Function URL）をフロントのビルド環境変数に設定する。

---

## 1. 前提

以下をインストールする。

```sh
# AWS CLI / SAM CLI (macOS)
brew install awscli aws-sam-cli

# 認証情報（デプロイ先アカウントの権限が必要）
aws configure
aws sts get-caller-identity   # 想定アカウントか確認
```

- Node.js: `.node-version` 準拠（CI は 24）
- pnpm: `package.json` の `packageManager` 準拠

必要な IAM 権限: CloudFormation / Lambda / S3 / IAM Role 作成 / CloudWatch Logs。

---

## 2. バックエンド（Lambda + S3）

### 2.1 API キーの生成

フロントのビルドに埋め込まれる共有シークレット。生成して控える。

```sh
openssl rand -hex 24
```

### 2.2 初回デプロイ

```sh
cd api
sam deploy --guided \
  --stack-name wine-hearing-api \
  --region ap-northeast-1 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    ApiKey=<2.1 で生成した値> \
    AllowedOrigin=https://aromabit.github.io
```

`--guided` の対話では以下を選ぶ。

- `Save arguments to configuration file` → **Y**（`api/samconfig.toml` が生成される）
- `EvaluationsFunction Function URL has no authentication. Is this okay?` → **y**（API キーをハンドラ側で検証するため）

`AllowedOrigin` は CORS の許可オリジン。GitHub Pages 以外から使う場合はそのオリジンを指定する。`*` にしない。

生成された `api/samconfig.toml` には `ApiKey` が平文で保存される。`.gitignore` 済みだが、コミットしないよう注意する。

### 2.3 出力の確認

```sh
aws cloudformation describe-stacks \
  --stack-name wine-hearing-api \
  --query "Stacks[0].Outputs" --output table
```

- `ApiUrl` — `NEXT_PUBLIC_EVALUATIONS_API_URL` に設定する値
- `BucketName` — `evaluations.json` を保持する S3 バケット

### 2.4 疎通確認

```sh
curl -i -H "x-api-key: <ApiKey>" "<ApiUrl>evaluations"
# → 200 {"evaluations":[]}

curl -i "<ApiUrl>evaluations"
# → 401 {"message":"unauthorized"}
```

### 2.5 2 回目以降のデプロイ

`samconfig.toml` に保存済みのため、コード変更後は以下だけでよい。

```sh
cd api
sam deploy
```

API キーやオリジンを変更する場合のみ `--parameter-overrides` を付け直す。

---

## 3. ローカル開発

```sh
cp .env.example .env.local
```

`.env.local` に 2.3 の `ApiUrl` と 2.1 の `ApiKey` を記入する。

```
NEXT_PUBLIC_EVALUATIONS_API_URL=https://xxxxx.lambda-url.ap-northeast-1.on.aws
NEXT_PUBLIC_EVALUATIONS_API_KEY=<ApiKey>
```

```sh
pnpm install
pnpm dev
```

`NEXT_PUBLIC_EVALUATIONS_API_URL` を空のままにすると API を呼ばず LocalStorage のみで動作する（サンプルデータが投入される）。オフラインでの UI 開発時はこちら。

`AllowedOrigin` に `http://localhost:3000` を含めていない場合、ローカルから API を叩くと CORS で失敗する。ローカル検証用に別スタック（例: `wine-hearing-api-dev`）を `AllowedOrigin=http://localhost:3000` で立てる。

---

## 4. フロントエンド（GitHub Pages）

### 4.1 リポジトリ設定（初回のみ）

**Settings → Pages**

- Source: **GitHub Actions**

**Settings → Secrets and variables → Actions**

- Variables タブ → `EVALUATIONS_API_URL` = 2.3 の `ApiUrl`
- Secrets タブ → `EVALUATIONS_API_KEY` = 2.1 の `ApiKey`

未設定でもビルドは通る。その場合 API を呼ばない LocalStorage 版が公開される。

### 4.2 デプロイ

`main` への push で `.github/workflows/deploy.yml` が実行され、`pnpm build` の成果物 `out/` が Pages へ公開される。手動実行は Actions タブの **Deploy to GitHub Pages → Run workflow**。

公開先: https://aromabit.github.io/wine-hearing/

環境変数はビルド時に埋め込まれるため、`EVALUATIONS_API_URL` や `EVALUATIONS_API_KEY` を変更したら **ワークフローの再実行が必要**。

### 4.3 ローカルでの本番ビルド確認

本番ビルドは `basePath=/wine-hearing` が付くため、`out/` をそのまま配信するとアセット参照がずれる。同名のサブディレクトリに置いて確認する。

```sh
pnpm build
rm -rf .preview && mkdir -p .preview && cp -r out .preview/wine-hearing
pnpm dlx serve .preview   # http://localhost:3000/wine-hearing/
```

---

## 5. 運用

### データのバックアップ・復旧

バケットはバージョニング有効。誤削除・誤上書きは過去バージョンから復旧できる。

```sh
# 現在のデータを取得
aws s3 cp s3://<BucketName>/evaluations.json ./evaluations-backup.json

# バージョン一覧
aws s3api list-object-versions --bucket <BucketName> --prefix evaluations.json

# 特定バージョンを取得
aws s3api get-object --bucket <BucketName> --key evaluations.json \
  --version-id <VersionId> ./restored.json

# 書き戻し
aws s3 cp ./restored.json s3://<BucketName>/evaluations.json
```

アプリからの JSON エクスポート（評価一覧の「JSONエクスポート」）でも同じ内容を取得できる。

### ログ

```sh
sam logs --stack-name wine-hearing-api --name EvaluationsFunction --tail
```

保持期間は 30 日（`template.yaml` の `RetentionInDays`）。

### API キーのローテーション

1. 新しいキーを生成
2. `cd api && sam deploy --parameter-overrides ApiKey=<新キー> AllowedOrigin=https://aromabit.github.io`
3. GitHub の Secret `EVALUATIONS_API_KEY` を更新
4. Deploy ワークフローを再実行

3 と 4 を行うまで公開中のページは旧キーを送るため 401 になる。切り替え中の失敗を避けたい場合はメンテナンス時間を確保する。

### スタックの削除

> **警告:** 以下のコマンドは Lambda・S3 バケット・保存済みの評価データをすべて削除します。取り消しはできません。実行前に上記のバックアップ手順で `evaluations.json` を退避してください。

```sh
sam delete --stack-name wine-hearing-api
```

バケットにオブジェクトが残っていると削除に失敗する。その場合はバケットを空にしてから再実行する。

---

## 6. トラブルシュート

| 症状                                   | 原因と対処                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ブラウザに CORS エラー                 | `AllowedOrigin` が実際のオリジンと不一致。`sam deploy --parameter-overrides AllowedOrigin=<正しいオリジン>` で更新 |
| `API 401: unauthorized`                | フロントの `NEXT_PUBLIC_EVALUATIONS_API_KEY` とスタックの `ApiKey` が不一致。Secret 更新後にワークフロー再実行     |
| `API 404: not found`                   | URL の末尾パスが誤り。`<ApiUrl>` は末尾スラッシュ付きで返るため、結合結果が `.../evaluations` になっているか確認   |
| `API 503: write conflict, retry later` | 同時書き込みが 5 回連続で衝突。時間をおいて再保存                                                                  |
| 保存したのに他端末に反映されない       | 相手側がキャッシュを表示中。リロードで API から再取得される                                                        |
| 公開ページが LocalStorage 版のまま     | ビルド時に Variables/Secrets が未設定。4.1 を設定してワークフロー再実行                                            |
| `sam deploy` が IAM 権限エラー         | `--capabilities CAPABILITY_IAM` の付け忘れ、または実行ロールの権限不足                                             |

---

## 関連ドキュメント

- API 仕様: [`api/README.md`](./api/README.md)
- 環境変数: [`.env.example`](./.env.example)
- システム仕様: [`README.md`](./README.md)

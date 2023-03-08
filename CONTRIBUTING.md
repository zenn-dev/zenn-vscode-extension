# Contribution Guide

## 🚩 注意

この VSCode 拡張は β 版です。
予告無しにリポジトリの内容が大幅に変更されたり削除される可能性があります。

## Issues

- zenn.dev に関する問題や改善提案は [zenn-community](https://github.com/zenn-dev/zenn-community/issues) の Issues をご利用ください。
- zenn-vscode-extension に関する問題や改善の提案については [zenn-community](https://github.com/zenn-dev/zenn-community/issues) もしくは本リポジトリの Issues をご利用ください。

## Pull Requests

- レビューに時間がかかる場合やマージを行わずにクローズする場合があります。特に機能追加に関してはあらかじめ Issues で議論させていただければと思います。

### PR 作成時の注意点

- `canary`ブランチに対して作成してください。
- それ以外のブランチはクローズさせて頂きます。

## リリースフロー

- canary ブランチから main ブランチに PR を作成します
  - release ラベルを付与
- canary ブランチにバージョンアップのコミットを追加します
  - バージョンコミットがない場合は Bot によって注意されます
- main ブランチにマージされると拡張が自動リリースされます

### Develop

#### インストール方法

このリポジトリをクローンし、以下のコマンドを実行します。

```
$> pnpm install
```

実行が完了したら、以下のコマンドで動作確認できます。

```
$> pnpm dev
```

> **Note**
> このとき、[VSCode Insiders](https://code.visualstudio.com/insiders/) がインストールされます。

上記のコマンドを実行すると、以下の画像のようなブラウザが開き、このリポジトリ内の `./examples` 内を表示されます。

![](https://user-images.githubusercontent.com/97154037/191165110-ff7b0fad-5692-4288-94bd-f8d0f93463f7.png)

#### デバッグ方法

> **Warning**
> デバッグには VSCode を使用していることを前提にしています。

VSCode 上でデバッグビューを開き、`Run Web Extension` を選択します。

![](https://user-images.githubusercontent.com/97154037/191164796-9f4a0fe9-0159-4393-a583-acfc2a112b57.png)

次に、F5 キーまたはデバッグ実行ボタンを押すと、別の VSCode ウィンドウが開き、そこでデバッグすることができます。

![](https://user-images.githubusercontent.com/97154037/191164493-94e8b9bc-ff4c-47e9-8e20-ede95ccade40.png)

#### ブレークポイントを打つ

このリポジトリを開いている VSCode で、停止したい箇所にブレークポイントを打ちます。(※ 拡張がインストールされている VSCode ではない点に注意)

![](https://user-images.githubusercontent.com/97154037/191165270-0deb7021-2dcf-4383-92ca-b8b9d08d5267.png)

次にデバッグを開始し、新規に開かれた VSCode のウィンドウで `開発者ツールの切り替え` を実行し、Dev Tools を表示します。ブラウザで開いている場合は、F12 キーを押すことで Dev Tools を表示できます。

![](https://user-images.githubusercontent.com/97154037/191165959-d6f49f60-3b14-416a-af7f-40b68121155c.png)

この状態で処理を実行すると、ブレークポイントを打った箇所で処理が停止しますが、デバッグ画面はこのリポジトリを開いている VSCode であることに注意してください。

> **Note**
> ブレークポイントが機能していない場合は、`Developer: Reload Window` コマンドを実行すると上手くいく可能性があります。

#### Hot Reload

デバッグ中は Hot Reload が有効ですが、変更を適用するには Zenn の拡張がインストールされている VSCode ウィンドウで `Developer: Reload Window` を実行する必要があります。

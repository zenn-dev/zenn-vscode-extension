> **🚩 この拡張はまだ β 版です** <br /> 
> **🚩 現在はブラウザ上で動くことを想定してます。ローカルの VSCode でも一応動作しますが補償はしません**

# Zenn VSCode Extension

ブラウザ上で実行される VSCode で、Zenn のコンテンツを表示するための拡張です。

## 特徴

- Zenn のコンテンツをサイドバーに一覧表示します
- [Zenn のフォーマット](https://zenn.dev/zenn/articles/markdown-guide)で書かれたコンテンツをプレビューします
- 記事や本のテンプレートを VSCode 上で新規作成できます
- Zenn 独自の記法のスニペットを追加します
- Zenn のガイド記事の一覧を表示します

## 使い方

Zenn のコンテンツ(`articles/**.md`, `books/**`)があるワークスペースで VSCode を開くと、アクティビティーバーに Zenn のロゴが追加されます。

![](https://user-images.githubusercontent.com/97154037/200182145-b3c9c794-35ad-4064-9223-0308501cda86.png)

追加された Zenn のロゴをクリックすると、ワークスペース内の Zenn のコンテンツがツリービューに表示されます。

![](https://user-images.githubusercontent.com/97154037/200182141-8e15e610-25a4-4c87-b2ce-c2573a472ef6.png)

### コンテンツのプレビュー

記事や本のプレビューは、リスト内のプレビューボタンから行うことができます。

![](https://user-images.githubusercontent.com/97154037/200181486-d18012e8-a86b-4a11-a2ba-2c3272fe9dc0.gif)

現在開いているマークダウンファイルが Zenn のリポジトリ内の `articles` フォルダまたは `books` フォルダに存在している場合には、コマンドパレットから `Zenn: Preview Contents` を実行するか、エディタタイトル上のプレビューボタンをクリックすることでもプレビューができます。

![](https://user-images.githubusercontent.com/50942816/216569874-fadeeadb-a965-47ac-a7ac-1e605fcacd84.png)

### チャプター番号による並べ替え

BOOKS セクションのチャプターファイルは `config.yaml` や `n.slug.md` のフォーマットで設定したチャプターの順番で並べ替えることができます。並べ替えの設定を有効化するには「設定 → Zenn Preview → Sort By Chapter Number」から設定項目をチェックして下さい。

![並び替えの設定項目](https://user-images.githubusercontent.com/50942816/217654314-34a98eb4-ab8d-4d12-9a76-02be50cbd379.jpg)

更に「Show Chapter Number」 の設定を有効化することでチャプターファイルの表示にチャプター番号をプリフィクスすることが可能です。

デフォルトではこれらの設定は無効化されており、ツリービューにおいてチャプターはファイル名の順番で表示されます。また、チャプタータイトルがある場合にはそのタイトルから表示され、チャプタータイトルが無い場合にはファイル名から表示されます。

### コンテンツの新規作成

新規作成ボタンからコンテンツのテンプレートを作成できます。

#### 記事の場合

![記事のサイドパネルヘッダー部分にボタンがあります](https://user-images.githubusercontent.com/97154037/200182139-b7d3f4c1-c016-48e9-af96-f719a145c866.png)

#### 本の場合

![本のサイドパネルヘッダー部分にボタンがあります](https://user-images.githubusercontent.com/97154037/200182143-0d1469f0-b5f8-425f-aeb3-120a5b9c7b7e.png)

### ガイド記事の一覧表示

Zenn のガイド記事の一覧を表示できます。

GUIDES セクションのガイド記事一覧からボタンをクリックするか、コマンドパレットから `Zenn: Open Guide` のコマンドを実行することでガイド記事にアクセスできます。

![ガイドのサイドパネルの子要素部分にボタンがあります](https://user-images.githubusercontent.com/50942816/216094321-ef951df3-5dea-4a3d-82c6-f3b4c8a387d1.jpg)

## スニペットを有効にする方法

デフォルトでは Markdown のスニペットは無効化されているため、有効にするには設定を変更する必要があります。  
settings.json に以下の設定を追加してください。

```json
    "[markdown]":  {
        "editor.quickSuggestions": {
            "comments": true,
            "strings": true,
            "other": true
        }
    }
```

## Zenn との連携について

以下の記事を参照してください。

- [GitHub リポジトリで Zenn のコンテンツを管理する](https://zenn.dev/zenn/articles/connect-to-github)
- [Zenn のコンテンツを github.dev で編集する](https://zenn.dev/zenn/articles/usage-github-dev)

# License

[MIT](LICENSE)

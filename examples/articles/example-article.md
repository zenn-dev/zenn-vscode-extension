---
title: "基本的な文法を羅列した記事"
emoji: "📝"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: []
published: false
---

<!-- TODO: ◯◯について追記する -->

# Header

## Header

### Header

#### Header

##### Header

###### Header

- test
- test2

1. test
2. test2

_イタリック_
**太字**
~~打ち消し線~~
インラインで`code`を挿入する
[zenn.dev](https://zenn.dev)

![](https://storage.googleapis.com/zenn-user-upload/gxnwu3br83nsbqs873uibiy6fd43)

![](https://storage.googleapis.com/zenn-user-upload/gxnwu3br83nsbqs873uibiy6fd43 =250x)
_キャプション_

[![](https://storage.googleapis.com/zenn-user-upload/gxnwu3br83nsbqs873uibiy6fd43)](https://zenn.dev)

| Head | Head | Head |
| ---- | ---- | ---- |
| Text | Text | Text |
| Text | Text | Text |

```js
const great = () => {
  console.log("Awesome");
};
```

```js:ファイル名
const great = () => {
  console.log("Awesome");
};
```

```diff js
@@ -4,6 +4,5 @@
+    const foo = bar.baz([1, 2, 3]) + 1;
-    let foo = bar.baz([1, 2, 3]);
```

```diff js:ファイル名
@@ -4,6 +4,5 @@
+    const foo = bar.baz([1, 2, 3]) + 1;
-    let foo = bar.baz([1, 2, 3]);
```

$$
e^{i\theta} = \cos\theta + i\sin\theta
$$

> 引用文
> 引用文

脚注の例[^1]です。インライン^[脚注の内容その 2]で書くこともできます。

[^1]: 脚注の内容その 1

---

:::message
hoge
:::

:::message alert
hogehoge
:::

:::details タイトル
表示したい内容
:::

::::details タイトル
:::message
ネストされた要素
:::
::::

https://zenn.dev

https://twitter.com/jack/status/20

https://www.youtube.com/watch?v=WRVsOCh907o

https://github.com/octocat/Hello-World/blob/master/README

https://github.com/octocat/Spoon-Knife/blob/main/README.md#L1-L3

https://github.com/zenn-dev/zenn-editor/blob/canary/packages/zenn-cli/images/example-images/zenn-editor.png

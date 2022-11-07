declare module "zenn-content-css" {
  const styles: string;
  export default styles;
}

// @types パッケージをインストールするほどでもないので、こちらで定義する
declare module "natural-compare-lite" {
  export default function naturalCompare(a: string, b: string): number;
}

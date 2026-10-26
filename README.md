# 西柳ケ瀬ストリートマーケット 特設サイト

公開先: https://higusan-goro.github.io/nishiyanagase-market/

このリポジトリに置いたファイルは、push すると数分で上のサイトに反映されます(GitHub Pages)。
ただし `docs/`・`tools/`・この README はWebページとしては公開しない設定です(`_config.yml`)。
リポジトリ自体は公開なので、GitHub上では誰でも読めます。

## どこに何があるか

| 場所 | 中身 |
|---|---|
| `index.html` | サイト本体(文章と構造) |
| `assets/style.css` | 見た目(色・余白・レイアウト) |
| `assets/script.js` | 画像を押すと拡大表示する仕組み |
| `assets/images/` | 画像(イラスト・地図・チラシ・協賛ロゴなど) |
| `docs/requirements.md` | やりたいこと・決まったこと・これから決めること |
| `docs/design-tokens.md` | 色・書体・余白の定義 |
| `docs/tone.md` | 文章の語り口 |
| `docs/changelog.md` | 回ごとの改修履歴と、点検で見つかったことの記録 |
| `tools/` | 見た目の確認用の道具(変更前後のスクリーンショットを撮って比べる) |
| `.claude/agents/` | Claude Code の役割分担(文章・デザイン・点検) |

## 改修の流れ

1. やりたいことを Claude Code と相談し、決まったことを `docs/requirements.md` に書く。
2. 文章は `content-writer`、見た目は `designer` が担当して手を入れる。
3. `reviewer` が点検する(表示崩れ・リンク切れ・スマホ幅・容量・文章)。
4. ゴロが内容を確認し、了承したらコミット(変更の保存)と push(公開)。

## 見た目の確認方法(Claude Code が行う)

```
node tools/shot.mjs <変更前のフォルダ> <保存先A>
node tools/shot.mjs . <保存先B>
python tools/diff.py <保存先A> <保存先B>
```

スマホ(375px)・タブレット(768px)・PC(1280px)のページ全体を撮り、1ピクセルでも違えば「差分あり」と出ます。
Google Chrome・Node.js・Python(Pillow)を使います。

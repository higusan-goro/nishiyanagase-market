# 2つのフォルダの同名スクリーンショットをピクセル単位で比べる。
# 使い方: python tools/diff.py <変更前の保存先> <変更後の保存先>
import sys, pathlib
from PIL import Image, ImageChops
sys.stdout.reconfigure(encoding="utf-8")  # Windowsでも日本語を化けさせない
a, b = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
for pa in sorted(a.glob("*.png")):
    ia, ib = Image.open(pa).convert("RGB"), Image.open(b / pa.name).convert("RGB")
    if ia.size != ib.size: print(pa.name, "SIZE DIFF", ia.size, ib.size); continue
    box = ImageChops.difference(ia, ib).getbbox()
    print(pa.name, ia.size, "差分0" if box is None else f"差分あり 範囲={box}")

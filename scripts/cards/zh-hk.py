#!/usr/bin/env python3
"""
AvianDex — 卡面中文「簡體 → 香港繁體」

為什麼要這一步？
    抽取器取的是維基原文，而中文維基不少條目是簡體（或簡繁混排）。
    卡面是香港繁體介面，所以出圖前必須逐字轉換：
      这种翠鸟含有鱼类  →  這種翠鳥含有魚類

為什麼用 OpenCC 而不是自己寫對照表？
    自己寫表一定會漏字（第一版只覆蓋常用 80 字，結果「河谷」變「河穀」、
    「若干」變「若乾」）。OpenCC 的 s2t 表是社區維護的詞組級轉換，
    會按上下文判斷（河谷→河谷、谷物→穀物、若干→若干）。

安裝（只需一次）：
    pip install opencc-python-reimplemented
    或者 Windows：py -m pip install opencc-python-reimplemented

用法：
    python3 scripts/cards/zh-hk.py --check     # 只報告
    python3 scripts/cards/zh-hk.py --write     # 轉換並寫回 cardCopy.json（先備份）
"""
import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, "src", "data", "cardCopy.json")

# 轉換後再修正的少數香港用字（OpenCC s2t 用「爲」的情況）
# OpenCC s2t 會把「群」寫成古體「羣」、把「為」寫成「爲」；香港通用寫法係前者，
# 這兩類屬「異體字」而非「簡繁」，所以轉完要改返，避免無謂改動原文。
# 單字異體（str.maketrans 只收單字）
POST_CHAR = {
    "爲": "為",      # 香港寫「為」
    "羣": "群",      # 香港寫「群」
    "裏": "裡",      # 香港慣用「裡」
}
# 詞組修正：OpenCC 靠詞組表判斷，少數情況會改錯（用一詞多義字），
# 這裡逐條列出實測到的錯例，只改回這些，不做其他改動。
POST_WORD = [
    ("臺灣", "台灣"),      # 香港慣用「台灣」
    ("幹擾", "干擾"),      # 「干擾」唔係「乾」的異體
    ("幹涉", "干涉"),
    ("幹旱", "乾旱"),
    ("幹燥", "乾燥"),
    ("瞭解", "了解"),
    ("達烏裏", "達烏里"),  # 音譯地名／人名，唔轉
    ("烏裏", "烏里"),
    ("烏裡", "烏里"),
    ("巖", "岩"),          # 香港慣用「岩」
    ("于飛", "於飛"),      # 單字「于」在句中被 OpenCC 漏掉的情況
]

LEGACY = ("range", "habitat", "diet", "look", "breeding", "funFact", "voice", "behavior",
          "migration", "conservation", "humanRelation", "etymology", "highlights", "notes")
def _converter():
    try:
        from opencc import OpenCC          # pip install opencc-python-reimplemented
    except ImportError:
        print("✗ 需要 OpenCC：pip install opencc-python-reimplemented")
        print("  （也可以用 py -m pip install opencc-python-reimplemented）")
        sys.exit(2)
    cc = OpenCC("s2t")
    post = str.maketrans(POST_CHAR)

    def run(t):
        out = cc.convert(t).translate(post)
        for a, b in POST_WORD:
            out = out.replace(a, b)
        return out
    return run


CONVERT = None


def conv(v):
    global CONVERT
    if isinstance(v, list):
        return [conv(x) for x in v]
    if not isinstance(v, str) or not v:
        return v
    if CONVERT is None:
        CONVERT = _converter()
    return CONVERT(v)


def main():
    ap = argparse.ArgumentParser(description="卡面中文簡體 → 香港繁體（逐字，不改詞）")
    ap.add_argument("--write", action="store_true", help="寫回 cardCopy.json（先備份 .prehk）")
    ap.add_argument("--check", action="store_true", help="只報告（預設行為）")
    ap.add_argument("--ids", nargs="*", help="只處理這些編號")
    args = ap.parse_args()

    with open(DATA, encoding="utf-8") as fh:
        copy = json.load(fh)
    want = {str(i).zfill(4) for i in (args.ids or [])} or None

    hits = []
    for cid, c in copy.items():
        if cid.startswith("_"):
            continue
        if want and cid not in want:
            continue
        for cell in c.get("fieldCopy") or []:
            v = cell.get("zh")
            for x in (v if isinstance(v, list) else [v]):
                if isinstance(x, str) and conv(x) != x:
                    hits.append((cid, cell.get("id"), x))
        for k in LEGACY:
            v = c.get(k)
            for x in (v if isinstance(v, list) else [v]):
                if isinstance(x, str) and conv(x) != x:
                    hits.append((cid, k, x))

    print(f"🔍 含簡體字的地方：{len(hits)} 段")
    for cid, fid, txt in hits[:12]:
        fixed = conv(txt)
        # 只顯示有差異的片段，方便一眼核對
        i = next(i for i, (a, b) in enumerate(zip(txt, fixed)) if a != b)
        lo = max(0, i - 12)
        print(f"  {cid} {fid}")
        print(f"    原文：…{txt[lo:lo + 44]}…")
        print(f"    繁體：…{fixed[lo:lo + 44]}…")
    if len(hits) > 15:
        print(f"  …其餘 {len(hits) - 15} 段")

    if not args.write:
        return 0

    for cid, c in copy.items():
        if cid.startswith("_"):
            continue
        if want and cid not in want:
            continue
        for cell in c.get("fieldCopy") or []:
            cell["zh"] = conv(cell.get("zh"))
        for k in LEGACY:
            if k in c:
                c[k] = conv(c[k])

    backup = DATA + ".prehk"
    with open(backup, "w", encoding="utf-8") as fh:
        json.dump(json.load(open(DATA, encoding="utf-8")), fh, ensure_ascii=False, indent=2)
    with open(DATA, "w", encoding="utf-8") as fh:
        json.dump(copy, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"\n✅ 已轉換 {len(hits)} 段 → {os.path.relpath(DATA, ROOT)}")
    print(f"   備份：{os.path.relpath(backup, ROOT)}")
    print("   之後：npm test && python3 scripts/cards/lint-copy.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())

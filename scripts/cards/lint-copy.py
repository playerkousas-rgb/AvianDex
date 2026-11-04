#!/usr/bin/env python3
"""
AvianDex — 文案品質檢查（唔改寫、唔機翻，只係挑出「唔應該印上卡」嘅格）

為什麼要有這支工具？
    抽取器只負責「由維基原文抽句子」。但維基有些句子係圖說、有些係講
    另一隻近似種、有些係英文句子混入中文格。這些句子「原文無誤」，
    但放上卡面就係錯，所以要在出圖之前攔住。

檢查五類（每類都會印出編號＋欄位＋原文開頭，方便人手判斷）：
    1) 中英相同        － 兩邊一模一樣（多數係抄同一條，英文版會出錯字）
    2) 英文格含中文    － en 格出現漢字
    3) 中文格含英文句  － zh 格出現 3 個以上連續英文字（多數係圖說混入）
    4) 過長            － 超出 field-schema LIMITS（卡片放唔落）
    5) 句子不完整      － 冇句末標點／開頭就係「and」「with」等連接詞

用法：
    python3 scripts/cards/lint-copy.py              # 全部掃一次
    python3 scripts/cards/lint-copy.py 0008 0021    # 只掃指定卡
    python3 scripts/cards/lint-copy.py --json       # 出機器可讀結果
    python3 scripts/cards/lint-copy.py --fix        # 把有問題的格清空（原文仍在維基，可重抽）
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, "src", "data")

LIMITS = {
    "zh": {"range": 46, "habitat": 46, "diet": 46, "funFact": 60, "look": 74, "breeding": 160,
           "voice": 60, "behavior": 60, "migration": 60, "conservation": 70, "humanRelation": 70,
           "etymology": 90, "highlights": 200},
    "en": {"range": 160, "habitat": 160, "diet": 160, "funFact": 200, "look": 260, "breeding": 420,
           "voice": 200, "behavior": 200, "migration": 200, "conservation": 240, "humanRelation": 240,
           "etymology": 300, "highlights": 560},
}
CJK = re.compile(r"[\u4e00-\u9fff]")
# 只捉「整句英文」：三個以上英文字（可以係單字母縮寫），但學名、引用書名、
# 外語原名（e.g. "Anser fabalis rossicus"、"het eerste kievietsei"）係正常內容，
# 所以先移除拉丁學名式詞組以外的判定交給下面 has_en_sentence()。
EN_SENT = re.compile(r"[A-Za-z]{2,}(?:\s+[A-Za-z][\w'’-]*){2,}")
# 真正的壞開頭：句首就係連接詞／關係代名詞（代表句子係被截出嚟）
# 注意：In / On / At / Of 開頭的介詞片語係正常英文句，唔算壞。
BAD_START = re.compile(r"^(and|but|or|which|that|while|although|however|because|so)\b", re.I)


def norm(s):
    return re.sub(r"\s+", "", str(s or "")).lower()


# 中文段落內出現這些，就算「整句英文」（名稱、書名、外語詞唔算）
EN_FUNC = re.compile(r"\b(the|and|with|from|that|which|this|these|their|is|are|was|were|"
                     r"has|have|been|its|also|but|for|not|when|where)\b", re.I)


def has_en_sentence(txt):
    """中文格混入整段英文句（多數係圖說或英文段落漏入）。"""
    for m in EN_SENT.finditer(txt):
        seg = m.group(0)
        words = seg.split()
        # 大寫開頭的多字詞組多數係學名／人名 → 要有英文虛詞才算「句子」
        if len(words) >= 6 and EN_FUNC.search(seg):
            return True
        if len(words) >= 8:
            return True
    return False


LIST_FIELDS = {"highlights", "tips", "caution"}


def check_cell(fid, lang, txt):
    """回傳問題代碼 list（空 = 合格）"""
    t = " ".join(str(x) for x in txt) if isinstance(txt, list) else str(txt or "")
    t = t.strip()
    if not t:
        return []
    bad = []
    if isinstance(txt, list):
        # 列表欄位：驗項數與每條長度（卡面每格最多 5 條、每條 ≤40 字）
        if len(txt) > 5:
            bad.append(f"list-too-many({len(txt)}>5)")
        # 中文每條建議 ≤40 字；英文同一格寬度下約 3.2 倍字數
        for item in txt:
            lim = 40 if lang == "zh" else 130
            if len(str(item)) > lim:
                bad.append(f"item-too-long({len(str(item))}>{lim})")
        return bad
    if lang == "en" and CJK.search(t):
        bad.append("en-has-cjk")
    if lang == "zh" and has_en_sentence(t):
        bad.append("zh-has-en-sentence")
    lim = LIMITS[lang].get(fid, 60)
    if len(t) > lim:
        bad.append(f"too-long({len(t)}>{lim})")
    # 卡面文字按「完整分句」截斷，所以中文結尾可以是「，」；
    # 只有完全冇標點結尾（＝句子被硬截）才算問題。
    if lang == "zh":
        if not re.search(r"[。！？；，、……」，」”)]$", t):
            bad.append("no-end-punct")
    elif not re.search(r"[.!?;,\"')\]]$", t):
        bad.append("no-end-punct")
    if lang == "en" and BAD_START.match(t):
        bad.append("starts-with-conjunction")
    return bad


# 只會令出圖錯的才算錯誤；其餘係提示（人手可以接受）
HARD = {"en-has-cjk", "zh-has-en-sentence", "too-long", "list-too-many"}


def severity(issue):
    return "ERROR" if issue.split("(")[0] in HARD else "WARN"


def main():
    ap = argparse.ArgumentParser(description="卡面文案品質檢查（唔改寫原文）")
    ap.add_argument("ids", nargs="*", help="只檢查這些編號（留空＝全部）")
    ap.add_argument("--json", action="store_true", help="輸出 JSON")
    ap.add_argument("--fix", action="store_true", help="把有問題的格清空並寫回 cardCopy.json（先備份）")
    args = ap.parse_args()

    path = os.path.join(DATA, "cardCopy.json")
    with open(path, encoding="utf-8") as fh:
        copy = json.load(fh)

    want = {str(i).zfill(4) for i in args.ids} or None
    rows = []
    n_bad_cells = 0
    for cid, c in copy.items():
        if cid.startswith("_"):
            continue
        if want and cid not in want:
            continue
        for cell in c.get("fieldCopy") or []:
            fid = cell.get("id")
            zh, en = cell.get("zh") or "", cell.get("en") or ""
            if zh and en and norm(zh) == norm(en):
                rows.append({"id": cid, "field": fid, "lang": "both", "issue": "zh-eq-en",
                             "text": zh[:80]})
                n_bad_cells += 1
            for lang, txt in (("zh", zh), ("en", en)):
                for issue in check_cell(fid, lang, txt):
                    rows.append({"id": cid, "field": fid, "lang": lang, "issue": issue,
                                 "text": str(txt or "")[:80]})
                    n_bad_cells += 1

    if args.json:
        print(json.dumps(rows, ensure_ascii=False, indent=1))
    else:
        by_issue = {}
        for r in rows:
            by_issue.setdefault(r["issue"].split("(")[0], []).append(r)
        hard = [r for r in rows if severity(r["issue"]) == "ERROR"]
        print(f"🔍 檢查 {len([k for k in copy if not k.startswith('_')])} 張卡："
              f"{len(hard)} 個要修的問題格（另有 {len(rows) - len(hard)} 個提示）\n")
        for issue, rs in sorted(by_issue.items(), key=lambda kv: -len(kv[1])):
            tag = "✗" if issue in HARD else "·"
            print(f" {tag} {issue:26s} {len(rs):4d} 格  （{len({r['id'] for r in rs})} 張卡）")
        if hard:
            print("\n要修的（編號／欄位／原因／原文開頭）：")
            for r in hard[:25]:
                print(f"  {r['id']} {r['field']:14s} {r['lang']:4s} {r['issue']:24s} {r['text']}")

    if args.fix:
        cleared = 0
        for cid, c in copy.items():
            if cid.startswith("_"):
                continue
            if want and cid not in want:
                continue
            for cell in c.get("fieldCopy") or []:
                fid = cell.get("id")
                for lang in ("zh", "en"):
                    if check_cell(fid, lang, cell.get(lang)):
                        cell[lang] = ""
                        cleared += 1
        backup = path + ".prelint.bak"
        with open(backup, "w", encoding="utf-8") as fh:
            json.dump(json.load(open(path, encoding="utf-8")), fh, ensure_ascii=False, indent=2)
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(copy, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        print(f"\n🧹 已清空 {cleared} 個問題格 → {os.path.relpath(path, ROOT)}")
        print(f"   備份：{os.path.relpath(backup, ROOT)}（原文仍在維基，可用 --ids 重抽）")
        print("   之後：node scripts/cards/show-picks.mjs --write 之外，記得重算 picks：npm run cards:picks")
        return 0

    return 1 if any(severity(r["issue"]) == "ERROR" for r in rows) else 0


if __name__ == "__main__":
    sys.exit(main())

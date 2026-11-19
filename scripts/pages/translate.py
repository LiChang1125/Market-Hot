"""Add Chinese reading copy on CPU. The original title and source URL stay in each card."""
import hashlib
import json
import re
import sys
import urllib.request
import zipfile
from pathlib import Path

import ctranslate2
import sentencepiece

digest = Path(".data/free-reader/digest.json")
root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".data/translation")
model = root / "translate-en_zh-1_9"
if not (model / "model/model.bin").exists():
    root.mkdir(parents=True, exist_ok=True)
    bundle = root / "translate.argosmodel"
    url = "https://github.com/LiChang1125/cue-marketing/releases/download/translation-model-en-zh-1.9/translate-en_zh-1_9.argosmodel"
    with urllib.request.urlopen(url, timeout=60) as response:
        contents = response.read(120 * 1024 * 1024)
    if hashlib.sha256(contents).hexdigest() != "433e7c4f034d87fbe2353161e05f18646d7999452f801a4e1f0378522b9850ab":
        raise ValueError("Unexpected translation model checksum")
    bundle.write_bytes(contents)
    with zipfile.ZipFile(bundle) as package:
        for member in package.namelist():
            if not (root / member).resolve().is_relative_to(root.resolve()):
                raise ValueError("Unexpected model path")
        package.extractall(root)
    bundle.unlink()

data = json.loads(digest.read_text(encoding="utf8"))
tokenizer = sentencepiece.SentencePieceProcessor(model_file=str(model / "sentencepiece.model"))
engine = ctranslate2.Translator(str(model / "model"), device="cpu", compute_type="int8", intra_threads=2)
jobs = [(card, field) for card in data["cards"] for field in ("title", "summary")
        if not re.search(r"[\u3400-\u9fff]", card[field]) and re.search(r"[a-zA-Z]{3}", card[field])]
for start in range(0, len(jobs), 12):
    batch = jobs[start:start + 12]
    encoded = [tokenizer.encode(card[field].replace("’", "'"), out_type=str) for card, field in batch]
    results = engine.translate_batch(encoded, beam_size=4, replace_unknowns=True, length_penalty=0.2)
    for (card, field), result in zip(batch, results):
        text = "".join(result.hypotheses[0]).replace("▁", " ").strip()
        if re.search(r"[\u3400-\u9fff]", text):
            card[field + "Zh"] = text
digest.write_text(json.dumps(data, ensure_ascii=False), encoding="utf8")

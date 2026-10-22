#!/usr/bin/env python3
"""Validate Utilityra Blogger theme XML, manifest consistency, embedded JS and private analytics schema."""
import json, re, subprocess, tempfile, sqlite3
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
PAGES=ROOT/"blogger-pages"
THEME=PAGES/"utilityra-theme-v2.xml"
MANIFEST=PAGES/"manifest.json"

def fail(message): raise SystemExit("VALIDATION FAILED: "+message)

try: ET.parse(THEME)
except Exception as exc: fail(f"Theme XML is not well-formed: {exc}")
try: manifest=json.loads(MANIFEST.read_text(encoding="utf-8"))
except Exception as exc: fail(f"Manifest JSON is invalid: {exc}")
pages=manifest.get("pages")
if not isinstance(pages,list) or not pages: fail("manifest.pages must be a non-empty list")
titles,files,urls=set(),set(),set()
for page in pages:
    title,filename=page.get("title"),page.get("file")
    if not title or not filename: fail("Every manifest page requires title and file")
    if title.casefold() in titles: fail(f"Duplicate manifest title: {title}")
    if filename in files: fail(f"Duplicate manifest file: {filename}")
    titles.add(title.casefold()); files.add(filename)
    if not (PAGES/filename).is_file(): fail(f"Manifest file is missing: {filename}")
    source=(PAGES/filename).read_text(encoding="utf-8")
    if "REPLACE-WITH-YOUR-WORKER" in source: fail(f"Unconfigured Worker placeholder must not be in draft manifest: {filename}")
    ids=re.findall(r'<[a-zA-Z][^>]*\sid=[\'"]([^\'"]+)[\'"][^>]*>',source,flags=re.I)
    if len(ids)!=len(set(ids)): fail(f"Duplicate HTML id in {filename}")
    for index,script in enumerate(re.findall(r"<script\b[^>]*>(.*?)</script\s*>",source,flags=re.I|re.S),1):
        script=re.sub(r"^\s*<!\[CDATA\[|\]\]>\s*$","",script.strip())
        if not script.strip(): continue
        with tempfile.NamedTemporaryFile("w",suffix=".js",encoding="utf-8",delete=False) as tmp:
            tmp.write(script); name=tmp.name
        result=subprocess.run(["node","--check",name],text=True,capture_output=True)
        Path(name).unlink(missing_ok=True)
        if result.returncode: fail(f"JavaScript syntax error in {filename}, script {index}: {result.stderr.strip()}")
    url=page.get("url")
    if not isinstance(url,str) or not url.startswith("https://utilityra.blogspot.com/"):
        fail(f"Page must retain its verified live URL: {filename}")
    path=urlsplit(url).path
    if path in urls: fail(f"Duplicate live page URL: {path}")
    urls.add(path)

connection=sqlite3.connect(":memory:")
try:
    connection.executescript((ROOT/"worker"/"schema.sql").read_text(encoding="utf-8"))
    connection.executescript((ROOT/"worker"/"seed.sql").read_text(encoding="utf-8"))
    seed_count=connection.execute("SELECT COUNT(*) FROM data_records").fetchone()[0]
    draft_count=connection.execute("SELECT COUNT(*) FROM data_records WHERE status='draft'").fetchone()[0]
    public_count=connection.execute("SELECT COUNT(*) FROM data_collections WHERE is_public=1").fetchone()[0]
    fk_errors=connection.execute("PRAGMA foreign_key_check").fetchall()
    if seed_count<10 or draft_count!=seed_count: fail("Seed records must remain private drafts until reviewed")
    if public_count!=0 or fk_errors: fail("Seed collections must remain private and foreign keys valid")
except SystemExit: raise
except Exception as exc: fail(f"D1 schema/seed SQL is invalid: {exc}")
finally: connection.close()

admin=(ROOT/"worker"/"public"/"admin.html").read_text(encoding="utf-8")
if 'name="robots" content="noindex,nofollow,noarchive"' not in admin: fail("Admin dashboard must be marked noindex")
for index,script in enumerate(re.findall(r"<script\b[^>]*>(.*?)</script\s*>",admin,flags=re.I|re.S),1):
    if not script.strip(): continue
    with tempfile.NamedTemporaryFile("w",suffix=".js",encoding="utf-8",delete=False) as tmp:
        tmp.write(script); name=tmp.name
    result=subprocess.run(["node","--check",name],text=True,capture_output=True); Path(name).unlink(missing_ok=True)
    if result.returncode: fail(f"JavaScript syntax error in admin dashboard script {index}: {result.stderr.strip()}")

theme=THEME.read_text(encoding="utf-8")
for index,match in enumerate(re.finditer(r"<script\b([^>]*)>(.*?)</script\s*>",theme,flags=re.I|re.S),1):
    if re.search(r"""type=['"]application/ld\+json['"]""",match.group(1),flags=re.I): continue
    script=re.sub(r"^\s*<!\[CDATA\[|\]\]>\s*$","",match.group(2).strip())
    if not script.strip(): continue
    with tempfile.NamedTemporaryFile("w",suffix=".js",encoding="utf-8",delete=False) as tmp:
        tmp.write(script); name=tmp.name
    result=subprocess.run(["node","--check",name],text=True,capture_output=True); Path(name).unlink(missing_ok=True)
    if result.returncode: fail(f"JavaScript syntax error in theme script {index}: {result.stderr.strip()}")
if "ca-pub-1235197294708204" not in theme: fail("Existing AdSense publisher connection must be preserved")
if "Flarivo" in theme or "FLARIVO" in theme: fail("Old brand string remains in new theme")
card_section=theme.split("<div class='ur-tool-grid' id='ur-tool-grid'>",1)[-1].split("</div><div class='empty'",1)[0]
card_hrefs=re.findall(r"<a class='ur-card-foot' href='(/p/[^']+\.html)'",card_section)
expected={urlsplit(p["url"]).path for p in pages if p["file"] not in {"about.html","privacy-policy.html","contact.html","disclaimer.html"}}
if len(card_hrefs)!=len(set(card_hrefs)): fail("Duplicate tool card URLs")
missing=sorted(set(card_hrefs)-expected)
if missing: fail("Tool card URLs do not match verified live URLs: "+", ".join(missing))
tool_count=len(expected)
if tool_count<50 or len(card_hrefs)<50: fail("Expected at least 50 dedicated tool pages and homepage cards")
print("PASS: Utilityra v2 Blogger theme XML is well-formed.")
print(f"PASS: {len(pages)} manifest pages exist, keep their verified URLs and have valid embedded JavaScript.")
print(f"PASS: {len(card_hrefs)} tool cards point to preserved live URLs.")
print("PASS: AdSense publisher connection remains present; old brand is absent from the new theme.")
print(f"PASS: D1 schema and seed SQL execute; {seed_count} records remain private drafts.")

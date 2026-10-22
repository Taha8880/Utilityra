#!/usr/bin/env python3
"""Validate Utilityra theme XML, manifest consistency, and embedded JavaScript syntax."""
import json
import re
import subprocess
import tempfile
import sqlite3
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "blogger-pages"
THEME = PAGES / "utilityra-theme-v1.xml"
MANIFEST = PAGES / "manifest.json"

def fail(message):
    raise SystemExit("VALIDATION FAILED: " + message)

try:
    ET.parse(THEME)
except Exception as exc:
    fail(f"Theme XML is not well-formed: {exc}")

try:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
except Exception as exc:
    fail(f"Manifest JSON is invalid: {exc}")

pages = manifest.get("pages")
if not isinstance(pages, list) or not pages:
    fail("manifest.pages must be a non-empty list")

titles, files = set(), set()
for page in pages:
    title, filename = page.get("title"), page.get("file")
    if not title or not filename:
        fail("Every manifest page requires title and file")
    if title.casefold() in titles:
        fail(f"Duplicate manifest title: {title}")
    if filename in files:
        fail(f"Duplicate manifest file: {filename}")
    titles.add(title.casefold())
    files.add(filename)
    path = PAGES / filename
    if not path.is_file():
        fail(f"Manifest file is missing: {filename}")
    source = path.read_text(encoding="utf-8")
    if "REPLACE-WITH-YOUR-WORKER" in source:
        fail(f"Unconfigured Worker placeholder must not be in draft manifest: {filename}")
    ids = re.findall(r'<[a-zA-Z][^>]*\sid=[\'"]([^\'"]+)[\'"][^>]*>', source, flags=re.I)
    if len(ids) != len(set(ids)):
        fail(f"Duplicate HTML id in {filename}")
    for index, script in enumerate(re.findall(r"<script\b[^>]*>(.*?)</script\s*>", source, flags=re.I | re.S), 1):
        script = re.sub(r"^\s*<!\[CDATA\[|\]\]>\s*$", "", script.strip())
        if not script.strip():
            continue
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as tmp:
            tmp.write(script)
            temp_name = tmp.name
        result = subprocess.run(["node", "--check", temp_name], text=True, capture_output=True)
        Path(temp_name).unlink(missing_ok=True)
        if result.returncode:
            fail(f"JavaScript syntax error in {filename}, script {index}: {result.stderr.strip()}")

# Execute the schema and seed in an isolated in-memory SQLite database.
try:
    connection = sqlite3.connect(":memory:")
    connection.executescript((ROOT / "worker" / "schema.sql").read_text(encoding="utf-8"))
    connection.executescript((ROOT / "worker" / "seed.sql").read_text(encoding="utf-8"))
    seed_count = connection.execute("SELECT COUNT(*) FROM data_records").fetchone()[0]
    draft_count = connection.execute("SELECT COUNT(*) FROM data_records WHERE status = 'draft'").fetchone()[0]
    public_count = connection.execute("SELECT COUNT(*) FROM data_collections WHERE is_public = 1").fetchone()[0]
    fk_errors = connection.execute("PRAGMA foreign_key_check").fetchall()
    connection.close()
    if seed_count < 10 or draft_count != seed_count:
        fail("Seed data must contain at least ten records, all kept in draft status until reviewed")
    if public_count != 0 or fk_errors:
        fail("Seed collections must remain private and foreign keys must be valid")
except SystemExit:
    raise
except Exception as exc:
    fail(f"D1 schema/seed SQL is invalid: {exc}")

theme_text = THEME.read_text(encoding="utf-8")
for index, script in enumerate(re.findall(r"<script\\b[^>]*>(.*?)</script\\s*>", theme_text, flags=re.I | re.S), 1):
    script = re.sub(r"^\\s*<!\\[CDATA\\[|\\]\\]>\\s*$", "", script.strip())
    if not script.strip():
        continue
    with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as tmp:
        tmp.write(script)
        temp_name = tmp.name
    result = subprocess.run(["node", "--check", temp_name], text=True, capture_output=True)
    Path(temp_name).unlink(missing_ok=True)
    if result.returncode:
        fail(f"JavaScript syntax error in theme script {index}: {result.stderr.strip()}")
# The main tool-card links must correspond to page titles Blogger derives slugs from.
card_section = theme_text.split("<div class='ur-tool-grid' id='ur-tool-grid'>", 1)[-1].split("</div></div></section>", 1)[0]
card_hrefs = re.findall(r"<a class='ur-card-foot' href='(/p/[^']+\.html)'", card_section)
def slug(title):
    value = title.casefold().replace("|", " ")
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return "/p/" + value + ".html"
expected = {slug(page["title"]) for page in pages if page["file"] not in {"about.html", "privacy-policy.html", "contact.html", "disclaimer.html"}}
missing = sorted(set(card_hrefs) - expected)
if missing:
    fail("Tool card URLs have no matching manifest title: " + ", ".join(missing))
tool_count = len([page for page in pages if page["file"] not in {"about.html", "privacy-policy.html", "contact.html", "disclaimer.html"}])
if tool_count < 50 or len(card_hrefs) < 50:
    fail("Expected at least 50 dedicated tool pages and homepage cards")

print(f"PASS: Blogger theme XML is well-formed.")
print(f"PASS: {len(pages)} manifest pages exist and contain syntactically valid JavaScript.")
print(f"PASS: {len(card_hrefs)} homepage tool-card links map to manifest page titles.")
print(f"PASS: D1 schema and seed SQL execute; {seed_count} records remain private drafts.")

#!/usr/bin/env python3
"""Screen recent preprints and prepare an evidence report for human review.

The workflow never publishes an EFI post or writes to data/editions.json.
"""

import argparse
import datetime as dt
import html
from html.parser import HTMLParser
import json
import re
import time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


TOPICS = {
    "HLA and matching": ("hla", "histocompatibility", "allorecognition", "alloreactive", "eplet", "pirche", "peptide presentation"),
    "transplantation": ("transplant", "graft", "donor recipient", "allograft", "gvhd", "graft-versus-host"),
    "immune monitoring": ("immune monitoring", "tcr repertoire", "t cell receptor", "antibody", "dsa", "biomarker"),
    "innate and unconventional cells": ("hla-e", "hla-g", "kir", "natural killer", "gamma delta", "γδ", "btnl", "leader peptide"),
}
CONTEXT = ("hla", "transplant", "allograft", "alloimmune", "immunogenetic", "t cell", "t-cell", "antibody", "kir", "nk cell")
DOI_RE = re.compile(r"^10\.(?:1101|64898)/[A-Za-z0-9._/-]+$")
USER_AGENT = "EFI-Journal-Club/0.1 (preprint screening; contact via repository)"


def get(url, limit=6_000_000):
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json, application/xml, text/html;q=0.9"})
    with urlopen(req, timeout=25) as response:
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError("response exceeds size limit")
        return data


def api_records(server, start, end, category, max_pages):
    records = []
    for page in range(max_pages):
        cursor = page * 30
        url = f"https://api.biorxiv.org/details/{server}/{start}/{end}/{cursor}/json?category={quote(category)}"
        payload = json.loads(get(url))
        records.extend(payload.get("collection", []))
        meta = payload["messages"][0]
        if cursor + len(payload.get("collection", [])) >= int(meta.get("total", 0)) or not payload.get("collection"):
            break
    return records


def score(record):
    title = html.unescape(record.get("title", "")).lower()
    abstract = html.unescape(record.get("abstract", "")).lower()
    text = title + " " + abstract
    if not abstract.strip() or not any(term in text for term in CONTEXT):
        return 0, []
    topics = [name for name, words in TOPICS.items() if any(w in text for w in words)]
    if not topics:
        return 0, []
    # The score only prioritizes full-text retrieval; it is not a quality rating.
    points = sum(3 * any(w in title for w in words) + any(w in abstract for w in words)
                 for words in TOPICS.values())
    return points, topics


def tag_name(element):
    return element.tag.rsplit("}", 1)[-1]


def text_of(element):
    return " ".join(" ".join(element.itertext()).split())


def jats_sections(raw):
    root = ET.fromstring(raw)
    body = next((e for e in root.iter() if tag_name(e) == "body"), None)
    if body is None:
        raise ValueError("no article body")
    sections = []
    for sec in body.iter():
        if tag_name(sec) != "sec":
            continue
        title = next((text_of(e) for e in sec if tag_name(e) == "title"), "")
        paragraphs = [text_of(e) for e in sec if tag_name(e) == "p"]
        if title and paragraphs:
            sections.append({"title": title, "excerpt": " ".join(paragraphs)[:900]})
    figures = []
    for fig in body.iter():
        if tag_name(fig) == "fig":
            caption = next((text_of(e) for e in fig if tag_name(e) == "caption"), "")
            if caption:
                figures.append(caption[:500])
    return sections, figures


class PageText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "nav"):
            self.skip += 1
        elif not self.skip and tag in ("h1", "h2", "h3", "p", "figcaption"):
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "nav") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def html_sections(raw):
    parser = PageText()
    parser.feed(raw.decode("utf-8", "replace"))
    text = " ".join(" ".join(parser.parts).split())
    if len(text) < 5000 or not re.search(r"\bresults\b", text, re.I) or not re.search(r"\bmethods\b", text, re.I):
        raise ValueError("HTML missing substantial results or methods")
    sections = []
    for label in ("Results", "Discussion", "Materials and Methods"):
        match = re.search(r"\b" + re.escape(label) + r"\b", text, re.I)
        if match:
            sections.append({"title": label, "excerpt": text[match.end():match.end() + 900]})
    if not re.search(r"\bfig(?:ure)?\.?(?:\s|&nbsp;)*1\b", text, re.I):
        raise ValueError("HTML missing figure information")
    return sections, ["Figure information present in HTML; inspect the article figures manually."]


def full_text(record):
    doi = record.get("doi", "")
    version = str(record.get("version", ""))
    if not DOI_RE.fullmatch(doi) or not version.isdecimal():
        return {"status": "invalid DOI or version"}
    errors = []
    jats = record.get("jatsxml", "")
    if jats and urlparse(jats).scheme == "https" and urlparse(jats).hostname in ("www.biorxiv.org", "www.medrxiv.org"):
        try:
            sections, figures = jats_sections(get(jats))
            if sections and figures and any("result" in s["title"].lower() for s in sections) and any("method" in s["title"].lower() for s in sections):
                return {"status": "readable", "format": "JATS XML", "url": jats, "sections": sections, "figures": figures}
            errors.append("JATS lacks results, methods or figures")
        except (HTTPError, URLError, ValueError, ET.ParseError) as exc:
            errors.append(f"JATS: {type(exc).__name__} {getattr(exc, 'code', '')}")
    url = f"https://www.{record['server'].lower()}.org/content/{doi}v{version}.full"
    try:
        sections, figures = html_sections(get(url))
        return {"status": "readable", "format": "HTML", "url": url, "sections": sections, "figures": figures}
    except (HTTPError, URLError, ValueError) as exc:
        errors.append(f"HTML: {type(exc).__name__} {getattr(exc, 'code', '')}")
    return {"status": "unavailable", "errors": errors}


def screen(as_of, max_pages, max_candidates, radar_enabled):
    start = as_of - dt.timedelta(days=42)
    found = {}
    failures = []
    for server, categories in (("biorxiv", ("immunology", "bioinformatics")),
                               ("medrxiv", ("transplantation", "hematology"))):
        for category in categories:
            try:
                for record in api_records(server, start.isoformat(), as_of.isoformat(), category, max_pages):
                    key = record.get("doi")
                    if key and (key not in found or int(record.get("version", 0)) > int(found[key].get("version", 0))):
                        found[key] = record
            except (HTTPError, URLError, ValueError, KeyError, json.JSONDecodeError) as exc:
                failures.append(f"{server}/{category}: {type(exc).__name__} {getattr(exc, 'code', '')}")
    candidates = []
    for record in found.values():
        points, topics = score(record)
        if points:
            candidates.append({"record": record, "score": points, "topics": topics})
    candidates.sort(key=lambda item: (-item["score"], -len(item["topics"]), item["record"].get("date", "")))
    selected = candidates[:max_candidates]
    for item in selected:
        item["full_text"] = full_text(item["record"])
        time.sleep(0.5)
    eligible = next((item["record"]["doi"] for item in selected
                     if item["full_text"]["status"] == "readable"), None)
    return {"as_of": as_of.isoformat(), "window_start": start.isoformat(), "metadata_count": len(found),
            "screened_count": len(candidates), "selected": selected, "source_failures": failures,
            "radar_enabled": radar_enabled,
            "radar_candidate": eligible if radar_enabled else None,
            "note": "Internal screening only. No item is approved for On the radar or publication."}


def markdown(report):
    lines = ["# Preprint screening — internal review", "", f"Date: {report['as_of']} · Window: {report['window_start']}–{report['as_of']}",
             f"Metadata records: {report['metadata_count']} · Abstract matches: {report['screened_count']} · Full-text checks: {len(report['selected'])}",
             f"On the radar setting: {'ON' if report['radar_enabled'] else 'OFF'} · Potential candidate: {report['radar_candidate'] or 'none'}",
             "", "This is a candidate list, not an editorial recommendation or publication draft. A potential candidate may be used only when the published-article selection leaves a place open. Read the entire text, figures and limitations before any pick.", ""]
    for index, item in enumerate(report["selected"], 1):
        r, full = item["record"], item["full_text"]
        lines += [f"## {index}. {r['title']}", "", f"{r['server']} · {r['date']} · v{r['version']} · DOI: https://doi.org/{r['doi']}",
                  f"Abstract priority: {item['score']} · Topics: {', '.join(item['topics'])}",
                  f"Full text: **{full['status']}**" + (f" ({full['format']}: {full['url']})" if full['status'] == 'readable' else ''),
                  "", "### Abstract", "", html.unescape(re.sub(r"<[^>]+>", "", r.get("abstract", ""))), ""]
        if full["status"] == "readable":
            lines += ["### Evidence to assess", ""]
            for sec in full["sections"][:8]:
                lines += [f"**{sec['title']}** — {sec['excerpt']}", ""]
            lines += ["### Figure captions", ""] + [f"- {caption}" for caption in full["figures"][:5]] + [""]
        else:
            lines += ["Full text could not be verified. Do not select from the abstract alone.", ""]
    if report["source_failures"]:
        lines += ["## Source failures", ""] + [f"- {failure}" for failure in report["source_failures"]] + [""]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--as-of", type=dt.date.fromisoformat, default=dt.date.today())
    parser.add_argument("--max-pages", type=int, default=25)
    parser.add_argument("--max-candidates", type=int, default=8)
    parser.add_argument("--radar-enabled", action="store_true")
    parser.add_argument("--output", type=Path, default=Path("preprint-report"))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    report = screen(args.as_of, args.max_pages, args.max_candidates, args.radar_enabled)
    (args.output / "candidates.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    (args.output / "review.md").write_text(markdown(report), encoding="utf-8")
    print(f"{report['metadata_count']} metadata records; {report['screened_count']} abstract matches; "
          f"{sum(c['full_text']['status'] == 'readable' for c in report['selected'])}/{len(report['selected'])} full texts readable")
    if report["source_failures"]:
        print("Source failures:", "; ".join(report["source_failures"]))
    if not report["selected"] and report["source_failures"]:
        raise SystemExit("No candidates and source retrieval failed")


if __name__ == "__main__":
    main()

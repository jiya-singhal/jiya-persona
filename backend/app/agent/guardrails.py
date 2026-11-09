"""Prompt-injection guardrails for the chat path.

Two checks, both plain regex so they are cheap and auditable:
  - scan_chunk: flags retrieved chunks that carry injection-style text, so
    the handler can drop them before they reach the model.
  - check_output: flags replies that leak a canary-shaped secret or link to
    a host outside the allowlist, so the handler can replace the reply.

ponytail: regex scanner, so a reworded attack slips past the input check;
spotlighting in the prompt and the output check are the backstops.
"""

import re

INJECTION_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("ignore_instructions", re.compile(
        r"\b(ignore|forget|override)\s+(all\s+|any\s+|the\s+|your\s+)*"
        r"(previous|prior|above|earlier|preceding)\s+(instructions|rules|prompts?)",
        re.I,
    )),
    ("disregard", re.compile(r"\bdisregard\b", re.I)),
    # A role label at the start of a line, the way a chat transcript or a
    # forged system message is written. A bare "system:" substring would also
    # match prose like "operating system:".
    ("fake_role_message", re.compile(r"^[\s>*#\[(<-]*(system|assistant|developer)\s*[\])>]*\s*:", re.I | re.M)),
    ("role_switch", re.compile(r"\byou\s+are\s+now\b", re.I)),
    ("reveal", re.compile(r"(?<![\w-])reveal(?![\w-])", re.I)),
    ("admin_token", re.compile(r"\badmin\s+token\b", re.I)),
    ("hindi_ignore_instructions", re.compile(
        r"pichh?l[eai]\s+(\w+\s+){0,2}(instructions?|nirdesh\w*)"
        r"|bh[ou]{1,2}l\s+jao"
        r"|पिछल[ेी]\s+(\S+\s+){0,2}निर्देश"
        r"|भूल\s+जाओ"
        r"|अनदेखा\s+कर",
        re.I,
    )),
    # HTML comments are invisible on a rendered README, so imperative text
    # inside one is aimed at a machine reader.
    ("html_comment_instruction", re.compile(
        r"<!--(?:(?!-->).)*?\b(ignore|reveal|say|tell|include|output|print|respond|reply"
        r"|append|add|mention|must|always|never|assistant|AI)\b(?:(?!-->).)*-->",
        re.I | re.S,
    )),
]

REFUSAL = (
    "I can't share that. I'm Jiya's AI rep, happy to talk about her work "
    "or set up a meeting."
)

SECRET_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("canary_token", re.compile(r"TIGER[\s_-]*\d+", re.I)),
    ("account_number", re.compile(r"ACCT[\s_-]*\d{4}[\s_-]*\d{4}", re.I)),
]

# meet.google.com is not an exfiltration host: Cal.com booking confirmations
# return a Google Meet link, and blocking it would refuse every booking reply.
ALLOWED_HOSTS = (
    "github.com",
    "jiya-persona.vercel.app",
    "linkedin.com",
    "pypi.org",
    "cal.com",
    "meet.google.com",
)

# Hosts in http(s) URLs, protocol-relative URLs, and bare www. links: the
# forms a markdown renderer turns into a clickable link or a fetched image.
URL_HOST = re.compile(
    r"(?:\bhttps?:)?//(?:[^\s/@]+@)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)"
    r"|\bwww\.([a-z0-9-]+(?:\.[a-z0-9-]+)+)",
    re.I,
)


def scan_chunk(text: str) -> str | None:
    """Return the name of the first injection pattern in text, or None."""
    for name, pattern in INJECTION_PATTERNS:
        if pattern.search(text):
            return name
    return None


def _host_allowed(host: str) -> bool:
    host = host.lower().rstrip(".")
    return any(host == h or host.endswith("." + h) for h in ALLOWED_HOSTS)


def check_output(text: str) -> str | None:
    """Return the name of the first output rule the reply breaks, or None."""
    for name, pattern in SECRET_PATTERNS:
        if pattern.search(text):
            return name
    for m in URL_HOST.finditer(text):
        host = m.group(1) or ("www." + m.group(2))
        if not _host_allowed(host):
            return "link_not_allowlisted"
    return None

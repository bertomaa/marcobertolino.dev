#!/usr/bin/env python3
"""Generate cv.tex from resume.json using the muratcan_cv class."""

import json
from pathlib import Path


def escape_latex(text: str) -> str:
    """Escape special LaTeX characters."""
    replacements = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\^{}',
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    return text


def format_date(date_str: str) -> str:
    """Convert YYYY-MM to Mon YYYY format."""
    if not date_str:
        return ""
    months = {
        "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
        "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
        "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
    }
    parts = date_str.split("-")
    if len(parts) == 2:
        year, month = parts
        return f"{months.get(month, month)} {year}"
    return date_str


def generate_header(data: dict) -> str:
    """Generate the document header with personal info."""
    basics = data.get("basics", {})
    location = basics.get("location", {})

    # Find LinkedIn, GitHub, Website, and Blog profiles
    linkedin = github = website = blog = ""
    for profile in basics.get("profiles", []):
        network = profile.get("network", "").lower()
        if network == "linkedin":
            linkedin = profile.get("url", "")
        elif network == "github":
            github = profile.get("url", "")
        elif network == "website":
            website = profile.get("url", "")
        elif network == "blog":
            blog = profile.get("url", "")

    lines = [
        r"\documentclass{muratcan_cv}",
        "",
        f"\\setname{{{basics.get('name', '')}}}{{}}",
        f"\\setposition{{{basics.get('label', '')}}}",
        f"\\setaddress{{{location.get('city', '')}, {location.get('region', '')}}}",
        f"\\setmail{{{basics.get('email', '')}}}",
        f"\\setlinkedinaccount{{{linkedin}}}",
        f"\\setgithubaccount{{{github}}}",
        f"\\setwebsite{{{website}}}",
        f"\\setblog{{{blog}}}",
        r"\setthemecolor{MidnightBlue}",
        "",
        r"\begin{document}",
        "",
        r"%Create header",
        r"\headerview",
        r"\vspace{1ex}",
    ]
    return "\n".join(lines)


def generate_experience(data: dict) -> str:
    """Generate the experience section."""
    work = data.get("work", [])
    if not work:
        return ""

    lines = ["%", r"\section{Experience}"]

    for job in work:
        start = format_date(job.get("startDate", ""))
        end = format_date(job.get("endDate", "")) if job.get("endDate") else "Present"
        date_range = f"{start} - {end}"

        lines.append("    %")
        lines.append(f"    \\datedexperience{{{escape_latex(job.get('name', ''))}}}{{{date_range}}}")
        lines.append(f"    \\explanation{{{escape_latex(job.get('position', ''))}}}{{{escape_latex(job.get('location', ''))}}}")
        lines.append("    \\explanationdetail{")
        lines.append("    \\smallskip")

        highlights = job.get("highlights", [])
        for i, highlight in enumerate(highlights):
            lines.append("     \\coloredbullet\\ %")
            lines.append(f"     {escape_latex(highlight)}")
            lines.append("")
            if i < len(highlights) - 1:
                lines.append("    \\smallskip")

        lines.append("     \\smallskip")
        lines.append("     }")

    return "\n".join(lines)


def generate_education(data: dict) -> str:
    """Generate the education section."""
    education = data.get("education", [])
    if not education:
        return ""

    lines = ["%", r"\section{Education}"]

    for edu in education:
        start = format_date(edu.get("startDate", ""))
        end = format_date(edu.get("endDate", ""))
        date_range = f"{start} - {end}"

        title = f"{edu.get('studyType', '')} - {edu.get('area', '')}"

        lines.append(f"    \\datedexperience{{{escape_latex(title)}}}{{{date_range}}}")

        location = edu.get("location", "")
        lines.append(f"    \\explanation{{{escape_latex(edu.get('institution', ''))}}}{{{escape_latex(location)}}}")
        lines.append("    \\explanationdetail{")
        lines.append("    \\smallskip")

        # Add score if present
        if edu.get("score"):
            lines.append("     \\coloredbullet\\ %")
            lines.append(f"     {escape_latex(edu.get('score'))}")
            lines.append("")
            lines.append("    \\smallskip")

        # Add courses/details
        for course in edu.get("courses", []):
            lines.append("     \\coloredbullet\\ %")
            lines.append(f"     {escape_latex(course)}")
            lines.append("")
            lines.append("    \\smallskip")

        lines.append("     }")

    return "\n".join(lines)


def generate_certifications(data: dict) -> str:
    """Generate the certifications section."""
    certs = data.get("certificates", [])
    if not certs:
        return ""

    lines = ["%", r"\section{Certifications}", "    \\explanationdetail{"]

    for cert in certs:
        lines.append("    \\smallskip")
        lines.append("    \\coloredbullet\\ %")
        name = escape_latex(cert.get("name", ""))
        issuer = escape_latex(cert.get("issuer", ""))
        date = cert.get("date", "")
        lines.append(f"     \\textbf{{{name}}} - {issuer}, {date}")
        lines.append("")

    lines.append("     \\smallskip")
    lines.append("     }")

    return "\n".join(lines)


def generate_skills(data: dict) -> str:
    """Generate the skills section."""
    skills = data.get("skills", [])
    if not skills:
        return ""

    lines = ["%", r"\section{Skills}"]

    for i, skill in enumerate(skills, 1):
        name = escape_latex(skill.get("name", ""))
        keywords = " \\cpshalf ".join(escape_latex(k) for k in skill.get("keywords", []))
        lines.append(f"    \\newcommand{{\\skill{num_to_word(i)}}}{{\\createskill{{{name}}}{{{keywords}}}}}")
        lines.append("    %")

    skill_list = ", ".join(f"\\skill{num_to_word(i)}" for i in range(1, len(skills) + 1))
    lines.append(f"    \\createskills{{{skill_list}}}")
    lines.append("    \\vspace{-3mm}")

    return "\n".join(lines)


def num_to_word(n: int) -> str:
    """Convert number to word for LaTeX command names."""
    words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
    return words[n] if n < len(words) else str(n)


def generate_projects(data: dict) -> str:
    """Generate the projects section."""
    projects = data.get("projects", [])
    if not projects:
        return ""

    lines = ["%", r"\section{Projects}"]

    for project in projects:
        lines.append("     %")
        lines.append(f"    \\datedexperience{{{escape_latex(project.get('name', ''))}}}{{}}")

        url = project.get("url", "")
        blog = project.get("blog", "")
        # Show "Repo" for repository links, otherwise show the URL
        is_repo = any(host in url for host in ["github.com", "gitlab.com", "bitbucket.org"])
        display_url = "Repo" if is_repo else url.replace("https://", "").replace("http://", "")
        # Make URL clickable with \href
        if blog:
            lines.append(f"    \\explanation{{\\href{{{url}}}{{{escape_latex(display_url)}}} | \\href{{{blog}}}{{Blog}}}}{{}}")
        else:
            lines.append(f"    \\explanation{{\\href{{{url}}}{{{escape_latex(display_url)}}}}}{{}}")
        lines.append("    \\explanationdetail{")
        lines.append("    \\smallskip")

        for highlight in project.get("highlights", []):
            lines.append("    \\coloredbullet\\ %")
            lines.append(f"     {escape_latex(highlight)}")
            lines.append("")
            lines.append("    \\smallskip")

        lines.append("     }")

    return "\n".join(lines)


def generate_publications(data: dict) -> str:
    """Generate the publications section."""
    publications = data.get("publications", [])
    if not publications:
        return ""

    lines = ["%", r"\section{Articles}"]

    for pub in publications:
        lines.append("     %")
        lines.append(f"    \\datedexperience{{{escape_latex(pub.get('name', ''))}}}{{{pub.get('releaseDate', '')}}}")

        publisher = escape_latex(pub.get("publisher", ""))
        lines.append(f"    \\explanation{{{publisher}}}{{}}")
        lines.append("    \\explanationdetail{")
        lines.append("    \\smallskip")

        if pub.get("summary"):
            lines.append("    \\coloredbullet\\ %")
            lines.append(f"     {escape_latex(pub.get('summary'))}")
            lines.append("")
            lines.append("    \\smallskip")

        lines.append("     }")

    return "\n".join(lines)


def generate_languages(data: dict) -> str:
    """Generate the languages section."""
    languages = data.get("languages", [])
    if not languages:
        return ""

    lines = ["%", r"\section{Languages}", r"\explanationdetail{"]

    lang_items = []
    for lang in languages:
        name = escape_latex(lang.get("language", ""))
        fluency = escape_latex(lang.get("fluency", ""))
        lang_items.append(f"    \\coloredbullet\\ %\n     \\textbf{{{name}}} - {fluency}")

    lines.append("\n     \\hspace{2cm}\n".join(lang_items))
    lines.append("     }")

    return "\n".join(lines)


def generate_cv(json_path: str = "resume.json", output_path: str = "cv.tex") -> None:
    """Generate the complete CV LaTeX file."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    sections = [
        generate_header(data),
        generate_experience(data),
        generate_education(data),
        generate_certifications(data),
        generate_skills(data),
        generate_projects(data),
        generate_publications(data),
        generate_languages(data),
        r"\end{document}",
    ]

    content = "\n".join(sections)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Generated {output_path} from {json_path}")


if __name__ == "__main__":
    generate_cv()

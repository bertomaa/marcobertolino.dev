# CV Building Setup Summary

## Overview

This project generates a professional PDF CV from structured JSON data using LaTeX. The workflow is fully containerized via Docker for reproducibility.

## Architecture

```
resume.json  →  generate_cv.py  →  cv.tex  →  latexmk/XeLaTeX  →  Marco_Bertolino_CV.pdf
```

## Key Files

| File | Purpose |
|------|---------|
| `resume.json` | Source of truth - CV data in JSON Resume format |
| `generate_cv.py` | Python script that converts JSON to LaTeX |
| `cv.tex` | Generated LaTeX file (auto-generated, do not edit directly) |
| `muratcan_cv.cls` | Custom LaTeX class defining CV styling and commands |
| `Dockerfile` | TexLive + Python3 container image |
| `Justfile` | Task runner with build commands |

## Data Source: resume.json

Uses the [JSON Resume](https://jsonresume.org/) schema with sections:
- `basics` - Name, position, contact info, social profiles
- `work` - Employment history with highlights
- `education` - Degrees and institutions
- `certificates` - Professional certifications
- `skills` - Technical skills grouped by category
- `projects` - Personal/open-source projects
- `languages` - Spoken languages
- `publications` - Articles (currently empty)

## Generator: generate_cv.py

Python script that:
1. Reads `resume.json`
2. Escapes special LaTeX characters (`&`, `%`, `$`, `#`, `_`, etc.)
3. Formats dates from `YYYY-MM` to `Mon YYYY`
4. Generates each CV section (experience, education, skills, etc.)
5. Outputs `cv.tex` using the `muratcan_cv` class

## LaTeX Class: muratcan_cv.cls

Custom class based on the article class providing:
- **Header commands**: `\setname`, `\setposition`, `\setmail`, `\setlinkedinaccount`, `\setgithubaccount`, `\setwebsite`, `\setblog`
- **Section formatting**: `\datedexperience`, `\explanation`, `\explanationdetail`
- **Skills table**: `\createskill`, `\createskills`
- **Visual elements**: `\coloredbullet`, `\cps`, `\cpshalf` separators
- **Theme color**: Configurable via `\setthemecolor` (currently MidnightBlue)
- **Fonts**: Noto font family via fontspec

Compiled with **XeLaTeX** (required for fontspec).

## Build Commands (Justfile)

```bash
just                    # Default: build PDF (generate-tex-only + compile)
just docker-build       # Build the Docker image
just generate-tex-only  # Only regenerate cv.tex from resume.json
just build-pdf          # Full build: JSON → TeX → PDF
just clean              # Remove auxiliary files
just clean-all          # Remove all generated files including PDF
just rebuild            # Clean + build
just watch              # Auto-rebuild on file changes (requires entr)
```

## Docker Setup

The `Dockerfile` uses `texlive/texlive:latest` with Python3 added for the generator script. All commands run inside the container with the current directory mounted at `/docs`.

## Workflow

1. **Edit** `resume.json` with your CV data
2. **Run** `just build-pdf` (or just `just`)
3. **Output**: `Marco_Bertolino_CV.pdf`

For continuous development: `just watch` will auto-rebuild on changes to `.json`, `.py`, or `.cls` files.

## Notes

- `cv.tex` is gitignored - always regenerated from `resume.json`
- PDF output is also gitignored
- The generator handles LaTeX special character escaping automatically
- Project links in the Projects section show "Repo" for GitHub/GitLab URLs, otherwise display the domain

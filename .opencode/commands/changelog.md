---
description: Generate changelog entry from git commits between two tags
---

Analyze the git commits between tags $1 and $2 and generate a changelog entry.

The commits to analyze are:
!`git log $1..$2 --pretty=format:"%h %s" --reverse`

## Instructions:

1. Parse each commit message to extract:
   - Commit type (feat, fix, chore, doc, refactor, etc.)
   - Description
   - Issue reference (Rel: #XXX or just #XXX pattern)

2. Categorize commits into these sections based on prefix:
   - **feat:** → "## New Features & Enhancements (Added)"
   - **fix:** → "## Bug Fixes (Fixed)"
   - **chore:** → "## Internal Build System (Under the Hood)"
   - **doc:** → "## Documentation (Changed)"
   - **refactor:** → "## Architectural & Interface Refactoring (Changed)"
   - Other prefixes → "## Other Changes"

3. Format each entry as a markdown list item:
   * Description of change (#issue_number).

4. If no commits have a specific prefix, use a generic section.

5. Generate the full changelog section in this exact format:

```
# Changelog - StructBX $2

## Section Name

* Description of change (#issue_number).

---

```

6. Read the current CHANGELOG.md file content.

7. Prepend the generated content to the beginning of CHANGELOG.md using the edit tool (replace the first line with the new content + old content).

8. Output the generated changelog section to the user.

## Important Rules:
- Maintain the exact same formatting style as existing entries in CHANGELOG.md
- Each section should have items as bullet points starting with *
- Include issue references in parentheses like (#123)
- Add --- separator between sections
- The version number in the header must match $2 exactly

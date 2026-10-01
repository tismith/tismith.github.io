---
layout: post
title: "Giving AI agents a long-term reference with Markdown and GitHub"
date: 2026-10-01 00:00:00 +1000
tags: [ai, markdown, github, obsidian]
---

I use a GitHub repository containing an Obsidian-style archive of Markdown files as a long-term reference for AI agents.

The idea is simple: keep useful context somewhere I can read, edit, and version, then give the agent instructions to consult it when relevant. A new conversation can pick up a project without me having to explain its entire history again.

The chat is where the work happens. The repository is where I keep the things worth carrying forward.

An archive like this can hold project notes, decisions, preferences, useful references, and explanations of why something works the way it does. Those last two are particularly useful. An agent can often discover what exists by reading code, but understanding *why* I chose it usually needs some additional context.

Markdown makes this easy to maintain. I can work with the files in Obsidian, a text editor, or GitHub itself. Links between notes help connect related ideas, and the files remain useful even if I change which AI tools I use.

Git adds a history of changes. If a note becomes inaccurate, I can correct it. If an agent makes an unhelpful edit, I can inspect the diff and revert it.

## What the repository could look like

There is no special schema required. A small archive could start with a directory listing like this:

```text
README.md
index.md
preferences/
    communication.md
    tools-and-workflows.md
projects/
    personal-blog/
        overview.md
        deployment.md
        decisions.md
    garden-planner/
        overview.md
        next-steps.md
reference/
    markdown-conventions.md
    useful-links.md
journal/
    2026-10-01.md
archive/
    retired-project.md
```

This is an example structure, rather than a requirement to organise every vault the same way.

The `README.md` explains what the repository is for and how to use it. The `index.md` links to the main topics, with a sentence describing each one. That gives an agent a useful starting point without needing to read every file.

The project folders hold current context: what I am building, how it works, what we have decided, and what remains to do. Preferences hold reusable guidance, while reference notes capture material that applies across projects. Dated journal entries can record what happened in a session; anything that changes a project's current state should also be reflected in its project notes.

For a question about the blog's deployment, the agent could follow `index.md` to `projects/personal-blog/overview.md`, then read `deployment.md` and the relevant decisions. After a change, it could update those notes and add a link from the index if it creates a new one.

The folder structure helps navigation, but the notes still need to explain themselves. A short summary, a last-reviewed date, and links to related notes make it easier to judge whether a file is relevant and current.

## Giving the agent directions

Putting notes in a repository is only half the setup. The agent also needs to know where to look and when to use them.

Custom prompts or instructions can establish that behaviour. For a chat app such as ChatGPT on mobile, I can give it a standing instruction to consult the archive for questions about my projects and previous decisions, wherever the relevant GitHub connection is available.

A starting prompt might look like this:

> My long-term reference notes are in the GitHub repository `OWNER/REPO`.
>
> When a task depends on my previous work, preferences, or project decisions, consult that repository before answering. Start with the README or index, then read the relevant notes and follow useful links.
>
> Retrieve the files needed for the task rather than loading the whole archive. Tell me which notes informed your answer, and flag anything that appears outdated or contradictory.
>
> When I ask you to save a decision or update the archive, read the existing note first, make a focused change, and report what you changed. Keep confirmed decisions separate from suggestions and unresolved questions.
>
> If you cannot access the repository, say so rather than guessing.

The prompt establishes the workflow. The connected tool provides access. Custom instructions alone do not make a repository available, so I still need to connect GitHub and check that the tools I need are supported in the app I am using.

## Reading and writing through GitHub

With a GitHub plugin that supports the required operations, the archive can become part of the conversation.

I can ask the agent to read the notes for a project before suggesting a change. After we settle on an approach, I can ask it to update the relevant Markdown file or create a new note. Depending on the available tools and permissions, those changes can be committed to a branch and reviewed through a pull request.

For example:

> Read the archive notes for this project and explain why we chose the current deployment approach.

Then, after making a new decision:

> Update the deployment note with what we agreed, including the reason for the change and any remaining questions.

That gives the next session something concrete to retrieve. It also means I can review the saved context using the same tools I already use for code.

## Keeping the archive useful

I want the repository to contain useful reference material, rather than every conversation verbatim.

A short note recording a decision, its reasoning, and the date is often more valuable than a lengthy transcript. Clear filenames and an index help an agent find the right material. Links to supporting sources make the notes easier to check.

The archive still needs maintenance. Old assumptions can become misleading, and an agent's suggestion should not quietly turn into a recorded fact. I try to keep the distinction between “we decided this”, “we might try this”, and “this needs checking” explicit.

This approach gives me continuity that I can inspect and control. I can start a conversation on my phone, return to the work elsewhere, and direct the next agent to the same reference material.

The useful part is having a growing collection of notes that both I and the agent can consult—and a straightforward way to improve those notes as we work.

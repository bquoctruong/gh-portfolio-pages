---
title: "Embracing Claude and learning to learn again: Part 1"
date: 2026-02-03
---

### Introduction
While there's a giant gap between my last post and this current one, the focus of this post is actually my recent descent into using the proper LLM for the right task. Over the course of 3 nights, I've refactored my 3 primary repositories and have been generally impressed as previous attempts were unsuccessful. I decided to hunker down and utilize as much as I can in order to further be bold in my usage, but not ignorant.

### The Blog for the Longest Time
Previously, the blog was built to be hosted on serverless functions. I actually attribute this to a Beyond Fireship [video](https://www.youtube.com/watch?v=cw34KMPSt4k) for introducing the concept to me. While it would have been much, much simpler to host it on an S3 bucket or equivalent, I wanted to challenge myself in utilizing all 3/4 commercial clouds (i.e. GCP, AWS, Azure, OCI) in a meaningful manner. It also taught me a bit about serverless, something I was lacking at the time. The blog would live on a basic Node Docker container, exceptionally overkill for the purpose. However, it opened me up to using it to deploy basic API endpoints, experiment with OTLP and DataDog, creating a Unity WebGL app, and even running the lightest Qwen model I could on serverless! The experience was invaluable and I wouldn't have done it any differently.

Fast forward to the middle of 2025. The blog's cost had risen from $20/month to $40/month, no doubt due to non-human traffic hitting my load balancer I had in front of my GCP Cloud Run instance! I validated this with my Cloudflare dashboard and I surmised that this new traffic was not from people who naturally clicked on the blog. It was time to migrate the blog onto something significantly more lightweight, and I had more intentions to write more posts. I had several issues crop up:

1. The way the blog handled posts was unsustainable and inefficient.
2. My technology choices hampered a smooth transition.
3. I was managing 2 IaCs repositories.

Over the course of several months, I've attempted to refactor all 3 at the same time until I realized I need to atomize the 3 issues into separate work. I've utilized Gemini AI Chat Agent to get a Claude Code-like experience, to lackluster results. It was several of these moments that made me relatively unimpressed with AI-coding assistants for a long time.

### The Learning Moment
Recently, a family member came to me asking ME for advice on how to best utilize AI/LLMs in their day-to-day work. It dawned on me that I may become the primary resource for those asking. I was asked to determine whether or not Gemini, ChatGPT, or Claude Code (specifically, Claude Code) would be the best for their non-technical day-to-day tasking. I responded with Gemini at the time, but also appended the advice to get hands-on experience to come to their own conclusion. That's when I caught myself: I haven't bought a sub to Claude Code for coding assistance. I've been using Gemini for various general questions and while it performs extremely well in general day-to-day in my opinion, it never edged out Claude Code on [llmarena](https://arena.ai/leaderboard) in coding benchmarks. It made me wonder: is the difference so stark? I bought the sub and knew what to do with it.

### The Blog, as of 3 days ago
From osmosis, I was aware of concepts such as (sub)agents, MCP servers, Skills, etc; these were not very accessible in Gemini (sub-agents are in experimental mode as of today and MCP support just came recently). Applying these concepts to Claude immediately, I created 3 agents, connected to the Context7 MCP server, and got to work. I drafted a PLAN.md, a document where I dumped as much context as I could, my target goals, the branches I had attempted work in, etc. I know I can knock out 1. and 2. above given enough context and leeway. The blog was a perfect sandbox to finally let loose and vibe-code a solution while I enjoyed my evening. After giving enough context, having a dialogue with Claude Code using Plan Mode, and giving explicit instructions to delegate and prompt me for validation, I let it go to work. 

Over the course of 3 PRs/branches and 2 evenings running up to my daily/session limit, it was accomplished. This was a task that, if I had given enough time to myself to sit down and refactor, I could have accomplished over several weekends. But in my brain, I knew this was a solved problem that, thrown at the right LLM, could resolve this in approximately 4 hours.

### The Point
The issue was that my choice of LLMs and attempting to utilize them in sub-standard ways (i.e. ChatGPT and Gemini for code assistance, although I have not used Codex) made me weary of utilizing the whole tool altogether. If I wanted to eat soup, I'd use a soup spoon, not a fork nor a knife nor even a table spoon. After utilizing the recommended tool, I had my "aha" moment and felt a wave of relief that somehow, I finally get it.
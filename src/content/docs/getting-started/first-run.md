---
title: First run
description: Your first agent says hello.
section: getting-started
tags: [quickstart]
backlinks: [using-granclaw/chat, getting-started/configure-llm-provider]
---

Your first agent says hello.

## Open the dashboard

With GranClaw running, open `http://localhost:5173` in your browser. You'll land on the agent list — a panel showing every agent you have configured. Out of the box, there's one: `main-agent`. It appears as a card with its name, the model it's assigned to, and a status indicator showing whether the process is running.

The sidebar on the left lists your navigation sections: Chat, Tasks, Logs, and more. The top-right corner has a settings icon for provider configuration. Nothing has happened yet. No messages, no history. You're looking at a clean workspace ready for its first conversation.

## Talk to the default agent

Click the `main-agent` card to open the chat view. You'll see a message input at the bottom of the screen and an empty conversation area above it. Type anything — "Hello, what can you do?" is a good start — and press Enter or click the Send button.

The agent's reply streams in token by token, appearing as it's generated rather than arriving all at once. Watch the text grow in the response area. Tool calls, if the agent makes any, appear inline as they run.

If nothing streams after a few seconds, you need to configure an LLM provider first. See [Configure your LLM provider](/getting-started/configure-llm-provider) to add an API key, then come back here.

## What just happened

GranClaw started a local agent process, sent your message to the LLM you've configured, and streamed the answer back to your browser over a live WebSocket connection. The conversation is saved automatically — close the tab, come back later, and the history is still there. Your agent remembers every message from the moment you first spoke.

**Next:** [Configure your LLM provider](/getting-started/configure-llm-provider)

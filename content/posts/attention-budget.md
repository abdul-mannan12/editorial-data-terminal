---
title: "An attention budget for ordinary days"
date: "2026-11-14"
slug: "attention-budget"
excerpt: "A weekly review of where the hours go, and a gentler way to decide what deserves the next one."
category: "Field notes"
coverImage: "/images/attention.svg"
readTime: 5
featured: false
---

I used to plan a day as if the only scarce resource were time. Eight available hours looked like eight interchangeable containers. Put the difficult work at the top, fit the smaller jobs around it, and the arithmetic should work.

The arithmetic rarely worked. An hour after a demanding conversation is different from an hour after a walk. An hour interrupted six times is different from an hour with the door closed. Treating those hours as equivalent made an orderly calendar and an unreliable plan.

An attention budget is my attempt to account for that difference without turning life into a performance review. It is a small weekly exercise: notice the conditions around useful work, decide what deserves protection, and leave space for being a person.

## Begin with a question you can answer

“Was I productive?” is too broad to help. It invites a judgment about the whole day and rarely produces a useful next step. “What made it easier to begin the work I cared about?” is narrower and more practical.

I keep a short note at the end of a working day. It contains the task that received my best attention, the interruption I could have prevented, and one thing that restored some energy. The note takes less than two minutes. If it becomes another project, I have made it too complicated.

> [!NOTE]
> The time log below is an invented example. It illustrates a reflection method and should not be read as a scientific finding, health recommendation, or report of measured results.

## Look for a pattern, not a score

A fictional five-day log might look like this:

| Day       | Focused work | Unplanned switching | Useful observation                     |
| --------- | -----------: | ------------------: | -------------------------------------- |
| Monday    |   95 minutes |          62 minutes | Messages stayed open all morning       |
| Tuesday   |  140 minutes |          35 minutes | First writing block came before inbox  |
| Wednesday |   80 minutes |          70 minutes | Meetings divided the afternoon         |
| Thursday  |  155 minutes |          28 minutes | A short walk helped with restarting    |
| Friday    |  110 minutes |          42 minutes | Smaller task list felt more manageable |

It would be easy to label Thursday a success and Wednesday a failure. That would miss the point. Wednesday might have contained an important conversation that was worth the fragmented afternoon. The log is useful because it makes a tradeoff visible, not because it ranks the days.

For anyone who enjoys a little code, even the simplest calculation can help distinguish the amount of work from the amount of switching:

```python
days = [
    {"focus": 95, "switching": 62},
    {"focus": 140, "switching": 35},
    {"focus": 80, "switching": 70},
    {"focus": 155, "switching": 28},
    {"focus": 110, "switching": 42},
]

focus_minutes = sum(day["focus"] for day in days)
print(f"Protected attention: {focus_minutes} minutes")
```

The output is descriptive. It does not tell you whether those minutes were valuable or whether you should have worked more.

## Protect one thing before optimizing everything

The most reliable adjustment has been choosing one block each day that belongs to a specific piece of work. Not an abstract ambition such as “make progress,” but an action with a visible beginning: write the opening, inspect the data, sketch the layout, revise the explanation.

I try to prepare the beginning in advance. The document is already open. The next question is written at the top. The browser tabs needed for the task are separated from the ones that belong to everything else. This preparation reduces the small negotiations that make starting feel strangely expensive.

The block does not need to be long. Twenty uninterrupted minutes can be more useful than an impressive two-hour appointment that I spend postponing. If the day changes, I can move the block or reduce its scope without declaring the whole plan ruined.

## Leave an unmeasured part of the day

There is a point where tracking attention begins to consume the attention it was meant to protect. I watch for the moment when I start making choices because they will look better in the log.

A conversation with a friend does not need an efficiency justification. Reading a difficult novel may produce nothing that can be added to a dashboard. Rest is not valuable only because it improves tomorrow's output. These are not gaps in the system. They are reasons to keep the system small.

At the end of the week, I choose one change to try. Perhaps messages stay closed until the first draft is finished. Perhaps two scattered meetings move into the same afternoon. Perhaps the right answer is a shorter list and a little more sleep. The budget is there to support a day that feels inhabitable, not to extract the maximum possible work from it.

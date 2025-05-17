---
title: "COGS Capstone Project"
excerpt: "Enhancing the Perceived Social Presence of Socially Assistive Robots using Reinforcement Learning."
image: "/posts/402/402-training.png" 
tags: ["godot", "python", "AI"]
---

Supervised by Karon MacLean and Bereket Guta at [SPIN](https://www.cs.ubc.ca/labs/spin/) at the University of British Columbia.

---

## Motivation

How can we use machine learning to design AI agents that feel more alive?
Recent studies show that socially assistive robots (SARs) are effective at providing meaningful social interactions to patients in domains like therapy and elder care.
However, some evidence suggests that the quality of these interactions is confounded by a kind of novelty effect.
As users become more accustomed to repeated, hard-coded, behaviors their attributions of social presence decrease, negatively impacting the interaction quality over time.
This pilot study addresses this limitation by investigating reinforcement learning (RL) as a tool for creating more dynamic behaviors for SARs.

---

## Modeling the Interactions

Instead of using a physical robot, our AI agents were represented by simple circles in a virtual environment. This was primarily done to avoid the complexities of a robot, but it had the added benefit of ensuring that any perceptions of the agents were not determined by their appearances alone instead of their behaviors.

---

## Designing Personalities with Reinforcement Learning

In preparation for our experiment, we investigated the feasibility of creating distinct personalities using reinforcement learning.
We trained several AI agents using the Godot game engine and the Sample Factory reinforcement learning library. Each agent was given a different reward function to encourage the emergence of a different "personality" or distinct set of movement patterns.

![training](/posts/402/402-training.png)

Each reward function was comprised of several sub-functions conceptualized on a spectrum from introverted to extroverted.

![](/posts/402/personalities.png)

1. Distance Traveled
    The total ground covered by an agent.

2. Synchronicity
    An abstract measure of similarity between the agent's and participant's movements.

3. Collisions
    How often and how hard the agent collides with its interaction partner.

After training, we found that these simple reward functions led to rich and varied behaviors. The agents were not just moving differently, they began to *feel* different to engage with.

## Bringing the Agents to Life in a Playable Environment

To test how humans perceive these personalities, we built a game environment in Godot. Participants used a PlayStation controller to interact with the AI agents in real time.

![](/posts/402/procedure.png)

We envisioned each session as a social interaction: participants could approach the agents, chase them, or try to communicate through their movements and haptic feedback facilitated by the controller's rumble feature. These unscripted interactions allowed us to investigate whether participants would attribute traits like intent, emotion, and animacy to the agents based on their movement styles.

## Early Insights

The experimental results implied that, even with no facial expressions or dialogue, participants reported feeling that some agents were "shy," "playful," or even "aggressive"—purely from how they moved. We found that participants were able to distinguish between different personality types and that they were associated with different measures of social presence.

![](/posts/402/results.png)

This suggests that personality-based movement patterns, shaped by simple reward functions, can have a strong impact on perceived social presence. This work provides insights on how to design digital characters that feel alive and responsive in games and other digital experiences.

## Future Research

- How does perceived social presence change when the AI Agent adapts to the user over time?

# MuseRock Muse Engine Guide

## Overview

The **Muse Engine** is MuseRock's AI-powered inspiration system. It generates contrasting, thought-provoking ideas rather than generic suggestions, designed to spark your creative thinking.

## Core Philosophy

> **"Give a man an idea, you inspire him for a day. Teach a man to think differently, you inspire him for a lifetime."**

The Muse Engine is built on this principle. Instead of writing for you, it helps you see your work from new angles, generates alternative paths, and challenges your assumptions.

## Divergence Cards

### What Are Divergence Cards?

Divergence Cards are the primary output of the Muse Engine. Each card presents:
- A single, focused idea
- A category tag
- A "why this differs" explanation
- A keep/discard decision

### Card Categories

| Category | Description | Use When |
|----------|-------------|----------|
| **Conflict** | Introduce or escalate tension | When your story needs more stakes |
| **Symbolic** | Add metaphor or deeper meaning | When you want to add layers |
| **Structural** | Reorganize or restructure | When pacing or flow feels off |
| **Character** | Develop or reveal character | When characters feel flat |
| **Worldview** | Expand setting or context | When your world needs more depth |

### Example Card

```
┌─────────────────────────────────────────┐
│  ✨ Conflict                          │
├─────────────────────────────────────────┤
│  What if the security system was a    │
│  decoy? The real security is hidden  │
│  and everyone's been played.         │
├─────────────────────────────────────────┤
│  Why this differs:                   │
│  Turns the heist on its head – the   │
│  characters aren't outsmarting the  │
│  system, they're walking into a trap.│
├─────────────────────────────────────────┤
│  [Keep] [Discard] [Read More]          │
└─────────────────────────────────────────┘
```

## AI Providers

MuseRock supports multiple AI providers, each with different strengths.

### Gemini

**Provider**: Google  
**Models**: gemini-1.5-pro, gemini-1.5-flash  
**Strengths**: 
- Fast response times
- Strong at creative writing
- Good at context understanding
- Multimodal capabilities

### OpenAI

**Provider**: OpenAI  
**Models**: gpt-4o-mini, gpt-4o  
**Strengths**:
- Strong reasoning abilities
- Consistent output quality
- Good at structured responses

### Anthropic

**Provider**: Anthropic  
**Models**: claude-3-haiku, claude-3-sonnet, claude-3-opus  
**Strengths**:
- Excellent at long-form text
- Good at following instructions
- Thoughtful, nuanced responses

### Custom Provider

You can configure a custom provider by specifying:
- API endpoint
- API key
- Model name
- Request format

## Configuration

### Accessing Settings

Press `⌘/Ctrl + ,` or click the settings icon to open the configuration panel.

### Mode Selection

#### Local Mode
- API keys stored in browser localStorage
- Direct API calls from frontend
- No backend required
- Ideal for personal use

#### Cloud Mode
- API keys encrypted server-side (AES-256-GCM)
- API calls routed through backend
- Additional security features
- Ideal for shared environments

### API Key Management

**Adding Keys**:
1. Open Settings
2. Select your provider
3. Enter your API key
4. Click "Confirm"

**Removing Keys**:
1. Open Settings
2. Click "Remove Key" for the provider
3. Confirm removal

**Key Security**:
- Keys are never transmitted except to the AI provider
- In Cloud Mode, keys are encrypted at rest
- You can revoke keys at any time

## Prompt Engineering

### Best Practices for Good Prompts

1. **Be Specific**: Provide context about your current text
2. **Set Expectations**: Tell the AI what kind of ideas you want
3. **Include Context**: Share relevant background information
4. **Focus on Contrast**: Ask for ideas that differ from your current direction

### Example Good Prompts

```
I'm writing a heist scene where the characters are trying to steal
a painting from a museum. They've just disabled the security cameras.

Give me 5 contrasting ideas for what could happen next.
```

```
My protagonist just discovered their mentor has been lying to them.

Generate ideas about different ways they could react – some angry,
some sad, some calculating. Show me contrasting possibilities.
```

### Example Bad Prompts

```
Write the next chapter for me.
```
*Too vague, asks the AI to do your work.*

```
Make this better.
```
*No direction, doesn't specify "better" in what way.*

## Advanced Features

### Using Selected Text

You can select a specific section of text in the editor before generating ideas. The Muse Engine will focus on that section and generate ideas related to it.

**How to use**:
1. Highlight text in the editor
2. Open the Divergence panel
3. Your selected text will appear in the prompt
4. Generate ideas as usual

### Idea Cards History

All cards you generate are saved and can be reviewed later. Access your history from the Divergence panel.

**Features**:
- Filter by category
- Search by keyword
- Review kept vs discarded cards
- Reuse previous ideas

### Batch Generation

You can generate multiple sets of ideas at once:
1. Open Settings
2. Adjust "Number of cards per generation"
3. Generate ideas normally

Recommended: 3-5 cards per generation for quality, 8-10 for quantity.

## Troubleshooting

### No Ideas Generated?

**Checklist**:
1. Verify API key is entered correctly
2. Check your internet connection
3. Try a different provider
4. Clear browser cache and reload

### Ideas Are Too Generic?

**Try**:
1. Select specific text in the editor
2. Make your prompt more specific
3. Ask for contrasting perspectives explicitly
4. Try a different AI provider

### Provider Errors?

**Common issues**:
- **401 Unauthorized**: Invalid API key
- **429 Rate Limited**: Too many requests, wait and try again
- **500 Server Error**: Provider issue, try later
- **Network Error**: Check your internet

### Performance Issues?

**Tips**:
- Use faster models (gemini-1.5-flash, claude-3-haiku)
- Generate fewer cards at once
- Keep prompts concise but informative

## Privacy & Security

### What Data Is Sent?

When you generate ideas:
- Your current editor text
- Your prompt text
- Your selected text (if any)

### What Data Is Stored?

- API keys (encrypted in Cloud Mode)
- Your generated idea cards (locally)
- Usage metrics (anonymous, for improvement)

### What Data Is NOT Stored?

- Your actual writing (unless you explicitly save to cloud)
- Your personal information
- Your API keys in plain text

## Future Enhancements

### Planned Features

- **Idea Card Variations**: Generate multiple takes on the same idea
- **Custom Categories**: Define your own idea categories
- **Idea Relationships**: Show how different ideas connect
- **Export Ideas**: Save cards to Markdown or other formats
- **Collaborative Inspiration**: Share idea cards with others

### Feedback

We'd love to hear from you! If you:
- Get great ideas from the Muse Engine
- Find a problem or bug
- Have feature suggestions

Please reach out via GitHub Issues.

---

*Document updated on: 2026-05-13*
*Version: 1.0*
*Author: MuseRock Team*
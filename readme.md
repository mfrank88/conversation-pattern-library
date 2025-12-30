# Conversation Pattern Library

A comprehensive reference library of conversation design patterns for Ascension's AI-powered healthcare agents and chatbots.

## 🎯 What This Is

This is an interactive tool that documents proven conversational flows for AI agents handling patient interactions. Each pattern includes:

- **Complete dialogue flows** - Exact scripts and response sequences
- **Decision trees** - How the conversation branches based on patient responses
- **Edge cases** - What happens when things don't go as planned
- **Performance metrics** - How well these patterns work in production
- **Implementation notes** - Technical requirements and constraints

Think of it as a design system, but for conversations instead of visual components.

## 🔗 How to Access

**👉 [Open the Conversation Pattern Library](https://mfrank88.github.io/conversation-pattern-library)**

Just click the link above - it opens in your browser. No installation, login, or setup required.

## 📚 What's Currently Available

### Grace (AI Voice Agent)
- **Appointment Verification** - Identity verification and appointment lookup
- **Appointment Cancellation** - Task-based cancellation with safeguards
- **Appointment Rescheduling** - Multi-turn negotiation using the 3-Strike Rule

*More patterns will be added as we expand to web chatbots, Steering Agent, Knowledge Agent, and other conversational AI systems.*

## 👥 Who Should Use This

**Conversation Designers** - Reference when creating new flows or refining existing ones

**Product Managers** - Understand what's been built and what patterns are reusable

**Engineers/Developers** - See exact dialogue requirements and implementation notes

**QA Teams** - Test against documented happy paths and edge cases

**Leadership** - Review conversation design deliverables and understand patient experience

## 🔍 How to Use the Tool

1. **Browse patterns** - Scroll through the pattern cards on the main page
2. **Search** - Type keywords like "cancellation," "3-strike," or "SMS" in the search bar
3. **Expand details** - Click "View Full Pattern" to see complete flows, edge cases, and metrics
4. **Reference in your work** - Use these patterns as templates or requirements

## 🤝 Contributing & Suggesting Updates

Have feedback? Notice something that needs updating? Found an edge case we haven't documented?

**Quick updates:** Slack Marilyn Frank directly

**Detailed suggestions:** 
- Open an issue in this repository
- Include: which pattern, what needs changing, and why
- If you have call monitoring examples or data to support the change, even better

## 🔄 How This Gets Updated

This library is maintained by the Conversation Design team and updated as:
- New patterns are developed and validated
- Existing flows are refined based on production data
- Additional AI agents launch (web chatbot, etc.)
- Edge cases are identified through call monitoring

**Current maintainer:** Marilyn Frank, Sr. Product Communications Designer

## 📖 Background: Why This Exists

Traditional UX methods (wireframes, journey maps) don't work well for conversational AI. Conversation design requires:
- Linguistic precision instead of visual layouts
- Turn-by-turn dialogue specifications
- Edge case documentation for every scenario
- Compliance embedded in every response

This library captures that knowledge in a format that's:
- **Searchable** - Find what you need quickly
- **Reusable** - Don't reinvent proven patterns
- **Scalable** - Applies to new agents and channels
- **Accessible** - Both technical and non-technical teams can use it

## 🏥 Healthcare Context

All patterns in this library prioritize:
- **Patient safety** - "When in doubt, transfer out"
- **HIPAA compliance** - Identity verification and PHI protection
- **Empathy** - Without anthropomorphization
- **Trust** - Through transparency and reliability

## 🛠️ Technical Details

**Built with:** HTML, CSS, JavaScript (vanilla - no frameworks required)

**Hosting:** GitHub Pages

**Browser compatibility:** Works in all modern browsers (Chrome, Firefox, Safari, Edge)

**Mobile-friendly:** Yes - responsive design works on phones and tablets

**Accessibility:** Keyboard navigation supported, semantic HTML structure

## 📧 Questions?

Reach out to **Marilyn Frank** on Slack or email for:
- Questions about specific patterns
- Requests for new patterns to be added
- Feedback on the tool itself
- Help interpreting or implementing a flow

---

*This is a living document. As our conversational AI ecosystem grows, so will this library.*

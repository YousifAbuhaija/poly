# Poly

**Politics, in plain English.**

Poly is a mobile-first web app that helps Gen Z voters understand political issues, simplify legislation, and discover which candidates align with their values. Built for clarity and trust, Poly transforms complex civic information into an engaging, location-aware experience.

## What It Does

- **Vibe Check**: Swipe through political issues to build your values profile without needing deep political knowledge
- **Civic Match**: See which local candidates align with your values based on issue agreement, not party affiliation
- **No-Read Translator**: Paste or upload policy documents and get AI-powered explanations in plain language
- **Ask Poly Chat**: Ask follow-up questions about policies, candidates, or civic topics in a conversational interface
- **Location-Aware**: Enter your ZIP code to see candidates and elections relevant to where you actually vote

## Key Features

- Interactive 3D-style U.S. map landing experience
- Neutral, factual framing focused on values alignment rather than voting recommendations
- Mobile-optimized swipe and tap interactions
- AI-powered policy explanations via Amazon Bedrock
- Local JSON data architecture for reliable demos

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion
- **Build Tool**: Vite
- **Backend**: AWS Lambda, API Gateway, Amazon Bedrock
- **Data**: DynamoDB, local JSON files
- **Testing**: Vitest, Testing Library, Fast-check (property-based testing)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
poly/
├── src/
│   ├── components/       # React components (VibeCheck, CandidateCard, etc.)
│   ├── services/         # Business logic and API services
│   ├── engines/          # Matching and location resolution logic
│   ├── context/          # React context providers
│   ├── data/             # Local JSON data files
│   ├── types/            # TypeScript type definitions
│   └── lambda/           # AWS Lambda functions
├── public/               # Static assets
└── __tests__/            # Unit and property-based tests
```

## Design Philosophy

Poly is built on three core principles:

1. **Neutral & Trustworthy**: Present information factually without political bias
2. **Location-First**: Tie all content to the user's actual voting jurisdiction
3. **Gen Z Native**: Fast, mobile-friendly, and conversational without being gimmicky

## Development

This project uses:

- TypeScript for type safety
- ESLint for code quality
- Vitest for unit testing
- Fast-check for property-based testing
- Tailwind CSS for styling

## License

MIT

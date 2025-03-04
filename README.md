# Screen Time Wrapped

A Spotify Wrapped-like presentation for your screen usage habits, powered by Screenpipe and Gemini AI.

## Features

- Analyzes your screen time usage from the last 24 hours
- Creates a beautiful, interactive presentation with insights about your digital habits
- Shows your most used applications and websites
- Provides personalized insights and recommendations based on your usage patterns

## Prerequisites

- [Screenpipe](https://screenpipe.com/) installed and running on your system
- A Gemini API key (you can get one from [Google AI Studio](https://ai.google.dev/))

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser
5. Enter your Gemini API key when prompted
6. Click "Start My Screen Time Wrapped" to generate your personalized presentation

## How It Works

1. The application uses Screenpipe to collect data about your screen usage
2. It processes this data to extract information about your most used apps, websites, and content
3. The processed data is sent to Gemini AI to generate a personalized, witty presentation
4. The presentation is displayed as a series of slides with insights about your digital habits

## Privacy

- Your screen usage data is processed locally and is not sent to any external servers except Gemini AI
- Your Gemini API key is stored in your browser's localStorage and is only used to generate the presentation
- No data is permanently stored or shared with third parties

## Technologies Used

- Next.js
- React
- Tailwind CSS
- Framer Motion
- Screenpipe
- Gemini AI

## License

MIT

<!-- <img width="1312" alt="screenshot of component playground" src="https://github.com/user-attachments/assets/3e5abd07-0a3c-4c3b-8351-5107beb4fb10"> -->

## features

- **interactive component display**: view rendered components in action
- **code inspection**: examine the full source code of each component
- **raw output**: see the raw api responses and data
- **ai prompt visibility**: view the prompts and context used to generate components
- **collapsible interface**: toggle component visibility for a cleaner workspace

## usage

the playground allows you to:

1. view rendered components in their intended state
2. inspect the raw output from api calls
3. study the complete component code
4. examine the ai prompts and context used to generate components

## component structure

each playground card includes:
- component title and collapsible interface
- tabs for different views (rendered output, raw output, code, ai prompt)
- copy functionality for sharing prompts and context

## getting started

1. install this pipe from UI and play with it
2. follow docs to create your pipe (it will create this app) (https://docs.screenpi.pe/docs/plugins)
3. modify code from ready-to-use-examples directory


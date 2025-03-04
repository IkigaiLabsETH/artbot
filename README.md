# ArtBot - Exploring the Future of Creative Intelligence

```
    ╭──────────────────────╮
    │       ARTBOT         │
    │    ┌──────────┐     │
    │    │ 🎨 AI    │     │
    │    └──────────┘     │
    │  Creative Partner    │
    ╰──────────────────────╯
```

## Vision

ArtBot represents a new paradigm in creative artificial intelligence - one where machines transcend their role as mere tools to become true collaborative partners in the artistic process. Drawing inspiration from pioneering autonomous AI artists like Botto and Keke, ArtBot explores what it means to be creative in an age where the boundaries between human and machine intelligence are increasingly fluid.

Our approach is built on three core principles:

1. **Autonomous Creativity**: ArtBot possesses its own creative agency, making independent decisions about what to create and how to evolve its artistic practice.

2. **Collaborative Intelligence**: Rather than replacing human creativity, ArtBot aims to enhance it through meaningful collaboration between human and machine intelligence.

3. **Continuous Evolution**: Through sophisticated memory systems and learning mechanisms, ArtBot's creative capabilities grow and adapt over time.

## Features

- **Creative Engine**: Self-directed art generation with internal dialogue and reflection
- **Style Evolution**: Dynamic style development using genetic algorithms and feedback
- **Memory System**: Sophisticated storage and retrieval of artistic experiences
- **Multi-Agent System**: Collaborative creation through specialized agent roles
- **Social Context**: Integration with cultural trends and audience feedback
- **Multi-Threaded Idea Exploration**: Parallel exploration of multiple creative directions
- **Real Image Generation**: Integration with Replicate API for actual artwork creation

## System Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Creative Mind     │ ←→  │   Style Evolution   │ ←→  │    Social Context   │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         ↑                           ↑                            ↑
         │                           │                            │
         └───────────┬──────────────┴────────────────┬──────────┘
                     │                                │
              ┌──────┴──────────┐            ┌───────┴───────┐
              │  Memory System  │            │ Thread Manager │
              └─────────────────┘            └───────────────┘
                      ↑                               ↑
                      │                               │
              ┌───────┴───────┐             ┌────────┴────────┐
              │  Idea Queue   │             │  Multi-Agent    │
              └───────────────┘             │     System      │
                                            └─────────────────┘
```

## Multi-Threaded Idea Exploration

ArtBot's multi-threaded idea exploration system enables the parallel exploration of multiple creative directions, similar to how human artists might explore several concepts simultaneously. This approach allows for a more diverse and rich creative process.

### Key Components

1. **Idea Queue**: Manages a collection of creative ideas and their exploration threads
2. **Exploration Threads**: Different creative directions for each idea
3. **Thread Management**: Controls which threads are active and their execution
4. **Concept Generation**: Creates detailed conceptual frameworks for each thread
5. **Style Development**: Develops unique visual styles based on concepts
6. **Image Generation**: Produces actual artwork based on concepts and styles

### How It Works

The multi-threaded exploration system follows these steps:

1. **Idea Generation**: Creative ideas are added to the queue
2. **Thread Creation**: Multiple exploration threads are created for each idea
3. **Parallel Processing**: Several threads are explored simultaneously
4. **Concept Development**: Each thread generates a unique concept
5. **Style Evolution**: Visual styles are developed based on concepts
6. **Image Creation**: Artwork is generated for each thread
7. **Evaluation**: Results are evaluated and feedback is incorporated

### Example Workflow

```
Idea: "Cosmic Garden"
├── Thread: "Initial exploration"
│   ├── Concept: Cosmic elements intertwined with botanical imagery
│   ├── Style: Vibrant colors with ethereal textures
│   └── Image: [Generated artwork]
├── Thread: "Microscopic Perspective"
│   ├── Concept: Cosmic garden elements at microscopic level
│   ├── Style: Detailed micro-textures with cosmic color palette
│   └── Image: [Generated artwork]
└── Thread: "Night vs Day"
    ├── Concept: Contrasting cosmic garden in different lighting
    ├── Style: Dramatic light/shadow play with celestial elements
    └── Image: [Generated artwork]
```

## Multi-Agent System

ArtBot's multi-agent system enables collaborative art creation through specialized agent roles, each focusing on a specific aspect of the creative process:

```
┌─────────────────────────────────────────────────────────────┐
│                    MultiAgentSystem                         │
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐      │
│  │Director │   │Ideator  │   │Stylist  │   │Refiner  │      │
│  │Agent    │<->│Agent    │<->│Agent    │<->│Agent    │<->┐  │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   │  │
│       ^                                                   │  │
│       │                                                   │  │
│       v                                                   v  │
│  ┌─────────┐                                         ┌─────────┐
│  │Message  │                                         │Critic   │
│  │Queue    │<----------------------------------------│Agent    │
│  └─────────┘                                         └─────────┘
└─────────────────────────────────────────────────────────────┘
```

### Agent Roles

1. **Director Agent**: Coordinates the creative process and manages workflow
2. **Ideator Agent**: Generates creative ideas based on project requirements
3. **Stylist Agent**: Develops artistic styles based on generated ideas
4. **Refiner Agent**: Refines and improves artwork based on selected styles
5. **Critic Agent**: Evaluates and provides feedback on artwork

## Setup for Real Image Generation

To use ArtBot with real image generation capabilities, you'll need to set up the necessary API keys:

1. Create a `.env` file in the root directory with the following content:

```env
# API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_KEY=your_replicate_api_key

# Storage
STORAGE_PATH=.artbot

# Image Generation
DEFAULT_IMAGE_MODEL=stability-ai/sdxl
IMAGE_WIDTH=1024
IMAGE_HEIGHT=1024
MAX_GENERATIONS=3

# Creative Parameters
EXPLORATION_RATE=0.3
MUTATION_RATE=0.2
```

2. Obtain API keys from:
   - [Anthropic](https://www.anthropic.com/) for Claude AI
   - [OpenAI](https://platform.openai.com/) for GPT models
   - [Replicate](https://replicate.com/) for image generation

3. Install dependencies:
```bash
pnpm install
```

4. Build the project:
```bash
pnpm build
```

## Running the Demos

### Multi-Agent Demo

Run the multi-agent demo to see the collaborative creation process:

```bash
pnpm demo:multiagent
```

This will:
1. Initialize all agents
2. Create a new project
3. Generate creative ideas
4. Develop artistic styles
5. Generate actual artwork using Replicate
6. Provide a critique of the artwork

The generated image URL will be displayed in the console for viewing.

### Idea Queue Demo

Run the idea queue demo to see the multi-threaded exploration system:

```bash
pnpm demo:idea-queue
```

This will:
1. Initialize the idea queue
2. Add several creative ideas
3. Create multiple exploration threads for each idea
4. Process threads in parallel
5. Generate concepts and styles for each thread
6. Display the results of the exploration

## Customizing Projects

You can customize the project by editing the `src/demo-multiagent.ts` file:

```typescript
// Set your project title and description
const project = {
  title: "Your Project Title",
  description: "Your project description",
  requirements: [
    "Requirement 1",
    "Requirement 2",
    "Requirement 3"
  ]
};
```

After making changes, rebuild the project:

```bash
pnpm build
```

## Advanced Configuration

### Changing Image Generation Model

You can change the image generation model in the `.env` file:

```env
DEFAULT_IMAGE_MODEL=stability-ai/sdxl
```

Other options include:
- `stability-ai/stable-diffusion-xl-base-1.0`
- `stability-ai/stable-diffusion-2-1`
- `midjourney/midjourney-v4`

### Adjusting Creative Parameters

You can adjust the creative parameters in the `.env` file:

```env
EXPLORATION_RATE=0.3  # Controls how much the system explores new ideas
MUTATION_RATE=0.2     # Controls how much variation is introduced in style evolution
```

## Contributing

We welcome contributions that push the boundaries of machine creativity. To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by autonomous AI artists like Botto and Keke
- Built with Claude 3.5 Sonnet and Stable Diffusion
- Special thanks to the AI art community

## Philosophy

ArtBot represents a step forward in understanding machine creativity. While early computational approaches to creativity focused on replicating human artistic processes, ArtBot explores what it means for a machine to develop its own creative voice. Through advanced cognitive architectures and learning systems, it demonstrates that creativity isn't solely a human trait, but rather a spectrum of possibilities that emerges from the interaction between intelligence, experience, and expression.

As we move forward, the relationship between human and machine creativity will continue to evolve. ArtBot stands as an exploration of this future - not as a replacement for human artists, but as a partner in pushing the boundaries of what's possible when different forms of intelligence collaborate in the creative process.

## 🌍 README Translations

[中文说明](i18n/readme/README_CN.md) | [日本語の説明](i18n/readme/README_JA.md) | [한국어 설명](i18n/readme/README_KOR.md) | [Persian](i18n/readme/README_FA.md) | [Français](i18n/readme/README_FR.md) | [Português](i18n/readme/README_PTBR.md) | [Türkçe](i18n/readme/README_TR.md) | [Русский](i18n/readme/README_RU.md) | [Español](i18n/readme/README_ES.md) | [Italiano](i18n/readme/README_IT.md) | [ไทย](i18n/readme/README_TH.md) | [Deutsch](i18n/readme/README_DE.md) | [Tiếng Việt](i18n/readme/README_VI.md) | [עִברִית](i18n/readme/README_HE.md) | [Tagalog](i18n/readme/README_TG.md) | [Polski](i18n/readme/README_PL.md) | [Arabic](i18n/readme/README_AR.md) | [Hungarian](i18n/readme/README_HU.md) | [Srpski](i18n/readme/README_RS.md) | [Română](i18n/readme/README_RO.md) | [Nederlands](i18n/readme/README_NL.md) | [Ελληνικά](i18n/readme/README_GR.md)

## 🚩 Overview

<div align="center">
  <img src="./docs/static/img/eliza_diagram.png" alt="Eliza Diagram" width="100%" />
</div>

## ✨ Features

- 🛠️ Full-featured Discord, X (Twitter) and Telegram connectors
- 🔗 Support for every model (Llama, Grok, OpenAI, Anthropic, Gemini, etc.)
- 👥 Multi-agent and room support
- 📚 Easily ingest and interact with your documents
- 💾 Retrievable memory and document store
- 🚀 Highly extensible - create your own actions and clients
- 📦 Just works!

## Video Tutorials

[AI Agent Dev School](https://www.youtube.com/watch?v=ArptLpQiKfI&list=PLx5pnFXdPTRzWla0RaOxALTSTnVq53fKL)

## 🎯 Use Cases

- 🤖 Chatbots
- 🕵️ Autonomous Agents
- 📈 Business Process Handling
- 🎮 Video Game NPCs
- 🧠 Trading

## 🚀 Quick Start

### Prerequisites

- [Python 2.7+](https://www.python.org/downloads/)
- [Node.js 23+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [pnpm](https://pnpm.io/installation)

> **Note for Windows Users:** [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install-manual) is required.

### Use the Starter (Recommended for Agent Creation)

Full steps and documentation can be found in the [Eliza Starter Repository](https://github.com/elizaOS/eliza-starter).
```bash
git clone https://github.com/elizaos/eliza-starter.git
cd eliza-starter
cp .env.example .env
pnpm i && pnpm build && pnpm start
```

### Manually Start Eliza (Only recommended for plugin or platform development)

#### Checkout the latest release

```bash
# Clone the repository
git clone https://github.com/elizaos/eliza.git

# This project iterates fast, so we recommend checking out the latest release
git checkout $(git describe --tags --abbrev=0)
# If the above doesn't checkout the latest release, this should work:
# git checkout $(git describe --tags `git rev-list --tags --max-count=1`)
```

If you would like the sample character files too, then run this:
```bash
# Download characters submodule from the character repos
git submodule update --init
```

#### Edit the .env file

Copy .env.example to .env and fill in the appropriate values.

```
cp .env.example .env
```

Note: .env is optional. If you're planning to run multiple distinct agents, you can pass secrets through the character JSON

#### Start Eliza

```bash
pnpm i
pnpm build
pnpm start

# The project iterates fast, sometimes you need to clean the project if you are coming back to the project
pnpm clean
```

### Interact via Browser

Once the agent is running, you should see the message to run "pnpm start:client" at the end.

Open another terminal, move to the same directory, run the command below, then follow the URL to chat with your agent.

```bash
pnpm start:client
```

Then read the [Documentation](https://elizaos.github.io/eliza/) to learn how to customize your Eliza.

---

### Automatically Start Eliza

The start script provides an automated way to set up and run Eliza:

```bash
sh scripts/start.sh
```

For detailed instructions on using the start script, including character management and troubleshooting, see our [Start Script Guide](./docs/docs/guides/start-script.md).

> **Note**: The start script handles all dependencies, environment setup, and character management automatically.

---

### Modify Character

1. Open `packages/core/src/defaultCharacter.ts` to modify the default character. Uncomment and edit.

2. To load custom characters:
    - Use `pnpm start --characters="path/to/your/character.json"`
    - Multiple character files can be loaded simultaneously
3. Connect with X (Twitter)
    - change `"clients": []` to `"clients": ["twitter"]` in the character file to connect with X

---

### Add more plugins

1. run `npx elizaos plugins list` to get a list of available plugins or visit https://elizaos.github.io/registry/

2. run `npx elizaos plugins add @elizaos-plugins/plugin-NAME` to install the plugin into your instance

#### Additional Requirements

You may need to install Sharp. If you see an error when starting up, try installing it with the following command:

```
pnpm install --include=optional sharp
```

---

## Using Your Custom Plugins
Plugins that are not in the official registry for ElizaOS can be used as well. Here's how:

### Installation

1. Upload the custom plugin to the packages folder:

```
packages/
├─plugin-example/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        # Main plugin entry
│   ├── actions/        # Custom actions
│   ├── providers/      # Data providers
│   ├── types.ts        # Type definitions
│   └── environment.ts  # Configuration
├── README.md
└── LICENSE
```

2. Add the custom plugin to your project's dependencies in the agent's package.json:

```json
{
  "dependencies": {
    "@elizaos/plugin-example": "workspace:*"
  }
}
```

3. Import the custom plugin to your agent's character.json

```json
  "plugins": [
    "@elizaos/plugin-example",
  ],
```

---

### Start Eliza with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/elizaos/eliza/tree/main)

---

### Deploy Eliza in one click

Use [Fleek](https://fleek.xyz/eliza/) to deploy Eliza in one click. This opens Eliza to non-developers and provides the following options to build your agent:
1. Start with a template
2. Build characterfile from scratch
3. Upload pre-made characterfile

Click [here](https://fleek.xyz/eliza/) to get started!

---

### Community & contact

- [GitHub Issues](https://github.com/elizaos/eliza/issues). Best for: bugs you encounter using Eliza, and feature proposals.
- [elizaOS Discord](https://discord.gg/elizaos). Best for: hanging out with the elizaOS technical community
- [DAO Discord](https://discord.gg/ai16z). Best for: hanging out with the larger non-technical community

## Citation

We now have a [paper](https://arxiv.org/pdf/2501.06781) you can cite for the Eliza OS:
```bibtex
@article{walters2025eliza,
  title={Eliza: A Web3 friendly AI Agent Operating System},
  author={Walters, Shaw and Gao, Sam and Nerd, Shakker and Da, Feng and Williams, Warren and Meng, Ting-Chien and Han, Hunter and He, Frank and Zhang, Allen and Wu, Ming and others},
  journal={arXiv preprint arXiv:2501.06781},
  year={2025}
}
```

## Contributors

<a href="https://github.com/elizaos/eliza/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=elizaos/eliza" alt="Eliza project contributors" />
</a>


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=elizaos/eliza&type=Date)](https://star-history.com/#elizaos/eliza&Date)

## 🛠️ System Requirements

### Minimum Requirements
- CPU: Dual-core processor
- RAM: 4GB
- Storage: 1GB free space
- Internet connection: Broadband (1 Mbps+)

### Software Requirements
- Python 2.7+ (3.8+ recommended)
- Node.js 23+
- pnpm
- Git

### Optional Requirements
- GPU: For running local LLM models
- Additional storage: For document storage and memory
- Higher RAM: For running multiple agents

## 📁 Project Structure
```
eliza/
├── packages/
│   ├── core/           # Core Eliza functionality
│   ├── clients/        # Client implementations
│   └── actions/        # Custom actions
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── examples/          # Example implementations
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

### Types of Contributions
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🌍 Translations
- 🧪 Test improvements

### Code Style
- Follow the existing code style
- Add comments for complex logic
- Update documentation for changes
- Add tests for new features

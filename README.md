# WXT X Comments

A browser extension that enhances your X (formerly Twitter) experience by providing additional comment features.

## Features

- Custom comment functionality for X posts
- Modern and clean popup interface
- Multiple icon sizes support (16px, 24px, 48px)

## Development

This project is built using:
- [WXT (Web Extension Tools)](https://wxt.dev/)
- TypeScript
- React
- Tailwind CSS

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [your-repository-url]
cd wxt-x-comments
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

### Development Commands

```bash
# Start development server
npm run dev
# or
yarn dev

# Build for production
npm run build
# or
yarn build
```

### Project Structure

```
├── public/
│   └── icon/          # Extension icons
├── src/
│   ├── entrypoints/   # Extension entry points
│   │   ├── popup/     # Popup UI components
│   │   └── x.content  # Content scripts
│   └── messages.ts    # Message handling
├── wxt.config.ts      # WXT configuration
├── tailwind.config.js # Tailwind CSS configuration
└── postcss.config.js  # PostCSS configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)
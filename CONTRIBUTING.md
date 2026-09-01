# Contributing to Outreacio

Thank you for your interest in contributing to Outreacio. This document outlines the process for proposing changes, submitting pull requests, and maintaining code quality.

---

## Getting Started

To set up a local development environment:

1. Clone your fork of the repository:
   ```bash
   git clone https://github.com/DarkPegasus24/Outreacio.git
   cd Outreacio
   ```

2. Install dependencies for both the root, backend, and frontend packages:
   ```bash
   npm run install-all
   ```

3. Start both the backend and frontend dev servers concurrently:
   ```bash
   npm run dev
   ```

The frontend dashboard will be available at `http://localhost:5173` and the backend API will run on `http://localhost:5000`.

---

## Project Structure

- `outreacio-frontend/`: React application powered by Vite, containing the user interface, component hierarchy, and design system.
- `outreacio-backend/`: Node.js Express server handling Gmail Nodemailer transports, batch processing, rate limiting, and server-sent event streams.

Refer to the project structure tree in [README.md](./README.md) for detailed file locations.

---

## Making Changes

1. Create a descriptive feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make focused, logical changes with clear commit messages following conventional commit style (for example, `feat:`, `fix:`, `docs:`, `style:`).

3. Verify that the application builds and functions properly locally without runtime or console errors.

4. Push your branch to your fork and open a Pull Request against the `main` branch. Provide a clear description of the problem solved or feature added.

---

## Code Style

- **Frontend:** Use functional React components with standard hooks (`useState`, `useEffect`, `useRef`).
- **Styling:** Adhere to the established CSS token system in `outreacio-frontend/src/index.css` using CSS custom properties. Avoid introducing third-party utility CSS frameworks unless explicitly agreed upon.
- **Copy and Content:** Maintain plain, professional language across all UI components and documentation. Do not add inline emojis or decorative unicode characters in user-facing text.
- **Backend:** Maintain clean async/await patterns with proper error handling and CSRF validation on mutating routes.

---

## Reporting Bugs and Requesting Features

To report a bug or request an enhancement:

- Open an issue on the GitHub repository issue tracker.
- For bug reports, include reproduction steps, expected vs. actual behavior, and relevant console or server logs.
- For security-sensitive issues, refer to [SECURITY.md](./SECURITY.md) instead of creating a public issue.

---

## Code of Conduct

All contributors and maintainers are expected to maintain a respectful, constructive, and welcoming environment. Harassment, discriminatory language, or abusive behavior in issues, pull requests, or discussions will not be tolerated.

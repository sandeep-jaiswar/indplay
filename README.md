# IndPlay: A Next.js YouTube-like Video Sharing Platform

IndPlay is a feature-rich video sharing platform, similar to YouTube, built with a robust and scalable architecture using the Next.js Enterprise Boilerplate. It aims to provide users with a seamless experience for uploading, sharing, and discovering video content.

This project leverages a production-ready template to ensure a solid foundation, incorporating carefully selected technologies and a ready-to-go infrastructure to facilitate the development of a high-quality, enterprise-grade video platform efficiently.

## Core Concept: Building a YouTube-like Experience

The primary goal of IndPlay is to create a dynamic and engaging environment for video content. Key aspects of this vision include:

- **Video Upload and Processing:** Allowing users to easily upload videos, with future considerations for various processing and encoding needs.
- **Content Discovery:** Implementing features for users to browse, search, and discover videos through categories, recommendations, and trending sections.
- **User Interaction:** Enabling comments, likes, subscriptions, and user channels to foster a community.
- **Scalable Infrastructure:** Building on a foundation designed for growth to handle increasing numbers of users and videos.

<a href="https://blazity.com/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/assets/blazity-logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="/assets/blazity-logo-light.svg">
  <img alt="Original Boilerplate by Blazity" align="right" height="60" src="/assets/blazity-logo-light.svg">
</picture>
</a>

> [!NOTE] > This project started from the **Next.js Enterprise Boilerplate by Blazity**, a group of Next.js architects. Their work provided a streamlined foundation with high-impact features that maximize developer productivity. For information on the original boilerplate, contact Blazity at [contact@blazity.com](https://blazity.com).

## Documentation (Boilerplate Foundation)

The underlying Next.js Enterprise Boilerplate has separate documentation that explains its original functionality, core business values, technical decisions, and architectural diagrams.

We encourage you to [visit the original docs (docs.blazity.com)](https://docs.blazity.com) to learn more about the foundational template.

## Integrated features (From the Next.js Enterprise Boilerplate)

IndPlay benefits from the comprehensive features of the boilerplate it was built upon:

- [Next.js 15](https://nextjs.org/) - Performance-optimized configuration using App Directory
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework for efficient UI development
- [ESlint 9](https://eslint.org/) and [Prettier](https://prettier.io/) - Code consistency and error prevention
- [Corepack](https://github.com/nodejs/corepack) & [pnpm](https://pnpm.io/) as the package manager - For project management without compromises
- [Strict TypeScript](https://www.typescriptlang.org/) - Enhanced type safety with carefully crafted config and [ts-reset](https://github.com/total-typescript/ts-reset) library
- [GitHub Actions](https://github.com/features/actions) - Pre-configured workflows including bundle size and performance tracking
- Perfect Lighthouse score - Optimized performance metrics
- [Bundle analyzer](https://www.npmjs.com/package/@next/bundle-analyzer) - Monitor and manage bundle size during development
- Testing suite - [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/react), and [Playwright](https://playwright.dev/) for comprehensive testing
- [Storybook](https://storybook.js.org/) - Component development and documentation
- Advanced testing - Smoke and acceptance testing capabilities
- [Conventional commits](https://www.conventionalcommits.org/) - Standardized commit history management
- [Observability](https://opentelemetry.io/) - Open Telemetry integration
- [Absolute imports](https://nextjs.org/docs/advanced-features/module-path-aliases) - Simplified import structure
- [Health checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) - Kubernetes-compatible monitoring
- (Previously Radix UI, CVA - may have been removed or replaced during development)
- [Renovate BOT](https://www.whitesourcesoftware.com/free-developer-tools/renovate) - Automated dependency and security updates
- [Patch-package](https://www.npmjs.com/package/patch-package) - External dependency fixes without compromises
- Component relationship tools - Graph for managing coupling and cohesion
- [Semantic Release](https://github.com/semantic-release/semantic-release) - Automated changelog generation
- [T3 Env](https://env.t3.gg/) - Streamlined environment variable management

### Infrastructure & deployments (From Boilerplate)

IndPlay can leverage the deployment strategies defined by the original boilerplate.

#### Vercel

Easily deploy your Next.js app with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=github&utm_campaign=next-enterprise) by clicking the button below:

[![Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=YOUR_GITHUB_REPO_URL_HERE) <!-- TODO: Update this URL -->

#### Custom cloud infrastructure

The **Next.js Enterprise Boilerplate** offers dedicated infrastructure as code (IaC) solutions built with Terraform.

Learn more in the [original documentation (docs.blazity.com)][docs] for quickstart deployment guides.

#### Available cloud providers and their features (From Boilerplate):

- **AWS (Amazon Web Services)**
  - Automated provisioning of AWS infrastructure
  - Scalable & secure setup using:
    - VPC - Isolated network infrastructure
    - Elastic Container Service (ECS) - Container orchestration
    - Elastic Container Registry (ECR) - Container image storage
    - Application Load Balancer - Traffic distribution
    - S3 + CloudFront - Static asset delivery and caching
    - AWS WAF - Web Application Firewall protection
    - Redis Cluster - Caching
  - CI/CD ready - Continuous integration and deployment pipeline

_... more coming soon (from original boilerplate)_

### Team & maintenance (Boilerplate Origin)

The foundational **Next.js Enterprise Boilerplate** is backed and maintained by [Blazity](https://blazity.com).

#### Active maintainers (Original Boilerplate)

- Igor Klepacki ([neg4n](https://github.com/neg4n)) - Open Source Software Developer
- Tomasz Czechowski ([tomaszczechowski](https://github.com/tomaszczechowski)) - Solutions Architect & DevOps
- Jakub Jabłoński ([jjablonski-it](https://github.com/jjablonski-it)) - Head of Integrations

#### All-time contributors (Original Boilerplate)

[bmstefanski](https://github.com/bmstefanski)

## Project Specific Development (IndPlay)

This section will detail the ongoing development, specific features implemented for IndPlay (like the phone login), and future roadmap items unique to this YouTube-like platform.

*(TODO: Add details about current IndPlay features, architecture choices, and roadmap)*

## License

MIT

[docs]: https://docs.blazity.com/next-enterprise/deployments/enterprise-cli

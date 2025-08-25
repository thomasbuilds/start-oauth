## Reporting Issues

If you find a bug or have an idea for improvement, please [open an issue](https://github.com/thomasbuilds/start-oauth/issues) on GitHub. Provide as much detail as possible, including steps to reproduce the issue if applicable.

## Adding Providers

To add support for a new OAuth provider

1. Duplicate an existing provider file (e.g. [`src/providers/google.ts`](src/providers/google.ts))
2. Update the endpoints, configuration options, and any provider-specific links
3. Ensure your implementation aligns with the structure and flow of existing providers
4. Submit a pull request with your changes

## Pull Requests

Before submitting a pull request

- Ensure your code adheres to the project's coding style (`npm run format`)
- Test your changes thoroughly to avoid breaking existing functionality
- Update documentation if your contribution affects usage or configuration

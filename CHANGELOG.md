# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-25

### Added
- Initial release.
- Automatic SSH password fill via KeePass — matches entries by `ssh://host:port` URL field.
- Automatic TOTP generation and fill for keyboard-interactive MFA prompts (Google Authenticator, etc.).
- Full auto-submit: both password and TOTP panels are submitted without user interaction.
- Master password stored securely in the OS keychain (macOS Keychain / libsecret / Windows Credential Manager) via `keytar` — never written to disk in plaintext.
- KDBX4 support via `hash-wasm` (argon2) + `kdbxweb`.
- Live database reload: `fs.watch` detects `.kdbx` file changes and clears the cache automatically — no Tabby restart needed.
- Entry selector: when multiple KeePass entries share the same URL, Tabby's built-in selector UI is shown to let the user choose.
- Settings tab: configure `.kdbx` file path, master password, and cache TTL from Tabby Settings.

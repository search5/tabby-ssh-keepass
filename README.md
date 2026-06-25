# tabby-keepass-ssh

A [Tabby](https://tabby.sh) plugin that automatically fills SSH passwords and TOTP codes from a KeePass database during keyboard-interactive authentication — no manual copy-paste required.

## Features

- **Password auto-fill** — matches KeePass entries by `ssh://host:port` URL and pre-fills the password field automatically
- **TOTP auto-fill** — generates the current TOTP code from the KeePass entry and submits it automatically
- **Full auto-submit** — both password and TOTP panels are submitted without any user interaction
- **Secure master password** — stored in the OS keychain (macOS Keychain / libsecret / Windows Credential Manager), never written to disk in plaintext
- **KDBX4 support** — argon2 key derivation via `hash-wasm`
- **Live reload** — detects `.kdbx` file changes via `fs.watch` and clears the cache automatically
- **Duplicate URL handling** — when multiple entries share the same URL, Tabby's selector UI lets you choose

## Prerequisites

- [Tabby](https://tabby.sh) with the `tabby-ssh` plugin
- A KeePass database (`.kdbx`) with SSH entries

## KeePass entry format

Each SSH entry must have its **URL** field set to:

```
ssh://hostname
ssh://hostname:port
```

Examples:

| Host | Port | URL field |
|------|------|-----------|
| `192.168.1.10` | `22` | `ssh://192.168.1.10` |
| `my-server.example.com` | `2222` | `ssh://my-server.example.com:2222` |

### TOTP setup

If the SSH server requires TOTP (e.g. Google Authenticator), store the TOTP secret in the same entry using any of these field names:

| Field name | Format | Created by |
|---|---|---|
| `otp` | `otpauth://totp/...?secret=BASE32SECRET` | KeePassXC |
| `TimeOtp-Secret-Base32` | raw base32 secret | KeePass 2.47+ built-in TOTP |
| `TOTP Seed` | raw base32 secret | Legacy KeePass TOTP plugin |

## Installation

### Option A — Tabby Plugin Manager (recommended)

Search for `tabby-keepass-ssh` in **Tabby Settings → Plugins** and click Install. Restart Tabby when prompted.

### Option B — From source

**Requirements:** [Node.js](https://nodejs.org/) 18 or later

```bash
git clone <this-repo>
cd tabby-ssh-keepass
npm install
npm run build
npm run install-plugin
```

`npm run install-plugin` copies the built files to the correct Tabby plugin directory:

| OS | Plugin directory |
|---|---|
| macOS | `~/Library/Application Support/tabby/plugins/node_modules/tabby-keepass-ssh/` |
| Linux | `~/.config/tabby/plugins/node_modules/tabby-keepass-ssh/` |
| Windows | `%APPDATA%\tabby\plugins\node_modules\tabby-keepass-ssh\` |

Restart Tabby after installation.

## Setup

1. Open **Tabby Settings → KeePass SSH**
2. Set the path to your `.kdbx` file
3. Enter the master password (saved to the OS keychain)
4. Set the SSH profile's **Authentication** to **Keyboard-interactive**

The plugin will auto-fill credentials on every connection.

## Security notes

- The master password is kept in memory only for the duration of a DB open operation and is never written to disk in plaintext.
- `ProtectedValue.getText()` is called immediately before use and the result is not retained.
- Storing the TOTP secret and password in the same KeePass entry is an intentional trade-off for convenience.

## Development

```bash
npm run watch          # rebuild on file change
npm run install-plugin # copy to Tabby plugin directory
# then restart Tabby
```

## License

MIT

Copyright (c) 2026 Ji-Ho Lee

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

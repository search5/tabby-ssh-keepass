Architecture
============

This page describes the internal design of **tabby-keepass-ssh** and the
reasoning behind its key implementation choices.

Authentication hook
---------------------

The plugin integrates with Tabby's SSH stack by observing the
keyboard-interactive authentication flow exposed by ``tabby-ssh``. When a
connection prompts for a password or a TOTP code, the plugin intercepts the
prompt, looks up a matching KeePass entry, and submits the appropriate
value automatically — without requiring the user to interact with the
prompt.

Entry matching
---------------

Entries are matched by comparing the SSH profile's host and port against
each entry's **URL** field, which is expected to follow the
``ssh://hostname`` or ``ssh://hostname:port`` convention. When several
entries resolve to the same URL, the plugin does not guess: it defers to
Tabby's built-in selector UI so the user can pick the correct entry for
that connection.

Secure handling of the master password
----------------------------------------

The KeePass master password is treated as sensitive material throughout its
lifecycle:

- It is stored in the OS-native secret store — macOS Keychain, libsecret on
  Linux, or Windows Credential Manager — never written to disk in
  plaintext.
- It is only held in memory for the duration of a single database-open
  operation, then discarded.
- Field values inside the decrypted database are wrapped in
  ``kdbxweb``'s ``ProtectedValue`` type. ``ProtectedValue.getText()`` is
  called immediately before a value (password or TOTP secret) is used, and
  the plain string is not cached or retained afterwards.

Database format support
--------------------------

The plugin reads both KDBX3 and KDBX4 database files. KDBX4 databases that
use Argon2 as their key derivation function are supported through the
`hash-wasm <https://github.com/Daninet/hash-wasm>`_ library, which provides
a WebAssembly implementation of Argon2 suitable for use inside Tabby's
Node.js/Electron runtime.

TOTP generation
------------------

TOTP codes are generated locally from the secret stored in the entry. The
plugin recognizes three possible field names for the secret
(``otp``, ``TimeOtp-Secret-Base32``, ``TOTP Seed``) to stay compatible with
KeePassXC, KeePass's built-in TOTP support (2.47+), and the legacy KeePass
TOTP plugin. See :doc:`usage` for the exact field formats.

Live reload of the database file
------------------------------------

The plugin watches the configured ``.kdbx`` file with Node's ``fs.watch``.
When the file changes on disk — for example after adding a new SSH entry in
KeePass — the plugin's in-memory cache is invalidated automatically, so the
next connection attempt reads the updated database instead of a stale
cached copy.

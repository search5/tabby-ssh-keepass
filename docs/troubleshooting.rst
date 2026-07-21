Troubleshooting & FAQ
======================

Multiple entries match the same URL
---------------------------------------

If more than one KeePass entry has the same ``ssh://hostname:port`` URL,
the plugin cannot know which one you mean. In this case Tabby shows a
selector dialog listing every matching entry — pick the correct one and the
connection continues normally. To avoid seeing this dialog, make sure only
one entry per host/port combination has a matching URL field.

"Wrong password" or the master password is not remembered
--------------------------------------------------------------

- Double-check that the password entered in **Tabby Settings → KeePass SSH**
  matches your ``.kdbx`` master password exactly (it is case-sensitive).
- The password is stored in your OS's secret store (macOS Keychain /
  libsecret / Windows Credential Manager). If Tabby keeps asking for the
  password again, verify that Tabby has permission to access the keychain
  and that no other application or OS policy is blocking access to it.
- On Linux, make sure a libsecret-compatible keyring daemon (such as
  GNOME Keyring or KWallet) is running; without one, secret storage may
  silently fail.

TOTP code is not submitted automatically
-----------------------------------------

The plugin only recognizes three specific field names for the TOTP secret:
``otp``, ``TimeOtp-Secret-Base32``, and ``TOTP Seed``. If your entry stores
the secret under a different field name (for example a custom string
field), the plugin will not find it. Rename the field to one of the
supported names, or add a copy of the secret under one of them.

Changes to the ``.kdbx`` file are not picked up
--------------------------------------------------

The plugin watches the database file with ``fs.watch`` and clears its cache
when a change is detected. If edits made in KeePass do not appear to be
picked up:

- Confirm you saved the changes in your KeePass client — some clients
  write to a temporary file and rename it into place, which can behave
  differently across filesystems and may occasionally be missed by
  ``fs.watch``.
- If the database is on a network share or a synced folder (e.g. cloud
  storage), file-change events may not propagate reliably. Reopening the
  KeePass path in **Tabby Settings → KeePass SSH** forces a fresh read.

KDBX3 vs KDBX4 compatibility
--------------------------------

Both formats are supported. KDBX4 databases using Argon2 key derivation are
decrypted using the ``hash-wasm`` WebAssembly implementation, so no native
Argon2 module is required. If a KDBX4 database fails to open, make sure
the plugin has been rebuilt/updated to a version that bundles the required
``hash-wasm`` dependency (see :doc:`installation`).

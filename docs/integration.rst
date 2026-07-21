Using with Tabby's built-in SSH
================================

This plugin does not add a new connection type or field to Tabby — you
still create and edit your SSH connection profile as before, entering the
host and username in Tabby's own built-in SSH connection UI. The plugin
never auto-fills those.

Automatic login triggers only when both of these are true:

- The connection profile's **Authentication** setting is switched to
  **Keyboard-interactive**.
- A KeePass entry exists whose **URL** field is
  ``ssh://<hostname-or-ip>`` (optionally with ``:port``) matching that
  connection's host and port, with a password and/or a supported TOTP
  secret configured.

When both hold, the plugin intercepts the keyboard-interactive password
and TOTP prompts as Tabby opens the connection, looks up the matching
KeePass entry, and submits the stored password and/or TOTP code
automatically — no typing or copy-pasting needed.

If either condition isn't met (authentication left as password/key-based,
or no matching entry found), Tabby's normal login prompt is shown
instead.

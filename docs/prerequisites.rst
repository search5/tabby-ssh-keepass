Prerequisites
=============

Before installing **tabby-keepass-ssh**, make sure the following are in
place:

- `Tabby <https://tabby.sh>`_ with the built-in ``tabby-ssh`` plugin enabled.
  ``tabby-keepass-ssh`` hooks into the keyboard-interactive authentication
  flow provided by ``tabby-ssh``, so that plugin must be active.
- A KeePass database file (``.kdbx``) that already contains your SSH
  credentials as entries. Both KDBX3 and KDBX4 (argon2 key derivation) are
  supported.
- If you plan to install from source instead of the Tabby Plugin Manager,
  `Node.js <https://nodejs.org/>`_ 18 or later.

Once these are available, continue to :doc:`installation`.

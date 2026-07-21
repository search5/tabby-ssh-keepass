Usage
=====

Setting up the plugin
----------------------

#. Open **Tabby Settings → KeePass SSH**.
#. Set the path to your ``.kdbx`` file.
#. Enter the master password. It is saved to the OS keychain (macOS
   Keychain / libsecret / Windows Credential Manager) so you do not need to
   re-enter it on every connection.
#. Set the SSH profile's **Authentication** method to **Keyboard-interactive**.

Once configured, the plugin auto-fills credentials on every connection that
matches a KeePass entry.

KeePass entry format
---------------------

Each SSH entry must have its **URL** field set to one of:

.. code-block:: text

   ssh://hostname
   ssh://hostname:port

Examples:

.. list-table::
   :header-rows: 1

   * - Host
     - Port
     - URL field
   * - ``192.168.1.10``
     - ``22``
     - ``ssh://192.168.1.10``
   * - ``my-server.example.com``
     - ``2222``
     - ``ssh://my-server.example.com:2222``

If more than one entry shares the same URL, Tabby's selector UI is shown so
you can pick the entry to use for that connection.

TOTP setup
----------

If the SSH server requires a TOTP code (e.g. Google Authenticator-style
2FA), store the TOTP secret in the same entry using one of these field
names:

.. list-table::
   :header-rows: 1

   * - Field name
     - Format
     - Created by
   * - ``otp``
     - ``otpauth://totp/...?secret=BASE32SECRET``
     - KeePassXC
   * - ``TimeOtp-Secret-Base32``
     - raw base32 secret
     - KeePass 2.47+ built-in TOTP
   * - ``TOTP Seed``
     - raw base32 secret
     - Legacy KeePass TOTP plugin

When the SSH server presents a TOTP prompt, the plugin generates the current
code from the stored secret and submits it automatically — both the
password and TOTP panels are submitted without any user interaction.

Development workflow
---------------------

If you are working on the plugin itself (installed via Method 2 in
:doc:`installation`), the following npm scripts are useful:

.. code-block:: bash

   npm run watch          # rebuild on file change
   npm run install-plugin # copy to Tabby plugin directory
   # then restart Tabby

Security notes
---------------

- The master password is kept in memory only for the duration of a database
  open operation and is never written to disk in plaintext.
- ``ProtectedValue.getText()`` is called immediately before use and the
  result is not retained afterwards.
- Storing the TOTP secret and password in the same KeePass entry is an
  intentional trade-off made for convenience.

Using it together with other Tabby plugins
---------------------------------------------

``tabby-keepass-ssh`` also acts as a shared KeePass credential service that
other Tabby plugins can call into — it isn't limited to plain SSH
profiles.

`tabby-aws-ssm-ssh <https://github.com/search5/tabby-aws-ssm-ssh>`_, a
Tabby plugin for connecting to EC2 instances through AWS Systems Manager
Session Manager, depends on ``tabby-keepass-ssh`` being installed in order
to offer its **Retrieve from KeePass** options for AWS credentials and SSH
private keys. The lookup key is different there — ``tabby-aws-ssm-ssh``
matches entries by EC2 **instance ID** (``ssh://<instanceId>``) rather
than by hostname — but both plugins read from the same KeePass database,
so installing both together lets you manage credentials for regular SSH
connections and AWS SSM connections from a single ``.kdbx`` file.

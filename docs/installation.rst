Installation
============

There are two ways to install **tabby-keepass-ssh**.

Method 1 — Install from the Tabby Plugin Manager
-------------------------------------------------

This is the recommended method for most users.

#. Open Tabby and go to **Settings → Plugins**.
#. In the search box, type ``keepass-ssh``.
#. Click **Install**, then restart Tabby when prompted.

Method 2 — Clone the Git repository and build from source
------------------------------------------------------------

Use this method if you want to build the plugin yourself, run a development
build, or contribute changes.

**Requirements:** `Node.js <https://nodejs.org/>`_ 18 or later.

.. code-block:: bash

   git clone https://github.com/search5/tabby-ssh-keepass.git
   cd tabby-ssh-keepass
   npm install
   npm run build
   npm run install-plugin

``npm run install-plugin`` copies the built files to the correct Tabby
plugin directory for your operating system:

.. list-table::
   :header-rows: 1

   * - OS
     - Plugin directory
   * - macOS
     - ``~/Library/Application Support/tabby/plugins/node_modules/tabby-keepass-ssh/``
   * - Linux
     - ``~/.config/tabby/plugins/node_modules/tabby-keepass-ssh/``
   * - Windows
     - ``%APPDATA%\tabby\plugins\node_modules\tabby-keepass-ssh\``

Restart Tabby after installation.

Once installed, continue to :doc:`usage` to configure the plugin.

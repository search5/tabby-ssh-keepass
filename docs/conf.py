# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'tabby-keepass-ssh'
copyright = '2026, Ji-Ho Lee'
author = 'Ji-Ho Lee'

version = '1.0.4'
release = '1.0.4'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = []

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

# -- Internationalization -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/advanced/intl.html

language = 'en'
locale_dirs = ['locale/']
gettext_compact = False
gettext_uuid = True

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_book_theme'
html_static_path = ['_static']
html_js_files = ['custom.js']
html_title = f'{project} Documentation (EN)'

html_theme_options = {
    'repository_url': 'https://github.com/search5/tabby-ssh-keepass',
    'use_repository_button': True,
    'use_issues_button': True,
    'use_edit_page_button': False,
    'navbar_end': ['version-switcher', 'theme-switcher', 'navbar-icon-links'],
    # NOTE: 'version_match' is pre-declared here as a placeholder so that the
    # config-inited hook below can safely assign to
    # html_theme_options['switcher']['version_match'] without a KeyError.
    'switcher': {
        'json_url': '_static/switcher.json',
        'version_match': 'en',
    },
}

# -- Options for EPUB output --------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-epub-output

epub_title = f'{project} (English)'
epub_author = author
epub_publisher = author
epub_copyright = copyright

# Non-content build artefacts that end up inside the EPUB output directory
# (doctree cache, build metadata, the language switcher's JSON file) are not
# part of the book and would otherwise trigger "unknown project files"
# warnings from the EPUB builder.
epub_exclude_files = [
    'search.html',
    '_static/switcher.json',
    '_static/custom.js',
    '.buildinfo',
    '.doctrees/*',
]


# -- Dynamic per-language titles (HTML tab title & EPUB title) ---------------
# Sphinx does not automatically localize html_title / epub_title when the
# build language is switched via `-D language=ko`, so this hook sets them
# explicitly for each language once the configuration has been read.

def setup(app):
    def update_language_titles(app, config):
        app.config.html_theme_options['switcher']['version_match'] = config.language
        if config.language == 'ko':
            app.config.html_title = f'{project} 문서 (한국어)'
            app.config.epub_title = f'{project} (한국어)'
        else:
            app.config.html_title = f'{project} Documentation (EN)'
            app.config.epub_title = f'{project} (English)'
    app.connect('config-inited', update_language_titles)

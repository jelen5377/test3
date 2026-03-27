# Denni Zapisnik

Staticka aplikace pro GitHub Pages, ktera zapisuje text do denniho souboru v repozitari `test3`.

## Jak to funguje

- aplikace bezi jako cisty HTML/CSS/JS web
- uzivatel zada text a GitHub token
- aplikace zapise zaznam do `entries/YYYY-MM-DD.txt`
- kazdy novy zaznam se prida na dalsi radek s casem

## Potrebny GitHub token

Pouzij fine-grained personal access token pro repo `test3` s opravnenim:

- `Contents: Read and write`

Token se pouziva jen v prohlizeci pri odeslani pozadavku na GitHub API.

## GitHub API

Aplikace pouziva GitHub REST API pro create/update file contents:

- https://docs.github.com/en/rest/repos/contents

## GitHub Pages

Projekt je pripraveny pro publikaci primo z rootu repozitare.

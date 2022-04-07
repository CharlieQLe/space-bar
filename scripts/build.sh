#!/usr/bin/env bash

set -e

cd "$(dirname ${BASH_SOURCE[0]})/.."

rm -r target

tsc || true

for file in $(find target -name '*.js'); do
	sed -i \
		-e 's#export function#function#g' \
		-e 's#export var#var#g' \
		-e 's#export const#var#g' \
		-e 's#Object.defineProperty(exports, "__esModule", { value: true });#var exports = {};#g' \
		"${file}"
	sed -i -E 's/export class (\w+)/var \1 = class \1/g' "${file}"
	sed -i -E "s/import \* as (\w+) from '(\w+)'/const \1 = Me.imports.\2/g" "${file}"
done

mkdir target/schemas
glib-compile-schemas src/schemas --targetdir target/schemas

for file in metadata.json README.md; do
	cp "$file" "target/$file"
done

(
	cd src
	for file in stylesheet.css; do
		cp "$file" "../target/$file"
	done
)

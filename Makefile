compile-requirements:
	uv pip compile -o requirements.txt requirements.in
	uv pip compile -o requirements-dev.txt requirements-dev.in

upgrade-requirements:
	uv pip compile -U -o requirements.txt requirements.in
	uv pip compile -U -o requirements-dev.txt requirements-dev.in

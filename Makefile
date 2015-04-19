es6: src/es6/jelly.js
	@node_modules/.bin/traceur \
		--out jelly.js \
		--array-comprehension \
		--source-maps=file \
		--script src/es6/jelly.js

install:
	npm install
	cd node_modules/PointerEvents; npm install
	cd node_modules/PointerEvents; grunt
	$(MAKE) es6

clean:
	rm -rf node_modules
	rm jelly.js
	rm jelly.js.map

.PHONY: clean es6

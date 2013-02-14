build: src/jelly.compiled.js

es6: src/es6/jelly.js
	cd src/; ../traceur/traceurc es6/jelly.js --source-maps;
	mv src/out/es6/jelly.map src/
	mv src/out/es6/jelly.compiled.js src/

clean:
	rm src/jelly.compiled.js
	rm src/jelly.map

.PHONY: clean es6

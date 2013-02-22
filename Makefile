es6: src/es6/jelly.js
	node traceur/build/build.js $? --out jelly.js --sourcemap

clean:
	rm jelly.js
	rm jelly.map

.PHONY: clean es6

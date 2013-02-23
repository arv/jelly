var $__getDescriptors = function(object) {
  var descriptors = {}, name, names = Object.getOwnPropertyNames(object);
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    descriptors[name] = Object.getOwnPropertyDescriptor(object, name);
  }
  return descriptors;
}, $__createClassNoExtends = function(object, staticObject) {
  var ctor = object.constructor;
  Object.defineProperty(object, 'constructor', {enumerable: false});
  ctor.prototype = object;
  Object.defineProperties(ctor, $__getDescriptors(staticObject));
  return ctor;
};
var levels = [['xxxxxxxxxxxxxx', 'x            x', 'x            x', 'x      r     x', 'x      xx    x', 'x  g     r b x', 'xxbxxxg xxxxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x            x', 'x            x', 'x     g   g  x', 'x   r r   r  x', 'xxxxx x x xxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x            x', 'x   bg  x g  x', 'xxx xxxrxxx  x', 'x      b     x', 'xxx xxxrxxxxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x       r    x', 'x       b    x', 'x       x    x', 'x b r        x', 'x b r      b x', 'xxx x      xxx', 'xxxxx xxxxxxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x            x', 'xrg  gg      x', 'xxx xxxx xx  x', 'xrg          x', 'xxxxx  xx   xx', 'xxxxxx xx  xxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'xxxxxxx      x', 'xxxxxxx g    x', 'x       xx   x', 'x r   b      x', 'x x xxx x g  x', 'x         x bx', 'x       r xxxx', 'x   xxxxxxxxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x          r x', 'x          x x', 'x     b   b  x', 'x     x  rr  x', 'x         x  x', 'x R  Bx x x  x', 'x x  xx x x  x', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'xxx  x  x   xx', 'xx   g  b   xx', 'xx   x  x   xx', 'xx   B  G   xx', 'xxg        bxx', 'xxxg      bxxx', 'xxxx      xxxx', 'xxxxxxxxxxxxxx', 'xxxxxxxxxxxxxx']];
var CELL_SIZE = 48;
var oldWebKit = !('animation'in document.documentElement.style);
var animation = oldWebKit ? 'webkitAnimation': 'animation';
var animationName = oldWebKit ? 'webkitAnimationName': 'animationName';
var animationEnd = oldWebKit ? 'webkitAnimationEnd': 'animationend';
var transitionEnd = oldWebKit ? 'webkitTransitionEnd': 'transitionend';
function moveToCell(dom, x, y) {
  dom.style.left = x * CELL_SIZE + 'px';
  dom.style.top = y * CELL_SIZE + 'px';
}
function isJelly(object) {
  return object instanceof Jelly;
}
function isFixed(color) {
  return 'RGB'.indexOf(color) >= 0;
}
var Stage = function() {
  var $Stage = ($__createClassNoExtends)({
    constructor: function(dom, map) {
      this.dom = dom;
      this.jellies = [];
      this.loadMap(map);
      this.busy = false;
      var maybeSwallowEvent = (function(e) {
        e.preventDefault();
        if (this.busy) e.stopPropagation();
      }).bind(this);
      {
        var $__4 = traceur.runtime.getIterator(['contextmenu', 'click']);
        try {
          while (true) {
            var event = $__4.next();
            {
              this.dom.addEventListener(event, maybeSwallowEvent, true);
            }
          }
        } catch (e) {
          if (!traceur.runtime.isStopIteration(e)) throw e;
        }
      }
      this.checkForMerges();
    },
    loadMap: function(map) {
      var table = document.createElement('table');
      this.dom.appendChild(table);
      this.cells = map.map((function(line, y) {
        var row = line.split('');
        var tr = document.createElement('tr');
        table.appendChild(tr);
        return row.map((function(char, x) {
          var color = null;
          var cell = null;
          var fixed = isFixed(row[x]);
          switch (row[x]) {
            case 'x':
              cell = document.createElement('td');
              cell.className = 'cell wall';
              tr.appendChild(cell);
              break;
            case 'r':
            case 'R':
              color = 'red';
              break;
            case 'g':
            case 'G':
              color = 'green';
              break;
            case 'b':
            case 'B':
              color = 'blue';
              break;
          }
          if (!cell) {
            var td = document.createElement('td');
            td.className = 'transparent';
            tr.appendChild(td);
          }
          if (color) {
            var jelly = new Jelly(this, x, y, color, fixed);
            this.dom.appendChild(jelly.dom);
            this.jellies.push(jelly);
            cell = jelly;
          }
          return cell;
        }).bind(this));
      }).bind(this));
      this.addBorders();
      this.addLocks();
    },
    addBorders: function() {
      for (var y = 0; y < this.cells.length; y++) {
        for (var x = 0; x < this.cells[0].length; x++) {
          var cell = this.cells[y][x];
          if (!cell || cell.tagName != 'TD') continue;
          var border = 'solid 1px #777';
          var edges = [['borderBottom', 0, 1], ['borderTop', 0, - 1], ['borderLeft', - 1, 0], ['borderRight', 1, 0]];
          {
            var $__4 = traceur.runtime.getIterator(edges);
            try {
              while (true) {
                var $__7 = $__4.next(), attr = $__7[0], dx = $__7[1], dy = $__7[2];
                {
                  if (y + dy < 0 || y + dy >= this.cells.length) continue;
                  if (x + dx < 0 || x + dx >= this.cells[0].length) continue;
                  var other = this.cells[y + dy][x + dx];
                  if (!other || other.tagName != 'TD') cell.style[attr] = border;
                }
              }
            } catch (e) {
              if (!traceur.runtime.isStopIteration(e)) throw e;
            }
          }
        }
      }
    },
    addLocks: function() {
      {
        var $__4 = traceur.runtime.getIterator(this.jellies);
        try {
          while (true) {
            var jelly = $__4.next();
            {
              if (jelly.isFixed) jelly.addLock();
            }
          }
        } catch (e) {
          if (!traceur.runtime.isStopIteration(e)) throw e;
        }
      }
    },
    waitForAnimation: function(cb) {
      var end = (function() {
        console.log('end');
        this.dom.removeEventListener(transitionEnd, end);
        cb();
      }).bind(this);
      this.dom.addEventListener(transitionEnd, end);
    },
    trySlide: function(jelly, dir) {
      if (!this.canMove(jelly, dir)) return;
      this.busy = true;
      var jellies = this.getAdjacentObjects(jelly, dir).filter(isJelly);
      jellies.reverse().forEach((function(jelly) {
        this.move(jelly, dir, 0);
      }).bind(this));
      this.waitForAnimation((function() {
        this.checkFall((function() {
          this.checkForMerges();
          this.busy = false;
        }).bind(this));
      }).bind(this));
    },
    move: function(jelly, dx, dy) {
      var targetX = jelly.x + dx;
      var targetY = jelly.y + dy;
      {
        var $__4 = traceur.runtime.getIterator(jelly.cellCoords());
        try {
          while (true) {
            var $__7 = $__4.next(), x = $__7[0], y = $__7[1];
            {
              this.cells[y][x] = null;
            }
          }
        } catch (e) {
          if (!traceur.runtime.isStopIteration(e)) throw e;
        }
      }
      jelly.updatePosition(targetX, targetY);
      {
        var $__5 = traceur.runtime.getIterator(jelly.cellCoords());
        try {
          while (true) {
            var $__7 = $__5.next(), x = $__7[0], y = $__7[1];
            {
              this.cells[y][x] = jelly;
            }
          }
        } catch (e) {
          if (!traceur.runtime.isStopIteration(e)) throw e;
        }
      }
    },
    isWallAt: function(x, y) {
      return this.cells[y][x] != null && !isJelly(this.cells[y][x]);
    },
    checkFilled: function(jelly, dx, dy) {
      {
        var $__5 = traceur.runtime.getIterator(jelly.cellCoords());
        try {
          while (true) {
            var $__7 = $__5.next(), x = $__7[0], y = $__7[1];
            {
              var next = this.cells[y + dy][x + dx];
              if (next && next != jelly) return next;
            }
          }
        } catch (e) {
          if (!traceur.runtime.isStopIteration(e)) throw e;
        }
      }
      return false;
    },
    canMove: function(jelly, dir) {
      if (jelly.isFixed) return false;
      {
        var $__5 = traceur.runtime.getIterator(this.getAdjacentObjects(jelly, dir));
        try {
          while (true) {
            var object = $__5.next();
            {
              if (!isJelly(object) || object.isFixed) return false;
            }
          }
        } catch (e) {
          if (!traceur.runtime.isStopIteration(e)) throw e;
        }
      }
      return true;
    },
    getAdjacentObjects: function(jelly, dir) {
      var found = [];
      var inner = (function(jelly) {
        found.push(jelly);
        {
          var $__5 = traceur.runtime.getIterator(jelly.cellCoords());
          try {
            while (true) {
              var $__7 = $__5.next(), x = $__7[0], y = $__7[1];
              {
                var next = this.cells[y][x + dir];
                if (next && next != jelly && found.indexOf(next) == - 1) {
                  if (isJelly(next)) inner(next); else found.push(next);
                }
              }
            }
          } catch (e) {
            if (!traceur.runtime.isStopIteration(e)) throw e;
          }
        }
      }).bind(this);
      inner(jelly);
      return found;
    },
    checkFall: function(cb) {
      var moved = false;
      var didOneMove = true;
      while (didOneMove) {
        didOneMove = false;
        {
          var $__5 = traceur.runtime.getIterator(this.jellies);
          try {
            while (true) {
              var jelly = $__5.next();
              {
                if (!jelly.isFixed && !this.checkFilled(jelly, 0, 1)) {
                  this.move(jelly, 0, 1);
                  moved = true;
                  didOneMove = true;
                }
              }
            }
          } catch (e) {
            if (!traceur.runtime.isStopIteration(e)) throw e;
          }
        }
      }
      if (moved) this.waitForAnimation(cb); else cb();
    },
    checkForMerges: function() {
      var jelly;
      while (jelly = this.doOneMerge()) {
        {
          var $__5 = traceur.runtime.getIterator(jelly.cellCoords());
          try {
            while (true) {
              var $__7 = $__5.next(), x = $__7[0], y = $__7[1];
              {
                this.cells[y][x] = jelly;
              }
            }
          } catch (e) {
            if (!traceur.runtime.isStopIteration(e)) throw e;
          }
        }
      }
    },
    doOneMerge: function() {
      {
        var $__6 = traceur.runtime.getIterator(this.jellies);
        try {
          while (true) {
            var jelly = $__6.next();
            {
              {
                var $__4 = traceur.runtime.getIterator(jelly.cellCoords());
                try {
                  while (true) {
                    var $__7 = $__4.next(), x = $__7[0], y = $__7[1];
                    {
                      {
                        var $__5 = traceur.runtime.getIterator([[1, 0], [0, 1]]);
                        try {
                          while (true) {
                            var $__7 = $__5.next(), dx = $__7[0], dy = $__7[1];
                            {
                              var other = this.cells[y + dy][x + dx];
                              if (!other || !isJelly(other)) continue;
                              if (other == jelly) continue;
                              if (jelly.color != other.color) continue;
                              jelly.merge(other);
                              this.jellies = this.jellies.filter((function(j) {
                                return j != other;
                              }));
                              return jelly;
                            }
                          }
                        } catch (e) {
                          if (!traceur.runtime.isStopIteration(e)) throw e;
                        }
                      }
                    }
                  }
                } catch (e) {
                  if (!traceur.runtime.isStopIteration(e)) throw e;
                }
              }
            }
          }
        } catch (e) {
          if (!traceur.runtime.isStopIteration(e)) throw e;
        }
      }
      return null;
    }
  }, {});
  return $Stage;
}();
var JellyCell = function() {
  var $JellyCell = ($__createClassNoExtends)({constructor: function(jelly, x, y, color) {
      this.jelly = jelly;
      this.x = x;
      this.y = y;
      this.dom = document.createElement('div');
      this.dom.className = 'cell jelly ' + color;
    }}, {});
  return $JellyCell;
}();
var Jelly = function() {
  var $Jelly = ($__createClassNoExtends)({
    constructor: function(stage, x, y, color, fixed) {
      this.stage = stage;
      this.x = x;
      this.y = y;
      this.color = color;
      this.isFixed = fixed;
      this.dom = document.createElement('div');
      this.updatePosition(this.x, this.y);
      this.dom.className = 'cell jellybox';
      var cell = new JellyCell(this, 0, 0, this.color);
      this.dom.appendChild(cell.dom);
      this.cells = [cell];
      this.dom.addEventListener('contextmenu', (function(e) {
        stage.trySlide(this, 1);
      }).bind(this));
      this.dom.addEventListener('click', (function(e) {
        stage.trySlide(this, - 1);
      }).bind(this));
    },
    cellCoords: function() {
      var $__1 = 0, $__2 = [], $__3 = this;
      return (function() {
        {
          var $__6 = traceur.runtime.getIterator($__3.cells);
          try {
            while (true) {
              var cell = $__6.next();
              $__2[$__1++] = [$__3.x + cell.x, $__3.y + cell.y];
            }
          } catch (e) {
            if (!traceur.runtime.isStopIteration(e)) throw e;
          }
        }
        return $__2;
      }());
    },
    slide: function(dir, cb) {
      var end = (function() {
        this.dom.style[animation] = '';
        this.dom.removeEventListener(animationEnd, end);
        cb();
      }).bind(this);
      this.dom.addEventListener(animationEnd, end);
      this.dom.style[animation] = '300ms ease-out';
      if (dir == 1) this.dom.style[animationName] = 'slideRight'; else this.dom.style[animationName] = 'slideLeft';
    },
    updatePosition: function(x, y) {
      this.x = x;
      this.y = y;
      moveToCell(this.dom, this.x, this.y);
    },
    merge: function(other) {
      var dx = other.x - this.x;
      var dy = other.y - this.y;
      {
        var $__6 = traceur.runtime.getIterator(other.cells);
        try {
          while (true) {
            var cell = $__6.next();
            {
              this.cells.push(cell);
              cell.x += dx;
              cell.y += dy;
              moveToCell(cell.dom, cell.x, cell.y);
              this.dom.appendChild(cell.dom);
            }
          }
        } catch (e) {
          if (!traceur.runtime.isStopIteration(e)) throw e;
        }
      }
      other.cells = null;
      other.dom.parentNode.removeChild(other.dom);
      {
        var $__5 = traceur.runtime.getIterator(this.cells);
        try {
          while (true) {
            var cell = $__5.next();
            {
              {
                var $__4 = traceur.runtime.getIterator(this.cells);
                try {
                  while (true) {
                    var othercell = $__4.next();
                    {
                      if (othercell == cell) continue;
                      if (othercell.x == cell.x + 1 && othercell.y == cell.y) cell.dom.style.borderRight = 'none'; else if (othercell.x == cell.x - 1 && othercell.y == cell.y) cell.dom.style.borderLeft = 'none'; else if (othercell.x == cell.x && othercell.y == cell.y + 1) cell.dom.style.borderBottom = 'none'; else if (othercell.x == cell.x && othercell.y == cell.y - 1) cell.dom.style.borderTop = 'none';
                    }
                  }
                } catch (e) {
                  if (!traceur.runtime.isStopIteration(e)) throw e;
                }
              }
            }
          }
        } catch (e) {
          if (!traceur.runtime.isStopIteration(e)) throw e;
        }
      }
      this.isFixed = this.isFixed || other.isFixed;
    },
    addLock: function() {
      var lock = document.createElement('div');
      this.cells[0].dom.appendChild(lock);
      var stage = this.stage;
      var lockDir = 'above';
      if (stage.isWallAt(this.x, this.y - 1)) lockDir = 'above'; else if (stage.isWallAt(this.x, this.y + 1)) lockDir = 'below'; else if (stage.isWallAt(this.x - 1, this.y)) lockDir = 'left'; else lockDir = 'right';
      lock.className = ("lock " + lockDir);
    }
  }, {});
  return $Jelly;
}();
function resetLevel() {
  var level = + location.hash.slice(1) || 0;
  if (stage && stage.dom) stage.dom.textContent = '';
  stage = new Stage(document.getElementById('map'), levels[level]);
  var levelPicker = document.getElementById('level');
  levelPicker.value = level;
}
var levelPicker = document.getElementById('level');
levelPicker.addEventListener('change', (function() {
  location.hash = levelPicker.value;
}));
for (var i = 0; i < levels.length; i++) {
  var option = new Option(("Level " + (i + 1)), i);
  levelPicker.appendChild(option);
}
resetLevel();
document.getElementById('reset').addEventListener('click', resetLevel);
window.addEventListener('hashchange', resetLevel);

//@ sourceMappingURL=jelly.map
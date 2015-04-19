'use strict';
var levels = ["xxxxxxxxxxxxxx\n   x            x\n   x            x\n   x            x\n   x            x\n   x      r     x\n   x      xx    x\n   x  g     r b x\n   xxbxxxg xxxxxx\n   xxxxxxxxxxxxxx", "xxxxxxxxxxxxxx\n   x            x\n   x            x\n   x            x\n   x            x\n   x            x\n   x     g   g  x\n   x   r r   r  x\n   xxxxx x x xxxx\n   xxxxxxxxxxxxxx", "xxxxxxxxxxxxxx\n   x            x\n   x            x\n   x            x\n   x            x\n   x   bg  x g  x\n   xxx xxxrxxx  x\n   x      b     x\n   xxx xxxrxxxxxx\n   xxxxxxxxxxxxxx", "xxxxxxxxxxxxxx\n   x            x\n   x       r    x\n   x       b    x\n   x       x    x\n   x b r        x\n   x b r      b x\n   xxx x      xxx\n   xxxxx xxxxxxxx\n   xxxxxxxxxxxxxx", "xxxxxxxxxxxxxx\n   x            x\n   x            x\n   xrg  gg      x\n   xxx xxxx xx  x\n   xrg          x\n   xxxxx  xx   xx\n   xxxxxx xx  xxx\n   xxxxxxxxxxxxxx", "xxxxxxxxxxxxxx\n   xxxxxxx      x\n   xxxxxxx g    x\n   x       xx   x\n   x r   b      x\n   x x xxx x g  x\n   x         x bx\n   x       r xxxx\n   x   xxxxxxxxxx\n   xxxxxxxxxxxxxx", "xxxxxxxxxxxxxx\n   x            x\n   x          r x\n   x          x x\n   x     b   b  x\n   x     x  rr  x\n   x         x  x\n   x R  Bx x x  x\n   x x  xx x x  x\n   xxxxxxxxxxxxxx", "xxxxxxxxxxxxxx\n   xxx  x  x   xx\n   xx   g  b   xx\n   xx   x  x   xx\n   xx   B  G   xx\n   xxg        bxx\n   xxxg      bxxx\n   xxxx      xxxx\n   xxxxxxxxxxxxxx\n   xxxxxxxxxxxxxx", "xxxxxxxxxxxxxx\n   x            x\n   x            x\n   x            x\n   x            x\n   x          rbx\n   x    x     xxx\n   xb        11xx\n   xx  Rx  x xxxx\n   xxxxxxxxxxxxxx", "xxxxxxxxxxxxxx\n   x   gr       x\n   x   11 2     x\n   x    x x     x\n   x            x\n   x  x  x      x\n   x        x  rx\n   xx   x     gxx\n   x          xxx\n   xxxxxxxxxxxxxx"];
var CELL_SIZE = 48;
var oldWebKit = !('animation' in document.documentElement.style);
var animation = oldWebKit ? 'webkitAnimation' : 'animation';
var animationName = oldWebKit ? 'webkitAnimationName' : 'animationName';
var animationEnd = oldWebKit ? 'webkitAnimationEnd' : 'animationend';
var transitionEnd = oldWebKit ? 'webkitTransitionEnd' : 'transitionend';
function moveToCell(dom, x, y) {
  dom.style.left = x * CELL_SIZE + 'px';
  dom.style.top = y * CELL_SIZE + 'px';
}
function isJelly(object) {
  return object instanceof Jelly;
}
function isFixed(kind) {
  return 'RGB'.indexOf(kind) >= 0;
}
function getColor(kind) {
  switch (kind) {
    case 'r':
    case 'R':
      return 'red';
    case 'g':
    case 'G':
      return 'green';
    case 'b':
    case 'B':
      return 'blue';
    case '1':
    case '2':
      return 'black';
  }
}
var Stage = (function() {
  function Stage(dom, map) {
    this.dom = dom;
    this.busy = false;
    this.loadMap(map);
  }
  return ($traceurRuntime.createClass)(Stage, {
    loadMap: function(map) {
      var $__0 = this;
      this.undoStack = [];
      this.jellies = [];
      this.dom.textContent = '';
      var table = document.createElement('table');
      this.dom.appendChild(table);
      var lines = map.trim().split(/\s*\n\s*/);
      this.cells = lines.map((function(line, y) {
        var row = line.split('');
        var tr = document.createElement('tr');
        table.appendChild(tr);
        return row.map((function(char, x) {
          if (row[x] === 'x') {
            var wall = document.createElement('td');
            wall.className = 'cell wall';
            tr.appendChild(wall);
            return wall;
          }
          var td = document.createElement('td');
          td.className = 'transparent';
          tr.appendChild(td);
          if (row[x] !== ' ') {
            var jelly = new Jelly($__0, x, y, row[x]);
            $__0.dom.appendChild(jelly.dom);
            $__0.jellies.push(jelly);
            return jelly;
          }
          return null;
        }));
      }));
      this.addBorders();
      this.addLocks();
      this.checkForMerges();
    },
    addBorders: function() {
      var $__24,
          $__25;
      for (var y = 0; y < this.cells.length; y++) {
        for (var x = 0; x < this.cells[0].length; x++) {
          var cell = this.cells[y][x];
          if (!cell || cell.tagName != 'TD')
            continue;
          var border = 'solid 1px #777';
          var edges = [['borderBottom', 0, 1], ['borderTop', 0, -1], ['borderLeft', -1, 0], ['borderRight', 1, 0]];
          var $__5 = true;
          var $__6 = false;
          var $__7 = undefined;
          try {
            for (var $__3 = void 0,
                $__2 = (edges)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
              var $__23 = $__3.value,
                  attr = ($__24 = $__23[$traceurRuntime.toProperty(Symbol.iterator)](), ($__25 = $__24.next()).done ? void 0 : $__25.value),
                  dx = ($__25 = $__24.next()).done ? void 0 : $__25.value,
                  dy = ($__25 = $__24.next()).done ? void 0 : $__25.value;
              {
                if (y + dy < 0 || y + dy >= this.cells.length)
                  continue;
                if (x + dx < 0 || x + dx >= this.cells[0].length)
                  continue;
                var other = this.cells[y + dy][x + dx];
                if (!other || other.tagName != 'TD')
                  cell.style[attr] = border;
              }
            }
          } catch ($__8) {
            $__6 = true;
            $__7 = $__8;
          } finally {
            try {
              if (!$__5 && $__2.return != null) {
                $__2.return();
              }
            } finally {
              if ($__6) {
                throw $__7;
              }
            }
          }
        }
      }
    },
    addLocks: function() {
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (this.jellies)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var jelly = $__3.value;
          {
            if (jelly.isFixed)
              jelly.addLock();
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
    },
    waitForAnimation: function(cb) {
      var $__0 = this;
      var end = (function() {
        $__0.dom.removeEventListener(transitionEnd, end);
        cb();
      });
      this.dom.addEventListener(transitionEnd, end);
    },
    trySlide: function(jelly, dir) {
      var $__0 = this;
      if (!this.canMove(jelly, dir))
        return ;
      this.saveState();
      this.busy = true;
      var jellies = this.getAdjacentObjects(jelly, dir).filter(isJelly);
      jellies.reverse().forEach((function(jelly) {
        $__0.move(jelly, dir, 0);
      }));
      this.waitForAnimation((function() {
        $__0.checkFall((function() {
          $__0.checkForMerges();
          $__0.busy = false;
        }));
      }));
    },
    move: function(jelly, dx, dy) {
      var $__24,
          $__25,
          $__27,
          $__28;
      var targetX = jelly.x + dx;
      var targetY = jelly.y + dy;
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var $__23 = $__3.value,
              x = ($__24 = $__23[$traceurRuntime.toProperty(Symbol.iterator)](), ($__25 = $__24.next()).done ? void 0 : $__25.value),
              y = ($__25 = $__24.next()).done ? void 0 : $__25.value;
          {
            this.cells[y][x] = null;
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
      jelly.updatePosition(targetX, targetY);
      var $__12 = true;
      var $__13 = false;
      var $__14 = undefined;
      try {
        for (var $__10 = void 0,
            $__9 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__12 = ($__10 = $__9.next()).done); $__12 = true) {
          var $__26 = $__10.value,
              x = ($__27 = $__26[$traceurRuntime.toProperty(Symbol.iterator)](), ($__28 = $__27.next()).done ? void 0 : $__28.value),
              y = ($__28 = $__27.next()).done ? void 0 : $__28.value;
          {
            this.cells[y][x] = jelly;
          }
        }
      } catch ($__15) {
        $__13 = true;
        $__14 = $__15;
      } finally {
        try {
          if (!$__12 && $__9.return != null) {
            $__9.return();
          }
        } finally {
          if ($__13) {
            throw $__14;
          }
        }
      }
    },
    isWallAt: function(x, y) {
      return this.cells[y][x] != null && !isJelly(this.cells[y][x]);
    },
    checkFilled: function(jelly, dx, dy) {
      var $__26,
          $__24;
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var $__23 = $__3.value,
              x = ($__26 = $__23[$traceurRuntime.toProperty(Symbol.iterator)](), ($__24 = $__26.next()).done ? void 0 : $__24.value),
              y = ($__24 = $__26.next()).done ? void 0 : $__24.value;
          {
            var next = this.cells[y + dy][x + dx];
            if (next && next != jelly)
              return next;
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
      return false;
    },
    canMove: function(jelly, dir) {
      if (jelly.isFixed)
        return false;
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (this.getAdjacentObjects(jelly, dir))[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var object = $__3.value;
          {
            if (!isJelly(object) || object.isFixed)
              return false;
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
      return true;
    },
    getAdjacentObjects: function(jelly, dir) {
      var $__0 = this;
      var found = [];
      var inner = (function(jelly) {
        var $__26,
            $__24;
        found.push(jelly);
        var $__5 = true;
        var $__6 = false;
        var $__7 = undefined;
        try {
          for (var $__3 = void 0,
              $__2 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
            var $__23 = $__3.value,
                x = ($__26 = $__23[$traceurRuntime.toProperty(Symbol.iterator)](), ($__24 = $__26.next()).done ? void 0 : $__24.value),
                y = ($__24 = $__26.next()).done ? void 0 : $__24.value;
            {
              var next = $__0.cells[y][x + dir];
              if (next && next != jelly && found.indexOf(next) == -1) {
                if (isJelly(next))
                  inner(next);
                else
                  found.push(next);
              }
            }
          }
        } catch ($__8) {
          $__6 = true;
          $__7 = $__8;
        } finally {
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
        }
      });
      inner(jelly);
      return found;
    },
    checkFall: function(cb) {
      var moved = false;
      var didOneMove = true;
      while (didOneMove) {
        didOneMove = false;
        var $__5 = true;
        var $__6 = false;
        var $__7 = undefined;
        try {
          for (var $__3 = void 0,
              $__2 = (this.jellies)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
            var jelly = $__3.value;
            {
              if (!jelly.isFixed && !this.checkFilled(jelly, 0, 1)) {
                this.move(jelly, 0, 1);
                moved = true;
                didOneMove = true;
              }
            }
          }
        } catch ($__8) {
          $__6 = true;
          $__7 = $__8;
        } finally {
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
        }
      }
      if (moved)
        this.waitForAnimation(cb);
      else
        cb();
    },
    checkForMerges: function() {
      var $__26,
          $__24;
      var jelly;
      while (jelly = this.doOneMerge()) {
        var $__5 = true;
        var $__6 = false;
        var $__7 = undefined;
        try {
          for (var $__3 = void 0,
              $__2 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
            var $__23 = $__3.value,
                x = ($__26 = $__23[$traceurRuntime.toProperty(Symbol.iterator)](), ($__24 = $__26.next()).done ? void 0 : $__24.value),
                y = ($__24 = $__26.next()).done ? void 0 : $__24.value;
            {
              this.cells[y][x] = jelly;
            }
          }
        } catch ($__8) {
          $__6 = true;
          $__7 = $__8;
        } finally {
          try {
            if (!$__5 && $__2.return != null) {
              $__2.return();
            }
          } finally {
            if ($__6) {
              throw $__7;
            }
          }
        }
      }
      this.checkForCompletion();
    },
    get done() {
      return this._done;
    },
    checkForCompletion: function() {
      var kinds = {};
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (this.jellies)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var jelly = $__3.value;
          {
            kinds[jelly.kind] = true;
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
      var done = Object.keys(kinds).length === this.jellies.length;
      if (done != this._done) {
        this._done = done;
        if (this.onDoneChange)
          this.onDoneChange();
      }
    },
    doOneMerge: function() {
      var $__26,
          $__24,
          $__27,
          $__28;
      var $__19 = true;
      var $__20 = false;
      var $__21 = undefined;
      try {
        for (var $__17 = void 0,
            $__16 = (this.jellies)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__19 = ($__17 = $__16.next()).done); $__19 = true) {
          var jelly = $__17.value;
          {
            var $__12 = true;
            var $__13 = false;
            var $__14 = undefined;
            try {
              for (var $__10 = void 0,
                  $__9 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__12 = ($__10 = $__9.next()).done); $__12 = true) {
                var $__23 = $__10.value,
                    x = ($__26 = $__23[$traceurRuntime.toProperty(Symbol.iterator)](), ($__24 = $__26.next()).done ? void 0 : $__24.value),
                    y = ($__24 = $__26.next()).done ? void 0 : $__24.value;
                {
                  var $__5 = true;
                  var $__6 = false;
                  var $__7 = undefined;
                  try {
                    for (var $__3 = void 0,
                        $__2 = ([[1, 0], [0, 1]])[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
                      var $__25 = $__3.value,
                          dx = ($__27 = $__25[$traceurRuntime.toProperty(Symbol.iterator)](), ($__28 = $__27.next()).done ? void 0 : $__28.value),
                          dy = ($__28 = $__27.next()).done ? void 0 : $__28.value;
                      {
                        var other = this.cells[y + dy][x + dx];
                        if (!other || !isJelly(other))
                          continue;
                        if (other == jelly)
                          continue;
                        if (jelly.kind != other.kind)
                          continue;
                        jelly.merge(other);
                        this.jellies = this.jellies.filter((function(j) {
                          return j != other;
                        }));
                        return jelly;
                      }
                    }
                  } catch ($__8) {
                    $__6 = true;
                    $__7 = $__8;
                  } finally {
                    try {
                      if (!$__5 && $__2.return != null) {
                        $__2.return();
                      }
                    } finally {
                      if ($__6) {
                        throw $__7;
                      }
                    }
                  }
                }
              }
            } catch ($__15) {
              $__13 = true;
              $__14 = $__15;
            } finally {
              try {
                if (!$__12 && $__9.return != null) {
                  $__9.return();
                }
              } finally {
                if ($__13) {
                  throw $__14;
                }
              }
            }
          }
        }
      } catch ($__22) {
        $__20 = true;
        $__21 = $__22;
      } finally {
        try {
          if (!$__19 && $__16.return != null) {
            $__16.return();
          }
        } finally {
          if ($__20) {
            throw $__21;
          }
        }
      }
      return null;
    },
    saveState: function() {
      var rows = [];
      var $__12 = true;
      var $__13 = false;
      var $__14 = undefined;
      try {
        for (var $__10 = void 0,
            $__9 = (this.cells)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__12 = ($__10 = $__9.next()).done); $__12 = true) {
          var row = $__10.value;
          {
            var s = '';
            var $__5 = true;
            var $__6 = false;
            var $__7 = undefined;
            try {
              for (var $__3 = void 0,
                  $__2 = (row)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
                var cell = $__3.value;
                {
                  if (isJelly(cell))
                    s += cell.kind;
                  else if (cell)
                    s += 'x';
                  else
                    s += ' ';
                }
              }
            } catch ($__8) {
              $__6 = true;
              $__7 = $__8;
            } finally {
              try {
                if (!$__5 && $__2.return != null) {
                  $__2.return();
                }
              } finally {
                if ($__6) {
                  throw $__7;
                }
              }
            }
            rows.push(s);
          }
        }
      } catch ($__15) {
        $__13 = true;
        $__14 = $__15;
      } finally {
        try {
          if (!$__12 && $__9.return != null) {
            $__9.return();
          }
        } finally {
          if ($__13) {
            throw $__14;
          }
        }
      }
      this.undoStack.push(rows);
    },
    get canUndo() {
      return this.undoStack.length > 0;
    },
    undo: function() {
      var state = this.undoStack.pop();
      if (!state)
        return ;
      var undoStack = this.undoStack;
      this.loadMap(state);
      this.undoStack = undoStack;
    },
    reset: function() {
      var state = this.undoStack[0];
      if (!state)
        return ;
      this.loadMap(state);
    }
  }, {});
}());
var JellyCell = (function() {
  function JellyCell(jelly, x, y, color) {
    this.jelly = jelly;
    this.x = x;
    this.y = y;
    this.dom = document.createElement('div');
    this.dom.className = 'cell jelly ' + color;
  }
  return ($traceurRuntime.createClass)(JellyCell, {}, {});
}());
var Jelly = (function() {
  function Jelly(stage, x, y, kind) {
    var $__0 = this;
    this.stage = stage;
    this.x = x;
    this.y = y;
    var color = getColor(kind);
    this.isFixed = isFixed(kind);
    this.kind = kind.toLowerCase();
    this.dom = document.createElement('div');
    this.updatePosition(this.x, this.y);
    this.dom.className = 'cell jellybox';
    var cell = new JellyCell(this, 0, 0, color);
    this.dom.appendChild(cell.dom);
    this.cells = [cell];
    this.dom.addEventListener('pointerdown', (function(e) {
      var pointerId = e.pointerId;
      var startX = e.clientX;
      var move = (function(e) {
        e.preventDefault();
        if (e.pointerId !== pointerId)
          return ;
        var distance = Math.abs(e.clientX - startX);
        if ($__0.stage.busy || distance < 24)
          return ;
        var dir = e.clientX - startX < 0 ? -1 : 1;
        stage.trySlide($__0, dir);
        startX += dir * 48;
      });
      var doc = $__0.dom.ownerDocument;
      var end = (function() {
        if (e.pointerId !== pointerId)
          return ;
        doc.removeEventListener('pointermove', move, true);
        doc.removeEventListener('pointerup', end, true);
      });
      doc.addEventListener('pointermove', move, true);
      doc.addEventListener('pointerup', end, true);
      e.preventDefault();
    }));
  }
  return ($traceurRuntime.createClass)(Jelly, {
    cellCoords: function() {
      var $__0 = this;
      return this.cells.map((function(cell) {
        return [$__0.x + cell.x, $__0.y + cell.y];
      }));
    },
    slide: function(dir, cb) {
      var $__0 = this;
      var end = (function() {
        $__0.dom.style[animation] = '';
        $__0.dom.removeEventListener(animationEnd, end);
        cb();
      });
      this.dom.addEventListener(animationEnd, end);
      this.dom.style[animation] = '300ms ease-out';
      if (dir == 1)
        this.dom.style[animationName] = 'slideRight';
      else
        this.dom.style[animationName] = 'slideLeft';
    },
    updatePosition: function(x, y) {
      this.x = x;
      this.y = y;
      moveToCell(this.dom, this.x, this.y);
    },
    merge: function(other) {
      var dx = other.x - this.x;
      var dy = other.y - this.y;
      var $__5 = true;
      var $__6 = false;
      var $__7 = undefined;
      try {
        for (var $__3 = void 0,
            $__2 = (other.cells)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__5 = ($__3 = $__2.next()).done); $__5 = true) {
          var cell = $__3.value;
          {
            this.cells.push(cell);
            cell.x += dx;
            cell.y += dy;
            moveToCell(cell.dom, cell.x, cell.y);
            this.dom.appendChild(cell.dom);
          }
        }
      } catch ($__8) {
        $__6 = true;
        $__7 = $__8;
      } finally {
        try {
          if (!$__5 && $__2.return != null) {
            $__2.return();
          }
        } finally {
          if ($__6) {
            throw $__7;
          }
        }
      }
      other.cells = null;
      other.dom.parentNode.removeChild(other.dom);
      var $__19 = true;
      var $__20 = false;
      var $__21 = undefined;
      try {
        for (var $__17 = void 0,
            $__16 = (this.cells)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__19 = ($__17 = $__16.next()).done); $__19 = true) {
          var cell = $__17.value;
          {
            var $__12 = true;
            var $__13 = false;
            var $__14 = undefined;
            try {
              for (var $__10 = void 0,
                  $__9 = (this.cells)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__12 = ($__10 = $__9.next()).done); $__12 = true) {
                var othercell = $__10.value;
                {
                  if (othercell == cell)
                    continue;
                  if (othercell.x == cell.x + 1 && othercell.y == cell.y)
                    cell.dom.style.borderRight = 'none';
                  else if (othercell.x == cell.x - 1 && othercell.y == cell.y)
                    cell.dom.style.borderLeft = 'none';
                  else if (othercell.x == cell.x && othercell.y == cell.y + 1)
                    cell.dom.style.borderBottom = 'none';
                  else if (othercell.x == cell.x && othercell.y == cell.y - 1)
                    cell.dom.style.borderTop = 'none';
                }
              }
            } catch ($__15) {
              $__13 = true;
              $__14 = $__15;
            } finally {
              try {
                if (!$__12 && $__9.return != null) {
                  $__9.return();
                }
              } finally {
                if ($__13) {
                  throw $__14;
                }
              }
            }
          }
        }
      } catch ($__22) {
        $__20 = true;
        $__21 = $__22;
      } finally {
        try {
          if (!$__19 && $__16.return != null) {
            $__16.return();
          }
        } finally {
          if ($__20) {
            throw $__21;
          }
        }
      }
      this.isFixed = this.isFixed || other.isFixed;
    },
    addLock: function() {
      var lock = document.createElement('div');
      this.cells[0].dom.appendChild(lock);
      var stage = this.stage;
      var lockDir = 'above';
      if (stage.isWallAt(this.x, this.y - 1))
        lockDir = 'above';
      else if (stage.isWallAt(this.x, this.y + 1))
        lockDir = 'below';
      else if (stage.isWallAt(this.x - 1, this.y))
        lockDir = 'left';
      else
        lockDir = 'right';
      lock.className = ("lock " + lockDir);
    }
  }, {});
}());
var stage = null;
function loadLevel() {
  var level = +location.hash.slice(1) || 0;
  if (!stage)
    stage = new Stage(document.getElementById('map'), levels[level]);
  else
    stage.loadMap(levels[level]);
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
loadLevel();
stage.onDoneChange = (function() {
  document.getElementById('done').style.display = stage.done ? 'block' : '';
});
document.getElementById('undo').onclick = (function() {
  return stage.undo();
});
document.getElementById('reset').onclick = (function() {
  return stage.reset();
});
window.addEventListener('hashchange', loadLevel);
//# sourceMappingURL=jelly.js.map

'use strict';
var levels = [['xxxxxxxxxxxxxx', 'x            x', 'x            x', 'x            x', 'x            x', 'x      r     x', 'x      xx    x', 'x  g     r b x', 'xxbxxxg xxxxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x            x', 'x            x', 'x            x', 'x            x', 'x     g   g  x', 'x   r r   r  x', 'xxxxx x x xxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x            x', 'x            x', 'x            x', 'x   bg  x g  x', 'xxx xxxrxxx  x', 'x      b     x', 'xxx xxxrxxxxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x       r    x', 'x       b    x', 'x       x    x', 'x b r        x', 'x b r      b x', 'xxx x      xxx', 'xxxxx xxxxxxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x            x', 'xrg  gg      x', 'xxx xxxx xx  x', 'xrg          x', 'xxxxx  xx   xx', 'xxxxxx xx  xxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'xxxxxxx      x', 'xxxxxxx g    x', 'x       xx   x', 'x r   b      x', 'x x xxx x g  x', 'x         x bx', 'x       r xxxx', 'x   xxxxxxxxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x          r x', 'x          x x', 'x     b   b  x', 'x     x  rr  x', 'x         x  x', 'x R  Bx x x  x', 'x x  xx x x  x', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'xxx  x  x   xx', 'xx   g  b   xx', 'xx   x  x   xx', 'xx   B  G   xx', 'xxg        bxx', 'xxxg      bxxx', 'xxxx      xxxx', 'xxxxxxxxxxxxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x            x', 'x            x', 'x            x', 'x            x', 'x          rbx', 'x    x     xxx', 'xb        11xx', 'xx  Rx  x xxxx', 'xxxxxxxxxxxxxx'], ['xxxxxxxxxxxxxx', 'x   gr       x', 'x   11 2     x', 'x    x x     x', 'x            x', 'x  x  x      x', 'x        x  rx', 'xx   x     gxx', 'x          xxx', 'xxxxxxxxxxxxxx']];
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
      this.cells = map.map((function(line, y) {
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
      var $__27,
          $__28;
      for (var y = 0; y < this.cells.length; y++) {
        for (var x = 0; x < this.cells[0].length; x++) {
          var cell = this.cells[y][x];
          if (!cell || cell.tagName != 'TD')
            continue;
          var border = 'solid 1px #777';
          var edges = [['borderBottom', 0, 1], ['borderTop', 0, -1], ['borderLeft', -1, 0], ['borderRight', 1, 0]];
          var $__8 = true;
          var $__9 = false;
          var $__10 = undefined;
          try {
            for (var $__6 = void 0,
                $__5 = (edges)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
              var $__26 = $__6.value,
                  attr = ($__27 = $__26[$traceurRuntime.toProperty(Symbol.iterator)](), ($__28 = $__27.next()).done ? void 0 : $__28.value),
                  dx = ($__28 = $__27.next()).done ? void 0 : $__28.value,
                  dy = ($__28 = $__27.next()).done ? void 0 : $__28.value;
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
          } catch ($__11) {
            $__9 = true;
            $__10 = $__11;
          } finally {
            try {
              if (!$__8 && $__5.return != null) {
                $__5.return();
              }
            } finally {
              if ($__9) {
                throw $__10;
              }
            }
          }
        }
      }
    },
    addLocks: function() {
      var $__8 = true;
      var $__9 = false;
      var $__10 = undefined;
      try {
        for (var $__6 = void 0,
            $__5 = (this.jellies)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
          var jelly = $__6.value;
          {
            if (jelly.isFixed)
              jelly.addLock();
          }
        }
      } catch ($__11) {
        $__9 = true;
        $__10 = $__11;
      } finally {
        try {
          if (!$__8 && $__5.return != null) {
            $__5.return();
          }
        } finally {
          if ($__9) {
            throw $__10;
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
      var $__27,
          $__28,
          $__30,
          $__31;
      var targetX = jelly.x + dx;
      var targetY = jelly.y + dy;
      var $__8 = true;
      var $__9 = false;
      var $__10 = undefined;
      try {
        for (var $__6 = void 0,
            $__5 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
          var $__26 = $__6.value,
              x = ($__27 = $__26[$traceurRuntime.toProperty(Symbol.iterator)](), ($__28 = $__27.next()).done ? void 0 : $__28.value),
              y = ($__28 = $__27.next()).done ? void 0 : $__28.value;
          {
            this.cells[y][x] = null;
          }
        }
      } catch ($__11) {
        $__9 = true;
        $__10 = $__11;
      } finally {
        try {
          if (!$__8 && $__5.return != null) {
            $__5.return();
          }
        } finally {
          if ($__9) {
            throw $__10;
          }
        }
      }
      jelly.updatePosition(targetX, targetY);
      var $__15 = true;
      var $__16 = false;
      var $__17 = undefined;
      try {
        for (var $__13 = void 0,
            $__12 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__15 = ($__13 = $__12.next()).done); $__15 = true) {
          var $__29 = $__13.value,
              x = ($__30 = $__29[$traceurRuntime.toProperty(Symbol.iterator)](), ($__31 = $__30.next()).done ? void 0 : $__31.value),
              y = ($__31 = $__30.next()).done ? void 0 : $__31.value;
          {
            this.cells[y][x] = jelly;
          }
        }
      } catch ($__18) {
        $__16 = true;
        $__17 = $__18;
      } finally {
        try {
          if (!$__15 && $__12.return != null) {
            $__12.return();
          }
        } finally {
          if ($__16) {
            throw $__17;
          }
        }
      }
    },
    isWallAt: function(x, y) {
      return this.cells[y][x] != null && !isJelly(this.cells[y][x]);
    },
    checkFilled: function(jelly, dx, dy) {
      var $__29,
          $__27;
      var $__8 = true;
      var $__9 = false;
      var $__10 = undefined;
      try {
        for (var $__6 = void 0,
            $__5 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
          var $__26 = $__6.value,
              x = ($__29 = $__26[$traceurRuntime.toProperty(Symbol.iterator)](), ($__27 = $__29.next()).done ? void 0 : $__27.value),
              y = ($__27 = $__29.next()).done ? void 0 : $__27.value;
          {
            var next = this.cells[y + dy][x + dx];
            if (next && next != jelly)
              return next;
          }
        }
      } catch ($__11) {
        $__9 = true;
        $__10 = $__11;
      } finally {
        try {
          if (!$__8 && $__5.return != null) {
            $__5.return();
          }
        } finally {
          if ($__9) {
            throw $__10;
          }
        }
      }
      return false;
    },
    canMove: function(jelly, dir) {
      if (jelly.isFixed)
        return false;
      var $__8 = true;
      var $__9 = false;
      var $__10 = undefined;
      try {
        for (var $__6 = void 0,
            $__5 = (this.getAdjacentObjects(jelly, dir))[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
          var object = $__6.value;
          {
            if (!isJelly(object) || object.isFixed)
              return false;
          }
        }
      } catch ($__11) {
        $__9 = true;
        $__10 = $__11;
      } finally {
        try {
          if (!$__8 && $__5.return != null) {
            $__5.return();
          }
        } finally {
          if ($__9) {
            throw $__10;
          }
        }
      }
      return true;
    },
    getAdjacentObjects: function(jelly, dir) {
      var $__0 = this;
      var found = [];
      var inner = (function(jelly) {
        var $__29,
            $__27;
        found.push(jelly);
        var $__8 = true;
        var $__9 = false;
        var $__10 = undefined;
        try {
          for (var $__6 = void 0,
              $__5 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
            var $__26 = $__6.value,
                x = ($__29 = $__26[$traceurRuntime.toProperty(Symbol.iterator)](), ($__27 = $__29.next()).done ? void 0 : $__27.value),
                y = ($__27 = $__29.next()).done ? void 0 : $__27.value;
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
        } catch ($__11) {
          $__9 = true;
          $__10 = $__11;
        } finally {
          try {
            if (!$__8 && $__5.return != null) {
              $__5.return();
            }
          } finally {
            if ($__9) {
              throw $__10;
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
        var $__8 = true;
        var $__9 = false;
        var $__10 = undefined;
        try {
          for (var $__6 = void 0,
              $__5 = (this.jellies)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
            var jelly = $__6.value;
            {
              if (!jelly.isFixed && !this.checkFilled(jelly, 0, 1)) {
                this.move(jelly, 0, 1);
                moved = true;
                didOneMove = true;
              }
            }
          }
        } catch ($__11) {
          $__9 = true;
          $__10 = $__11;
        } finally {
          try {
            if (!$__8 && $__5.return != null) {
              $__5.return();
            }
          } finally {
            if ($__9) {
              throw $__10;
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
      var $__29,
          $__27;
      var jelly;
      while (jelly = this.doOneMerge()) {
        var $__8 = true;
        var $__9 = false;
        var $__10 = undefined;
        try {
          for (var $__6 = void 0,
              $__5 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
            var $__26 = $__6.value,
                x = ($__29 = $__26[$traceurRuntime.toProperty(Symbol.iterator)](), ($__27 = $__29.next()).done ? void 0 : $__27.value),
                y = ($__27 = $__29.next()).done ? void 0 : $__27.value;
            {
              this.cells[y][x] = jelly;
            }
          }
        } catch ($__11) {
          $__9 = true;
          $__10 = $__11;
        } finally {
          try {
            if (!$__8 && $__5.return != null) {
              $__5.return();
            }
          } finally {
            if ($__9) {
              throw $__10;
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
      var $__8 = true;
      var $__9 = false;
      var $__10 = undefined;
      try {
        for (var $__6 = void 0,
            $__5 = (this.jellies)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
          var jelly = $__6.value;
          {
            kinds[jelly.kind] = true;
          }
        }
      } catch ($__11) {
        $__9 = true;
        $__10 = $__11;
      } finally {
        try {
          if (!$__8 && $__5.return != null) {
            $__5.return();
          }
        } finally {
          if ($__9) {
            throw $__10;
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
      var $__29,
          $__27,
          $__30,
          $__31;
      var $__22 = true;
      var $__23 = false;
      var $__24 = undefined;
      try {
        for (var $__20 = void 0,
            $__19 = (this.jellies)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__22 = ($__20 = $__19.next()).done); $__22 = true) {
          var jelly = $__20.value;
          {
            var $__15 = true;
            var $__16 = false;
            var $__17 = undefined;
            try {
              for (var $__13 = void 0,
                  $__12 = (jelly.cellCoords())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__15 = ($__13 = $__12.next()).done); $__15 = true) {
                var $__26 = $__13.value,
                    x = ($__29 = $__26[$traceurRuntime.toProperty(Symbol.iterator)](), ($__27 = $__29.next()).done ? void 0 : $__27.value),
                    y = ($__27 = $__29.next()).done ? void 0 : $__27.value;
                {
                  var $__8 = true;
                  var $__9 = false;
                  var $__10 = undefined;
                  try {
                    for (var $__6 = void 0,
                        $__5 = ([[1, 0], [0, 1]])[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
                      var $__28 = $__6.value,
                          dx = ($__30 = $__28[$traceurRuntime.toProperty(Symbol.iterator)](), ($__31 = $__30.next()).done ? void 0 : $__31.value),
                          dy = ($__31 = $__30.next()).done ? void 0 : $__31.value;
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
                  } catch ($__11) {
                    $__9 = true;
                    $__10 = $__11;
                  } finally {
                    try {
                      if (!$__8 && $__5.return != null) {
                        $__5.return();
                      }
                    } finally {
                      if ($__9) {
                        throw $__10;
                      }
                    }
                  }
                }
              }
            } catch ($__18) {
              $__16 = true;
              $__17 = $__18;
            } finally {
              try {
                if (!$__15 && $__12.return != null) {
                  $__12.return();
                }
              } finally {
                if ($__16) {
                  throw $__17;
                }
              }
            }
          }
        }
      } catch ($__25) {
        $__23 = true;
        $__24 = $__25;
      } finally {
        try {
          if (!$__22 && $__19.return != null) {
            $__19.return();
          }
        } finally {
          if ($__23) {
            throw $__24;
          }
        }
      }
      return null;
    },
    saveState: function() {
      var rows = [];
      var $__15 = true;
      var $__16 = false;
      var $__17 = undefined;
      try {
        for (var $__13 = void 0,
            $__12 = (this.cells)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__15 = ($__13 = $__12.next()).done); $__15 = true) {
          var row = $__13.value;
          {
            var s = '';
            var $__8 = true;
            var $__9 = false;
            var $__10 = undefined;
            try {
              for (var $__6 = void 0,
                  $__5 = (row)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
                var cell = $__6.value;
                {
                  if (isJelly(cell))
                    s += cell.kind;
                  else if (cell)
                    s += 'x';
                  else
                    s += ' ';
                }
              }
            } catch ($__11) {
              $__9 = true;
              $__10 = $__11;
            } finally {
              try {
                if (!$__8 && $__5.return != null) {
                  $__5.return();
                }
              } finally {
                if ($__9) {
                  throw $__10;
                }
              }
            }
            rows.push(s);
          }
        }
      } catch ($__18) {
        $__16 = true;
        $__17 = $__18;
      } finally {
        try {
          if (!$__15 && $__12.return != null) {
            $__12.return();
          }
        } finally {
          if ($__16) {
            throw $__17;
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
      var $__4 = this;
      return (function() {
        var $__2 = 0,
            $__3 = [];
        var $__8 = true;
        var $__9 = false;
        var $__10 = undefined;
        try {
          for (var $__6 = void 0,
              $__5 = ($__4.cells)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
            var cell = $__6.value;
            $__3[$__2++] = [$__4.x + cell.x, $__4.y + cell.y];
          }
        } catch ($__11) {
          $__9 = true;
          $__10 = $__11;
        } finally {
          try {
            if (!$__8 && $__5.return != null) {
              $__5.return();
            }
          } finally {
            if ($__9) {
              throw $__10;
            }
          }
        }
        return $__3;
      }());
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
      var $__8 = true;
      var $__9 = false;
      var $__10 = undefined;
      try {
        for (var $__6 = void 0,
            $__5 = (other.cells)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__8 = ($__6 = $__5.next()).done); $__8 = true) {
          var cell = $__6.value;
          {
            this.cells.push(cell);
            cell.x += dx;
            cell.y += dy;
            moveToCell(cell.dom, cell.x, cell.y);
            this.dom.appendChild(cell.dom);
          }
        }
      } catch ($__11) {
        $__9 = true;
        $__10 = $__11;
      } finally {
        try {
          if (!$__8 && $__5.return != null) {
            $__5.return();
          }
        } finally {
          if ($__9) {
            throw $__10;
          }
        }
      }
      other.cells = null;
      other.dom.parentNode.removeChild(other.dom);
      var $__22 = true;
      var $__23 = false;
      var $__24 = undefined;
      try {
        for (var $__20 = void 0,
            $__19 = (this.cells)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__22 = ($__20 = $__19.next()).done); $__22 = true) {
          var cell = $__20.value;
          {
            var $__15 = true;
            var $__16 = false;
            var $__17 = undefined;
            try {
              for (var $__13 = void 0,
                  $__12 = (this.cells)[$traceurRuntime.toProperty(Symbol.iterator)](); !($__15 = ($__13 = $__12.next()).done); $__15 = true) {
                var othercell = $__13.value;
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
            } catch ($__18) {
              $__16 = true;
              $__17 = $__18;
            } finally {
              try {
                if (!$__15 && $__12.return != null) {
                  $__12.return();
                }
              } finally {
                if ($__16) {
                  throw $__17;
                }
              }
            }
          }
        }
      } catch ($__25) {
        $__23 = true;
        $__24 = $__25;
      } finally {
        try {
          if (!$__22 && $__19.return != null) {
            $__19.return();
          }
        } finally {
          if ($__23) {
            throw $__24;
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

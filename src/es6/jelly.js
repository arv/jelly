'use strict';

var levels = [
  `xxxxxxxxxxxxxx
   x            x
   x            x
   x            x
   x            x
   x      r     x
   x      xx    x
   x  g     r b x
   xxbxxxg xxxxxx
   xxxxxxxxxxxxxx`,

  `xxxxxxxxxxxxxx
   x            x
   x            x
   x            x
   x            x
   x            x
   x     g   g  x
   x   r r   r  x
   xxxxx x x xxxx
   xxxxxxxxxxxxxx`,

  `xxxxxxxxxxxxxx
   x            x
   x            x
   x            x
   x            x
   x   bg  x g  x
   xxx xxxrxxx  x
   x      b     x
   xxx xxxrxxxxxx
   xxxxxxxxxxxxxx`,

  `xxxxxxxxxxxxxx
   x            x
   x       r    x
   x       b    x
   x       x    x
   x b r        x
   x b r      b x
   xxx x      xxx
   xxxxx xxxxxxxx
   xxxxxxxxxxxxxx`,

  `xxxxxxxxxxxxxx
   x            x
   x            x
   xrg  gg      x
   xxx xxxx xx  x
   xrg          x
   xxxxx  xx   xx
   xxxxxx xx  xxx
   xxxxxxxxxxxxxx`,

  `xxxxxxxxxxxxxx
   xxxxxxx      x
   xxxxxxx g    x
   x       xx   x
   x r   b      x
   x x xxx x g  x
   x         x bx
   x       r xxxx
   x   xxxxxxxxxx
   xxxxxxxxxxxxxx`,

  `xxxxxxxxxxxxxx
   x            x
   x          r x
   x          x x
   x     b   b  x
   x     x  rr  x
   x         x  x
   x R  Bx x x  x
   x x  xx x x  x
   xxxxxxxxxxxxxx`,

  `xxxxxxxxxxxxxx
   xxx  x  x   xx
   xx   g  b   xx
   xx   x  x   xx
   xx   B  G   xx
   xxg        bxx
   xxxg      bxxx
   xxxx      xxxx
   xxxxxxxxxxxxxx
   xxxxxxxxxxxxxx`,

  `xxxxxxxxxxxxxx
   x            x
   x            x
   x            x
   x            x
   x          rbx
   x    x     xxx
   xb        11xx
   xx  Rx  x xxxx
   xxxxxxxxxxxxxx`,

  `xxxxxxxxxxxxxx
   x   gr       x
   x   11 2     x
   x    x x     x
   x            x
   x  x  x      x
   x        x  rx
   xx   x     gxx
   x          xxx
   xxxxxxxxxxxxxx`,
];

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


class Stage {
  constructor(dom, map) {
    this.dom = dom;

    // Capture and swallow all click events during animations.
    this.busy = false;

    this.loadMap(map);
  }

  loadMap(map) {
    this.undoStack = [];
    this.jellies = [];
    this.dom.textContent = '';

    var table = document.createElement('table');
    this.dom.appendChild(table);
    var lines = map.trim().split(/\s*\n\s*/);
    this.cells = lines.map((line, y) => {
      var row = line.split('');
      var tr = document.createElement('tr');
      table.appendChild(tr);
      return row.map((char, x) => {
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
          var jelly = new Jelly(this, x, y, row[x]);
          this.dom.appendChild(jelly.dom);
          this.jellies.push(jelly);
          return jelly;
        }

        return null;
      });
    });
    this.addBorders();
    this.addLocks();

    this.checkForMerges();
  }

  addBorders() {
    for (var y = 0; y < this.cells.length; y++) {
      for (var x = 0; x < this.cells[0].length; x++) {
        var cell = this.cells[y][x];
        if (!cell || cell.tagName != 'TD')
          continue;
        var border = 'solid 1px #777';
        var edges = [
          ['borderBottom',  0,  1],
          ['borderTop',     0, -1],
          ['borderLeft',   -1,  0],
          ['borderRight',   1,  0],
        ];
        for (var [attr, dx, dy] of edges) {
          if (y + dy < 0 || y + dy >=  this.cells.length)
            continue;
          if (x + dx < 0 || x + dx >= this.cells[0].length)
            continue;
          var other = this.cells[y + dy][x + dx];
          if (!other || other.tagName != 'TD')
            cell.style[attr] = border;
        }
      }
    }
  }

  addLocks() {
    for (var jelly of this.jellies) {
      if (jelly.isFixed)
        jelly.addLock();
    }
  }

  waitForAnimation(cb) {
    var end = () => {
      this.dom.removeEventListener(transitionEnd, end);
      cb();
    };
    this.dom.addEventListener(transitionEnd, end);
  }

  trySlide(jelly, dir) {
    if (!this.canMove(jelly, dir))
      return;

    this.saveState();

    this.busy = true;
    var jellies = this.getAdjacentObjects(jelly, dir).filter(isJelly);
    jellies.reverse().forEach((jelly) => {
      this.move(jelly, dir, 0);
    });

    this.waitForAnimation(() => {
      this.checkFall(() => {
        this.checkForMerges();
        this.busy = false;
      })
    });
  }

  move(jelly, dx, dy) {
    var targetX = jelly.x + dx;
    var targetY = jelly.y + dy;
    for (var [x, y] of jelly.cellCoords()) {
      this.cells[y][x] = null;
    }
    jelly.updatePosition(targetX, targetY);
    for (var [x, y] of jelly.cellCoords()) {
      this.cells[y][x] = jelly;
    }
  }

  isWallAt(x, y) {
    return this.cells[y][x] != null && !isJelly(this.cells[y][x]);
  }

  checkFilled(jelly, dx, dy) {
    for (var [x, y] of jelly.cellCoords()) {
      var next = this.cells[y + dy][x + dx];
      if (next && next != jelly)
        return next;
    }
    return false;
  }

  canMove(jelly, dir) {
    if (jelly.isFixed)
      return false;
    for (var object of this.getAdjacentObjects(jelly, dir)) {
      // TODO: The wall should be objects too.
      if (!isJelly(object) || object.isFixed)
        return false;
      // TODO: Check if jelly is fixed (needed for later levels)
    }
    return true;
  }

  /**
   * Returns the jellies and walls that are touching in the given direction.
   * Including the jelly passed as argument.
   */
  getAdjacentObjects(jelly, dir) {
    // ES6 has Set but Traceur does not provide a polyfill at this time.
    var found = [];

    var inner = (jelly) => {
      found.push(jelly);
      for (var [x, y] of jelly.cellCoords()) {
        var next = this.cells[y][x + dir];
        if (next && next != jelly && found.indexOf(next) == -1) {
          if (isJelly(next))
            inner(next);
          else  // wall
            found.push(next);
        }
      }
    };

    inner(jelly);
    return found;
  }

  checkFall(cb) {
    var moved = false;
    var didOneMove = true;
    while (didOneMove) {
      didOneMove = false;
      for (var jelly of this.jellies) {
        if (!jelly.isFixed && !this.checkFilled(jelly, 0, 1)) {
          this.move(jelly, 0, 1);
          moved = true;
          didOneMove = true;
        }
      }
    }
    if (moved)
      this.waitForAnimation(cb);
    else
      cb();
  }

  checkForMerges() {
    var jelly;
    while (jelly = this.doOneMerge()) {
      for (var [x, y] of jelly.cellCoords()) {
        this.cells[y][x] = jelly;
      }
    }
    this.checkForCompletion();
  }

  get done() {
    return this._done;
  }

  checkForCompletion() {
    var kinds = {};
    for (var jelly of this.jellies) {
      kinds[jelly.kind] = true;
    }

    var done = Object.keys(kinds).length === this.jellies.length;
    if (done != this._done) {
      this._done = done;
      if (this.onDoneChange)
        this.onDoneChange();
    }
  }

  doOneMerge() {
    for (var jelly of this.jellies) {
      for (var [x, y] of jelly.cellCoords()) {
        // Only look right and down; left and up are handled by that side
        // itself looking right and down.
        for (var [dx, dy] of [[1, 0], [0, 1]]) {
          var other = this.cells[y + dy][x + dx]
          if (!other || !isJelly(other))
            continue;
          if (other == jelly)
            continue;
          if (jelly.kind != other.kind)
            continue;
          jelly.merge(other);
          this.jellies = this.jellies.filter((j) => j != other);
          return jelly;
        }
      }
    }
    return null;
  }

  saveState() {
    var rows = [];
    for (var row of this.cells) {
      var s = '';
      for (var cell of row) {
        if (isJelly(cell))
          s += cell.kind;
        else if (cell)
          s += 'x';
        else
          s += ' ';
      }
      rows.push(s);
    }
    this.undoStack.push(rows);
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  undo() {
    var state = this.undoStack.pop();
    if (!state)
      return;
    var undoStack = this.undoStack;
    this.loadMap(state);
    this.undoStack = undoStack;
  }

  reset() {
    var state = this.undoStack[0];
    if (!state)
      return;
    this.loadMap(state);
  }
}

class JellyCell {
  constructor(jelly, x, y, color) {
    this.jelly = jelly;
    this.x = x;
    this.y = y;
    this.dom = document.createElement('div');
    this.dom.className = 'cell jelly ' + color;
  }
}

class Jelly {
  constructor(stage, x, y, kind) {
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

    this.dom.addEventListener('pointerdown', (e) => {
      var pointerId = e.pointerId;
      var startX = e.clientX;

      var move = (e) => {
        e.preventDefault();
        if (e.pointerId !== pointerId)
          return;

        var distance = Math.abs(e.clientX - startX);
        if (this.stage.busy || distance < 24)
          return;

        var dir = e.clientX - startX < 0 ? -1 : 1;
        stage.trySlide(this, dir);
        startX += dir * 48;
      };

      var doc = this.dom.ownerDocument;
      var end = () => {
        if (e.pointerId !== pointerId)
          return;

        doc.removeEventListener('pointermove', move, true);
        doc.removeEventListener('pointerup', end, true);
      };

      doc.addEventListener('pointermove', move, true);
      doc.addEventListener('pointerup', end, true);
      e.preventDefault();
    });
  }

  cellCoords() {
    return this.cells.map((cell) => [this.x + cell.x, this.y + cell.y]);
  }

  slide(dir, cb) {
    var end = () => {
      this.dom.style[animation] = '';
      this.dom.removeEventListener(animationEnd, end);
      cb();
    };
    this.dom.addEventListener(animationEnd, end);
    this.dom.style[animation] = '300ms ease-out';
    if (dir == 1)
      this.dom.style[animationName] = 'slideRight';
    else
      this.dom.style[animationName] = 'slideLeft';
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    moveToCell(this.dom, this.x, this.y);
  }

  merge(other) {
    // Reposition other's cells as children of this jelly.
    var dx = other.x - this.x;
    var dy = other.y - this.y;
    for (var cell of other.cells) {
      this.cells.push(cell);
      cell.x += dx;
      cell.y += dy;
      moveToCell(cell.dom, cell.x, cell.y);
      this.dom.appendChild(cell.dom);
    }

    // Delete references from/to other.
    other.cells = null;
    other.dom.parentNode.removeChild(other.dom);

    // Remove internal borders.
    for (var cell of this.cells) {
      for (var othercell of this.cells) {
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

    this.isFixed = this.isFixed || other.isFixed;
  }

  addLock() {
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

    lock.className = `lock ${lockDir}`;
  }
}

var stage = null;  // Safari bug. Needs assignment to shadow element with ID.

function loadLevel() {
  var level = +location.hash.slice(1) || 0;
  if (!stage)
    stage = new Stage(document.getElementById('map'), levels[level]);
  else
    stage.loadMap(levels[level]);

  levelPicker.value = level;
}

var levelPicker = document.getElementById('level');
levelPicker.addEventListener('change', () => {
  location.hash = levelPicker.value;
});
for (var i = 0; i < levels.length; i++) {
  var option = new Option(`Level ${i + 1}`, i);
  levelPicker.appendChild(option);
}


loadLevel();

stage.onDoneChange = () => {
  document.getElementById('done').style.display = stage.done ? 'block' : '';
}

document.getElementById('undo').onclick = () => stage.undo();
document.getElementById('reset').onclick = () => stage.reset();

window.addEventListener('hashchange', loadLevel);

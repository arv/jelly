var levels = [
  // [ 'xxxxxxxxxxxxxx',
  //   'x            x',
  //   'x            x',
  //   'x            x',
  //   'x            x',
  //   'x            x',
  //   'x            x',
  //   'x R    r     x',
  //   'x xxxxxxxxxxxx',
  //   'xxxxxxxxxxxxxx', ],

  [ 'xxxxxxxxxxxxxx',
    'x            x',
    'x            x',
    'x      r     x',
    'x      xx    x',
    'x  g     r b x',
    'xxbxxxg xxxxxx',
    'xxxxxxxxxxxxxx', ],

  [ 'xxxxxxxxxxxxxx',
    'x            x',
    'x            x',
    'x            x',
    'x     g   g  x',
    'x   r r   r  x',
    'xxxxx x x xxxx',
    'xxxxxxxxxxxxxx', ],

  [ 'xxxxxxxxxxxxxx',
    'x            x',
    'x            x',
    'x   bg  x g  x',
    'xxx xxxrxxx  x',
    'x      b     x',
    'xxx xxxrxxxxxx',
    'xxxxxxxxxxxxxx', ],

  [ 'xxxxxxxxxxxxxx',
    'x            x',
    'x       r    x',
    'x       b    x',
    'x       x    x',
    'x b r        x',
    'x b r      b x',
    'xxx x      xxx',
    'xxxxx xxxxxxxx',
    'xxxxxxxxxxxxxx', ],

  [ 'xxxxxxxxxxxxxx',
    'x            x',
    'x            x',
    'xrg  gg      x',
    'xxx xxxx xx  x',
    'xrg          x',
    'xxxxx  xx   xx',
    'xxxxxx xx  xxx',
    'xxxxxxxxxxxxxx', ],

  [ 'xxxxxxxxxxxxxx',
    'xxxxxxx      x',
    'xxxxxxx g    x',
    'x       xx   x',
    'x r   b      x',
    'x x xxx x g  x',
    'x         x bx',
    'x       r xxxx',
    'x   xxxxxxxxxx',
    'xxxxxxxxxxxxxx', ],

  [ 'xxxxxxxxxxxxxx',
    'x            x',
    'x          r x',
    'x          x x',
    'x     b   b  x',
    'x     x  rr  x',
    'x         x  x',
    'x R  Bx x x  x',
    'x x  xx x x  x',
    'xxxxxxxxxxxxxx', ],

  [ 'xxxxxxxxxxxxxx',
    'xxx  x  x   xx',
    'xx   g  b   xx',
    'xx   x  x   xx',
    'xx   B  G   xx',
    'xxg        bxx',
    'xxxg      bxxx',
    'xxxx      xxxx',
    'xxxxxxxxxxxxxx',
    'xxxxxxxxxxxxxx', ],
  ]


var CELL_SIZE = 48;

var oldWebKit = !('animation' in document.documentElement.style);
var animation = oldWebKit ? 'webkitAnimation' : 'animation';
var animationName = oldWebKit ? 'webkitAnimationName' : 'animationName';
var animationEnd = oldWebKit ? 'webkitAnimationEnd' : 'animationend';

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

class Stage {
  constructor(dom, map) {
    this.dom = dom;
    this.jellies = [];
    this.loadMap(map);

    // Capture and swallow all click events during animations.
    this.busy = false;
    var maybeSwallowEvent = (e) => {
      e.preventDefault();
      if (this.busy)
        e.stopPropagation();
    };
    for (var event of ['contextmenu', 'click']) {
      this.dom.addEventListener(event, maybeSwallowEvent, true)
    }

    this.checkForMerges();
  }

  loadMap(map) {
    var table = document.createElement('table');
    this.dom.appendChild(table);
    this.cells = map.map((line, y) => {
      var row = line.split('');
      var tr = document.createElement('tr');
      table.appendChild(tr);
      return row.map((char, x) => {
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
      });
    });
    this.addBorders();
    this.addLocks();
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

  trySlide(jelly, dir) {
    if (!this.canMove(jelly, dir))
      return;
    this.busy = true;
    var jellies = this.getAdjacentObjects(jelly, dir).filter(isJelly);
    jellies.reverse().forEach((jelly) => {
      this.move(jelly, dir, 0);

      jelly.slide(dir, () => {
        this.checkFall();
        this.checkForMerges();
        this.busy = false;
      });

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
      if (!isJelly(object))
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

  checkFall() {
    var moved = true
    while (moved) {
      moved = false;
      for (var jelly of this.jellies) {
        if (!this.checkFilled(jelly, 0, 1)) {
          this.move(jelly, 0, 1);
          moved = true;
        }
      }
    }
  }

  checkForMerges() {
    var jelly;
    while (jelly = this.doOneMerge()) {
      for (var [x, y] of jelly.cellCoords()) {
        this.cells[y][x] = jelly;
      }
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
          if (jelly.color != other.color)
            continue;
          jelly.merge(other);
          this.jellies = this.jellies.filter((j) => j != other);
          return jelly;
        }
      }
    }
    return null;
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
  constructor(stage, x, y, color, fixed) {
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

    this.dom.addEventListener('contextmenu', (e) => {
      stage.trySlide(this, 1);
    });
    this.dom.addEventListener('click', (e) => {
      stage.trySlide(this, -1);
    });
  }

  cellCoords() {
    return [for (cell of this.cells) [this.x + cell.x, this.y + cell.y]];
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

function resetLevel() {
  var level = +location.hash.slice(1) || 0;
  if (stage && stage.dom)
    stage.dom.textContent = '';
  stage = new Stage(document.getElementById('map'), levels[level]);
  var levelPicker = document.getElementById('level');
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

resetLevel();

document.getElementById('reset').addEventListener('click', resetLevel);

window.addEventListener('hashchange', resetLevel);

var slider = document.getElementById("slider");
var output = document.getElementById("slidervalue");
var grid = document.getElementById("grid");

var grid_vals = new Array(225).fill(0);
var grid_options = ["NaN", "S", "E", "#"]; // the first element does not matter
var len = 3;

var queue = [];
var visited = [];
var path = [];
var nodes_left_in_layer = 1;
var nodes_in_next_layer = 0;

addElement(len);

slider.oninput = function() {
  output.innerHTML = this.value + "x" + this.value;
  len = parseInt(this.value);
  let size = len * 30 + 5 * (len - 1);
  grid.style.width = size.toString() + "px";
  grid.style.height = size.toString() + "px";
  deleteChildren(grid);
  addElement(len);
}

function addElement(num) {
  for (let i=0; i<num**2; i++) {
    const new_item = document.createElement("div");
    new_item.className = "grid-item";
    // 0 is empty, 1 is start, 2 is end, 3 is blocked
    if (grid_vals[i]) {
      new_item.innerHTML = grid_options[grid_vals[i]];
    }
    grid.appendChild(new_item);
  }
}

function deleteChildren(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.getElementById("reset").onclick = function resetList() {
  deleteChildren(grid);
  addElement(len);
}

document.getElementById("randomize").onclick = function randomizeList() {
  const option_probs = [.7, .3];
  for (let i=0; i<len**2; i++) {
    rnd = Math.random();

    if (rnd <= .7) {
      grid_vals[i] = 0;
    } else {
      grid_vals[i] = 3;
    }
  }

  let start = Math.floor(Math.random() * len**2);
  let end = Math.floor(Math.random() * len**2);
  while (end == start) {
    end = Math.floor(Math.random() * len**2);
  }
  grid_vals[start] = 1;
  grid_vals[end] = 2;
  deleteChildren(grid);
  addElement(len);
}

document.getElementById("start").onclick = async function beginBFS() {
  let move_count = 0;
  let reached_end = false;

  start_loc = grid_vals.findIndex((ele) => ele == 1);

  queue.push(start_loc);

  while (queue.length > 0) {
    await sleep(50);
    let current = queue.pop();
    grid.children[current].style.backgroundColor = "yellow";
    find_neighbors(current);
    if (path.length > 1) {
      let last = path[path.length-1];
      while (last != current+1 && last != current-1 && last != current-len && last != current+len) {
        path.pop();
        last = path[path.length-1];
      }
    }
    path.push(current);
    if (grid_vals[current] == 2) {
      reached_end = true;
      break;
    }
  }
  if (reached_end) {
    for (let i=0;i<path.length;i++) {
      await sleep(10);
      grid.children[path[i]].style.backgroundColor = "green";
    }
  } else {
    console.log("no solution");
  }
  queue = [];
  visited = [];
  path = [];
  nodes_left_in_layer = 1;
  nodes_in_next_layer = 0;
}

function find_neighbors(pos) {
  let neighbor_vectors = [-1, 1, len, -len];
  for (let i=0; i<4; i++) {
    next = pos + neighbor_vectors[i];
    if (i < 2 && Math.floor(next/len) != Math.floor(pos/len)) continue;
    if (next < 0) continue;
    if (next >= len**2) continue;

    if (visited.find(ele => ele == next) != undefined) continue;
    if (grid_vals[next] == 3) continue;

    queue.push(next);
    visited.push(next);
  }
}

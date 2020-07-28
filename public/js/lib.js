/* Logic functions */

function loop(start, end, f) {
  for(let i = start; i < end; i++) {
    f(i);
  }
}

// Like loop but in reverse
function rLoop(start, end, f) {
  for(let i = start; i > end; i--) {
    f(i);
  }
}

function fillArray(value, len) {
  let a = [];
  if(typeof value === 'function') {
    loop(0, len, () => a.push(value()));
  } else {
    loop(0, len, () => a.push(value));
  }
  return a;
}

function zeroes(dims) {
  if(dims.length === 1) {
    return fillArray(0, dims[0]);
  } else {
    return fillArray(zeroes.bind(null, dims.slice(1)), dims[0]);
  }
}

/* Mathy functions */

function dot(u, v) {
  return u.reduce((r, x, i) => r + x * v[i], 0);
}

function transpose(a) {
  let b = [];
  loop(0, a[0].length, j => {
    b.push([]);
    loop(0, a.length, i => b[j].push(a[i][j]));
  });
  return b;
}

// mmultiply(vec, matrix) or mmultiply(matrix, matrix)
function mmultiply(v, a) {
  if(v[0] && v[0].length !== undefined) {
    let c = [];
    a = transpose(a);
    // v times a
    v.forEach((row, i) => {
      c.push([]);
      a.forEach((col, j) => c[i].push(dot(row, col)));
    });
    return c;
  } else {
    let w = [];
    for(let u of a) {
      w.push(dot(v, u));
    }
    return w;
  }
}

// Raise a matrix to a positive integer power (n>0)
function mpower(a, n) {
  let p = a;
  loop(1, n, () => p = mmultiply(p, a));
  return p;
}

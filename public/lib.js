/* Logic functions */

function loop(start, end, f) {
  for(let i = start; i < end; i++) {
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
  let w = 0;
  for(let i in u) {
    w += u[i] * v[i];
  }
  return w;
}

// mmultiply(vec, matrix) or mmultiply(matrix, matrix)
function mmultiply(v, a) {
  if(v[0] && v[0].length !== undefined) {
    // TODO
  } else {
    let w = [];
    for(let u of a) {
      w.push(dot(v, u));
    }
    return w;
  }
}

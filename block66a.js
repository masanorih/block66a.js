"use strict";

const BLACK =  1;
const WHITE = -1;

// let data = [];
let backtracks = 0;
let input_grid = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
];
let cells = 6; // マスの数

let conditions = [
    { "n":  5, "points": [ {"y":0, "x":0}, {"y":1, "x":0} ] },
    { "n":  3, "points": [ {"y":0, "x":1}, {"y":1, "x":1} ] },
    { "n":  2, "points": [ {"y":0, "x":4}, {"y":0, "x":5} ] },
    { "n": 25, "points": [ {"y":1, "x":4}, {"y":1, "x":5}, {"y":2, "x":5} ] },
    { "n":  2, "points": [ {"y":2, "x":0}, {"y":2, "x":1} ] },
    { "n": -5, "points": [ {"y":2, "x":2}, {"y":3, "x":2} ] },
    { "n": -2, "points": [ {"y":2, "x":3}, {"y":2, "x":4} ] },
    { "n": 18, "points": [ {"y":3, "x":0}, {"y":3, "x":1} ] },
    { "n": -3, "points": [ {"y":3, "x":3}, {"y":3, "x":4} ] },
    { "n":  9, "points": [ {"y":3, "x":5}, {"y":4, "x":4}, {"y":4, "x":5} ] },
    { "n": -2, "points": [ {"y":4, "x":0}, {"y":5, "x":0} ] },
    { "n": -4, "points": [ {"y":4, "x":1}, {"y":5, "x":1} ] },
    { "n": -2, "points": [ {"y":5, "x":4}, {"y":5, "x":5} ] },
];

let chosen_colors = [
   "#9090f0",
   "#90f0f0",
   "#90f090",
   "#f0f090",
   "#f09090",
   "#9090d0",
   "#90d0d0",
   "#90d090",
   "#d0d090",
   "#d09090",
   "#9090b0",
   "#90b0b0",
   "#90b090",
   "#b0b090",
   "#b09090",
];

let choosing_points = [];
let conditions2 = [];

// html 内の id=xxx を同じ名前の変数で定義する
const board = document.getElementById("board");
const input_number = document.getElementById("input_number");
const backtracks_debug = document.getElementById("backtracks_debug");
const choosing_debug = document.getElementById("choosing_debug");
const condition_debug = document.getElementById("condition_debug");
const condition_desc = document.getElementById("condition_desc");
condition_debug.textContent = json2text(conditions);

// button に event を assign
// html ではなく js でやらないと codesandbox が反応しない
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const clearBtn = document.getElementById("clearBtn");
const appendBtn = document.getElementById("appendBtn");
const debugon = document.getElementById("debugon");
startBtn.onclick = function () {
    start_solver();
};
resetBtn.onclick = function () {
    reset_grid();
};
clearBtn.onclick = function () {
    clear_condition();
};
appendBtn.onclick = function () {
    add_condition();
};
debugon.onchange = function () {
    let checked = this.checked;
    // console.log("checked=%s", checked);
    if (checked === false) {
        const debug_container = document.getElementById("debug_container");
        debug_container.style.display = "none";
    }
    else {
        debug_container.style.display = "block";
    }
}

// 盤面を配置する
for (let i = 0; i < cells; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < cells; j++) {
        const td = document.createElement("td");    // オセロのマス
        // const disk = document.createElement("div"); //　オセロの石
        tr.appendChild(td);
        // td.appendChild(disk);
        td.className = "cell";
        td.onclick = clicked;
    }
    board.appendChild(tr);
    board.classList.add("cell6");
}

function reset_grid() {
    // global で参照する
    for (let line of input_grid) {
        for (let x = 0; x < 6; x++) {
            line[x] = 0;
        }
    }
    for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
            const cell = board.rows[y].cells[x];
            cell.style.backgroundColor = '#d0d0d0';
            cell.innerText = "";
        }
    }
    // show_progress(input_grid);
}

// json を行毎の text に変換する
function json2text(json) {
    let text = "";
    for (let line of json) {
        text += JSON.stringify(line);
        text += "\n";
    }
    return text;
}

// 選択されたセルをリストから削除する
function splice_point_from_choosing(point) {
    let y = point["y"];
    let x = point["x"];
    let i = 0;
    // console.log("splice target cell y=%s, x=%s", y, x);
    for( let p of choosing_points ) {
        let py = p["y"];
        let px = p["x"];
        // console.log("choosing cell y=%s, x=%s", py, px);
        if (y == py && x == px) {
            // console.log("splicing cell y=%s, x=%s", y, x);
            choosing_points.splice(i, 1);
        }
        i++;
    }
    choosing_debug.innerText = json2text(choosing_points);
}
// マスがクリックされた時の処理
function clicked() {
    const y = this.parentNode.rowIndex;
    const x = this.cellIndex;
    console.log("clicked cell y=%s, x=%s", y, x);
    // on/off を toggle する
    if (this.checkedforcondition) {
        let point = {"y": y, "x": x};
        reset_point_of_board(point);
        this.checkedforcondition = false;
        // console.log("checkedforcondition to false");
        splice_point_from_choosing(point);
        return;
    }
    this.checkedforcondition = true;
    let point = {"y": y, "x": x};
    choosing_points.push(point);
    choosing_debug.innerText = json2text(choosing_points);
    let cell = board.rows[y].cells[x];
    cell.style.backgroundColor = 'orange';
}

function reset_point_of_board(point) {
    let y = point["y"];
    let x = point["x"];
    let cell = board.rows[y].cells[x];
    cell.style.backgroundColor = '#d0d0d0';
    cell.checkedforcondition = false;
}

function add_condition() {
    let n = input_number.value;
    if (n != "") {
        for( let point of choosing_points ) {
            reset_point_of_board(point);
        }
        let n = input_number.value;
        let condition = {"n": n, "points": choosing_points};
        add_condition_description(n, choosing_points);
        conditions.push(condition);
        // 入力数字、選択中表示を消す
        input_number.value = "";
        choosing_points = [];
        choosing_debug.innerText = "";
        condition_debug.innerText = json2text(conditions);
        // 条件に入った cell に着色する
        // let i = 0;
        // for (const c of conditions) {
        //     const color = chosen_colors[i];
        //     const points = c["points"];
        //     for (const point of points) {
        //         const y = point["y"];
        //         const x = point["x"];
        //         const cell = board.rows[y].cells[x];
        //         cell.style.borderSpacing = 10;
        //     }
        //     console.log("put color on=%s, color=%s", points, color);
        //     i++;
        // }
    }
}

function add_condition_description(n, choosing_points) {
    let desc = condition_desc.innerText;
    if (n < 0) {
        const p0 = choosing_points[0];
        const p1 = choosing_points[1];
        desc += "{y=" + p0["y"] + ",x=" + p0["x"] + "},"
        desc += "{y=" + p1["y"] + ",x=" + p1["x"] + "},"
        desc += " の差が " + n + " になる\n";
    } else {
        let plen = choosing_points.length;
        if (plen == 2 ) {
            const p0 = choosing_points[0];
            const p1 = choosing_points[1];
            desc += "{y=" + p0["y"] + ",x=" + p0["x"] + "},"
            desc += "{y=" + p1["y"] + ",x=" + p1["x"] + "},"
            desc += " の和差商積が " + n + " になる\n"
        } else {
            for( let point of choosing_points ) {
                const y = point["y"]
                const x = point["x"]
                desc += "{y=" + y + ",x=" + x + "},"
            }
            desc += "の商積が " + n + " になる\n"
        }
    }
    // desc += "\n";
    condition_desc.innerText = desc;
}

function clear_condition() {
    conditions = [];
    condition_debug.innerText = "";
    condition_desc.innerText = "";
    for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
            const cell = board.rows[y].cells[x];
            cell.style.backgroundColor = '#d0d0d0';
        }
    }
}

function start_solver() {
    // console.log("startBtn clicked");
    backtracks = 0;
    // grid を 0, 0 から走査開始する
    startBtn.value = "計算中";
    startBtn.disabled = true;
    setTimeout( () => {
        solve_block66a(input_grid, 0, 0);
        fill_result(input_grid);
        // console.log("sloved.");
    }, 100 );
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function fill_result (grid) {
    for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
            const cell = board.rows[y].cells[x];
            const value = grid[y][x];
            cell.innerText = value;
            await sleep(10);
        }
    }
    let i = 0;
    for (const c of conditions) {
        const color = chosen_colors[i];
        const points = c["points"];
        for (const point of points) {
            const y = point["y"];
            const x = point["x"];
            const cell = board.rows[y].cells[x];
            cell.style.backgroundColor = color;
        }
        // console.log("put color on=%s, color=%s", points, color);
        i++;
    }
    // ボタンを復活
    startBtn.disabled = false;
    startBtn.value = "計算を開始";
}

// https://qiita.com/kerupani129/items/3d26fef39e0e44101aad
const repaint = async () => {
    for (let i = 0; i < 2; i++) {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
};

function show_updated_cell(grid, y, x, value) {
    setTimeout( async () => {
        let cell = board.rows[y].cells[x];
        // let saved_mode = board.style.display;
        cell.innerText = value;
        // await repaint();
        // board.style.display = saved_mode;
    }, 2000);
}

function show_progress(grid) {
    let y = 0;
    for (let line of grid) {
        let x = 0;
        for (let v of line) {
            if (v === 0) {
                v = "";
            }
            board.rows[y].cells[x].innerText = v;
            // let cell = board.rows[y].cells[x];
            // cell.innerText = v;
            x++;
        }
        y++;
    }
    backtracks_debug.innerText = backtracks;
    // print_grid(grid);
}

function print_grid(grid) {
    let text = "";
    for (let line of grid) {
        for (let v of line) {
            text += v + ", ";
        }
        text += "\n";
    }
    console.log(text);
}

function solve_block66a(grid) {
    // show_progress(grid);

    let[y, x] = find_next_cell(grid);
    // console.log("found cell y=", y, " x=", x);
    // 終了判定
    if (y == -1 || x == -1) {
        return true;
    }

    // loop for 1..6
    for (let value = 1; value < 7; value++) {
        let result = is_valid(grid, y, x, value);
        // console.log("is_valid result=%s value=%s", result, value);
        if (result) {
            grid[y][x] = value;
            // show_updated_cell(grid, y, x, value);
            if (solve_block66a(grid)) {
                return true;
            }
            backtracks++;
            if (backtracks > 10000000) {
                alert("10000000 backtracks. give up!");
                return true;
            }
            grid[y][x] = 0;
        }
    }
}

function find_next_cell(grid) {
    for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
            // console.log("find_next_cell y=%s, x=%s", y, x);
            if (grid[y][x] == 0) {
                // console.log("find_next_cell found 0");
                return[y, x];
            }
        }
    }
    return[-1, -1];
}

function is_valid(grid, y, x, value) {
    // grid[y].forEach(v => {})
    // 行に value と同じ数字がないことを確認
    for (let v of grid[y]) {
        // console.log("is_valid v=", v, " value=", value)
        if (v === value) {
            return false;
        }
    }
    // console.log("is_valid y is okay.")
    // 列に value と同じ数字がないことを確認
    for (let line of grid) {
        let v = line[x];
        if (v === value) {
            return false;
        }
    }
    // console.log("is_valid x is okay.")
    for (let c of conditions ) {
        let ok = valid_condition(grid, c);
        if (ok === false) {
            return false;
        }
    }
    // console.log("is_valid conditions are okay.")
    // all ok.
    return true;
}

function valid_condition(grid, c) {
    let n = c["n"];
    let points = c["points"];
    let plen = points.length;
    if (plen == 2) {
        let a = get_value_of_point(grid, points[0]);
        let b = get_value_of_point(grid, points[1]);
        return blocks2(n, a, b);
    }
    else {
        let values = [];
        for (let p of points) {
            let v = get_value_of_point(grid, p);
            values.push(v);
        }
        return blocks4(n, values);
    }
}

function get_value_of_point(grid, point) {
    let y = point["y"];
    let x = point["x"];
    return(grid[y][x]);
}

function blocks2(n, a, b) {
    // 値 0 は未処理なので true を返す
    if (a == 0) {
        return true;
    }
    if (b == 0) {
        return true;
    }
    // n が負の数の時は差のみ
    if (n < 0) {
        // 差
        if (n == a - b) {
            return true;
        }
        if (n == b - a) {
            return true;
        }
        return false;
    }
    // 和
    if (n == a + b) {
        return true;
    }
    // 差
    if (n == a - b) {
        return true;
    }
    if (n == b - a) {
        return true;
    }
    // 商
    if (n == a / b) {
        return true;
    }
    if (n == b / a) {
        return true;
    }
    // 積
    if (n == a * b) {
        return true;
    }
    // いづれも該当しないなら false
    return false;
}

function blocks4(n, values) {
    let sums = 0;  // 和
    let multi = 1; // 積
    for (let v of values) {
        if (v == 0) {
            return true;
        }
        sums = sums + v;
        multi = multi * v;
    }
    if (n == sums) {
        return true;
    }
    if (n == multi) {
        return true;
    }
    // いづれも該当しないなら False
    return false;
}

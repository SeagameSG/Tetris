// 21130317_LamTrachDong_0868409021_DH21DTB_T2T123
const canvas = document.getElementById('game-screen')
const context = canvas.getContext('2d')
context.scale(40, 40);

//Khối được điều khiển bằng 1 đại diện là player
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0
}

const colors = [null, 'purple', 'yellow', 'orange', 'blue', 'turquoise', 'green', 'red']

const arena = createMatrix(12, 20);

let lastPiece = null;

//Tạo khối ngẫu nhiên, không có 2 cái giống nhau liên tiếp
function randomPiece() {
    const pieces = 'TIOLJSZ';
    let piece;
    do {
        piece = pieces[pieces.length * Math.random() | 0];
    } while (piece === lastPiece);
    lastPiece = piece;
    return createPiece(piece);
}

// Tạo các khối
function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ]
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2]
        ]
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ]
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ]
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ]
    } else if (type === 'S') {
        return [
            [0, 0, 0],
            [0, 6, 6],
            [6, 6, 0]
        ]
    } else if (type === 'Z') {
        return [
            [0, 0, 0],
            [7, 7, 0],
            [0, 7, 7]
        ]
    }
}

// Đặt lại vị trí điều khiển của người chơi lên khối đầu màn hình
function playerReset() {
    player.matrix = randomPiece(); // Nhận khối mới 
   
    player.pos.y = 0; // Đặt vị trí y điều khiển của người chơi lên đầu màn hình
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0) //Đặt lại ở giữa

    // Game over, Khối vừa sinh ra đã va chạm
    if (collide(arena, player)) {
        stopGame();
    }
}

// Kiểm tra va chạm giữa các khối và giới hạn khung game
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Tạo khung game
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

//Vẽ game board
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);

}

// Vẽ các khối với vị trí và màu
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
};


// Xóa hàng khi đầy, cập nhật điểm, cập nhật tốc độ rơi
function clearRow() {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y > 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;
        rowCount++;
        player.score += rowCount * 20;
        if (dropInterval > 300 && currentLevel != 4) {
            dropInterval -= 30 + (player.score * 0.05);
            if (dropInterval < 300) {
                dropInterval = 300;
            }
        }
        if(currentLevel == 4){
        delaylv4 = true;
        dropInterval += 30;
        if (dropInterval > 500) {
            dropInterval = 500;
        }
        }
    }
    
}

// Hiển thị điểm
function updateScore() {
    document.getElementById('score').innerText = `Score: ${player.score}`;
}


// Khóa khối, xong gọi reset.
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        })
    });
    playerReset();
    clearRow();
    updateScore();
}

//Xử lý theo thời gian
//Rơi khối
//Đồng hồ
let dropCounter = 0;
let dropInterval = 900;

let lastTime = 0; // Lưu thời điểm gọi update()
let gameTime = 0;
let lastUpdateTime = 0; // Lưu thời điểm cập nhật cuối cùng cho đồng hồ
let delaylv4 = false;
let delaylv5 = 0;

function update(time = 0) {
    //Dừng game
    if (!gameRunning) return;

    const deltaTime = time - lastTime;
    lastTime = time;

    // Đồng hồ đếm giây, dùng để gọi các sự kiện cho các level
    if (gameRunning) {
        if (time - lastUpdateTime > 1000) {
            gameTime++;
            document.getElementById('timer').innerText = `Timer: ${gameTime}`;
            document.getElementById('timer').style.backgroundColor = '#0e2ddf';
            lastUpdateTime = time;
            if(currentLevel == 3){
                if(gameTime % 5 == 0 ){
                    takeSelectPiece();
                }
            }
            if(currentLevel == 4){
                if(dropInterval > 300){
                    dropInterval -= 1;
                }
                if (gameTime % 5 == 0){
                    if (delaylv4) {
                        delaylv4 = false;
                    } else if (!delaylv4) {
                        setPiecetoArena();
                    }   
                }
            }
            if (currentLevel == 5) {
                if(gameTime - delaylv5 == 4){
                    playerSuperDrop();
                    document.getElementById('timer').style.backgroundColor = '#eb0029';
                }
            }
            if (islevel6) {
                if (gameTime % 10 == 0){
                    randomThing();
                }
            }
        }
        
    }

    //Rơi khối
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            player.pos.y = 0;
        }
        dropCounter = 0;
    }

    draw();
    //Loop
    requestAnimationFrame(update);
}

//Quyết định đảo ngược
let reverseControls = false;
//Điều khiển
//Trái phải
function playerMove(direction) {
    if (reverseControls) {
        direction = -direction;
    }
    player.pos.x += direction;
    if (collide(arena, player)) {
        player.pos.x -= direction;
    }
}

//Thực hiện xoay khối và kiểm soát logic va chạm khi xoay
//Nếu có va chạm, hình sẽ được dịch chuyển sang trái hoặc phải để tránh va chạm.
function playerRotate(direction) {
    if (reverseControls) {
        direction = -direction;
    }
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, direction);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -direction);
            player.pos.x = pos;
            return;
        }
    }
}

//Xoay ma trận nhận vào
function rotate(matrix, direction) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                    matrix[y][x],
                    matrix[x][y]
                ];
        }
    }
    if (direction > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

//Thả nhanh
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
    }
    dropCounter = 0;
}

//Sự kiện bàn phím
document.addEventListener('keydown', (event) => {
    console.log(event.keyCode);
    // Left arrow
    if (event.keyCode === 37) {
        playerMove(-1);
    }
    //Right arrow
    if (event.keyCode === 39) {
        playerMove(1);
    }
    //Down arrow
    if (event.keyCode === 40) {
        if(currentLevel != 5) playerDrop();
        //Tránh việc đang nhấn giữ nút xuống, delay chức năng 1 giây khi chuyển level.
        if (islevel6) {
            if (currentLevel == 5){
               if(gameTime % 10 ==0 ){
                return;
               } else{
                playerSuperDrop();
               } 
            }   
        } else {
            if(currentLevel == 5) playerSuperDrop();
        }
    }
    //Q
    if (event.keyCode === 81) {
        playerRotate(-1);
    }
    //W
    if (event.keyCode === 87) {
        playerRotate(1);
    }
    //S
    if (event.keyCode === 83) {
        startGame();
        document.getElementById('gameOver').style.display = 'none';
        document.getElementById('startButton').innerText = "Restart";
    }
});

let currentLevel = 1;
let islevel6 = false;
let selectPiece = [];
//Xử lý level
function updateGameLevel(level) {
    document.getElementById('level-indicator').innerText = level;
    if (level != 6) {
        islevel6 = false;
    }
    if (level == 2){
        currentLevel = level;
        reverseControls = true;
        document.getElementById('levelDetail').innerHTML = "Đi ngược: <br> Đảo ngược các phím di chuyển và xoay trái <-> phải.";
    } else if (level == 3) {
        currentLevel = level;
        selectPiece = [randomPiece(), randomPiece()];
        document.getElementById('levelDetail').innerHTML = "Phép từ hư không: <br> Mỗi 5 giây khối của bạn sẽ bị đổi ngẫu nhiên <br> Nhìn đồng hồ để canh giờ nhé.";
    } else if (level == 4){
        currentLevel = level;
        dropInterval = 350;
        delaylv4 = false;
        document.getElementById('levelDetail').innerHTML = "Tàn phá, xây dựng: <br> Bắt đầu game với tốc độ siêu nhanh. <br> Mỗi 5 giây sẽ sinh ra 1 số ô ngẫu nhiên trong 7 hàng dưới cùng. <br> Mỗi khi xóa được ít nhất 1 hàng sẽ delay chúng lại 1 lần. <br> Và sẽ làm chậm lại tốc độ rơi.";
    } else if (level == 5) {
        currentLevel = level;
        delaylv5 = 0;
        document.getElementById('levelDetail').innerHTML = "Tốc thả tức thời: <br> Thả nhanh sẽ được thay thế bằng thả ngay lập tức. <br> Nếu trong 4 giây mà không thả khối xuống, <br> sẽ tự thả xuống ngay lập tức. <br> Không có ghost đâu nên hãy tự canh nhé.";
    } else if (level == 6){
        currentLevel = 1;
        islevel6 = true;
        document.getElementById('levelDetail').innerHTML = "Điều bất ngờ: <br> Mỗi 10 giây sẽ ngẫu nhiên 1 hiệu ứng của 5 level trước đó <br> Hoặc là không có gì nếu vào số 1 <br> Đừng hỏi tôi, không biết đâu !!";
    }
    else {
        currentLevel = 1;
        document.getElementById('levelDetail').innerHTML = 'Di chuyển: Mũi tên trái phải <br> Thả nhanh: Mũi tên xuống <br> Xoay: Q và W <br> Start,Reset: S';
    }
    
    
}

//Thực hiện đổi hiệu ứng của các lv trước cho level 6
function randomThing(){
    currentLevel = getRandomInteger(1,5);
    reverseControls = false;
    if (currentLevel == 1) {
        document.getElementById('levelDetail').innerHTML = 'Di chuyển: Mũi tên trái phải <br> Thả nhanh: Mũi tên xuống <br> Xoay: Q và W <br> Start,Reset: S';
    } else if (currentLevel == 2){
        reverseControls = true;
        document.getElementById('levelDetail').innerHTML = "Đi ngược: <br> Đảo ngược các phím di chuyển và xoay trái <-> phải.";
    } else if (currentLevel == 3) {
        selectPiece = [randomPiece(), randomPiece()];
        document.getElementById('levelDetail').innerHTML = "Phép từ hư không: <br> Mỗi 5 giây khối của bạn sẽ bị đổi ngẫu nhiên <br> Nhìn đồng hồ để canh giờ nhé.";
    } else if (currentLevel == 4){
        delaylv4 = false;
        document.getElementById('levelDetail').innerHTML = "Tàn phá, xây dựng: <br> Mỗi 5 giây sẽ sinh ra 1 số ô ngẫu nhiên trong 7 hàng dưới cùng. <br> Mỗi khi xóa được ít nhất 1 hàng sẽ delay chúng lại 1 lần. <br> Và sẽ làm chậm lại tốc độ rơi.";
    } else if (currentLevel == 5) {
        delaylv5 = gameTime;
        document.getElementById('levelDetail').innerHTML = "Tốc thả tức thời: <br> Thả nhanh sẽ được thay thế bằng thả ngay lập tức. <br> Nếu trong 4 giây mà không thả khối xuống, <br> sẽ tự thả xuống ngay lập tức. <br> Không có ghost đâu nên hãy tự canh nhé.";
    }
}

//Lấy ra khối trong mảng selectpiece để đổi cho player, kiểm soát logic va chạm khi đổi khối
function takeSelectPiece() {
    player.matrix = selectPiece.shift();
    selectPiece.push(randomPiece());
    document.getElementById('timer').style.backgroundColor = '#eb0029';
    const pos = player.pos.x;
    let offset = 1;
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            player.pos.x = pos;
            return;
        }
    }
    
}

//Thả ngay lập tức khối xuống dưới cùng khi được gọi
function playerSuperDrop() {
    while (!collide(arena,player)){
        player.pos.y++;
        if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        break;
        }
    }
    dropCounter = 0;
    delaylv5 = gameTime;
}

//Ngẫu nhiên số nhưng có giới hạn khoảng
function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Đặt các mảnh ngẫu nhiên cho level 5
function setPiecetoArena(){
    randomPiece().forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[arena.length - getRandomInteger(1,7)][getRandomInteger(0,11)] = value;
            }
        })
    });
    document.getElementById('timer').style.backgroundColor = '#eb0029';
    clearRow();
}

let gameRunning = false;
//Xử lý Nút bắt đầu và bắt đầu lại
document.getElementById('startButton').addEventListener('click', function () {
    if (gameRunning) {
        resetGame();
    } else {
        startGame();
        document.getElementById('gameOver').style.display = 'none';
        this.innerText = "Restart";
    }
});

//Reset game
function resetGame() {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
    dropInterval = 700;
    playerReset();
    if (islevel6) {
        updateGameLevel(6);
    } else {
        updateGameLevel(currentLevel);
    }
    gameTime = 0;
    document.getElementById('timer').innerText = "Timer: 0";
}

//Gọi khởi tạo game
function startGame() {
    gameRunning = true;
    lastUpdateTime = 0;
    resetGame();
    update();
}

//Dừng game
function stopGame() {
    gameRunning = false;
    document.getElementById('startButton').innerText = "Play";
    document.getElementById('gameOver').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    //Nhận level
    var links = document.querySelectorAll('.dropdown-content a');
    links.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var level = this.getAttribute('data-level');
            reverseControls = false;
            updateGameLevel(level);
            stopGame();
        });
    });

    //Ẩn hiện Popup
    var popup = document.getElementById('aboutPopup');
    var btn = document.querySelector('.aboutbtn');
    var span = document.getElementsByClassName('close')[0];


    btn.onclick = function () {
        popup.style.display = 'block';
    }
    span.onclick = function () {
        popup.style.display = 'none';
    }
    window.onclick = function (event) {
        if (event.target == popup) {
            popup.style.display = 'none';
        }
    }
});

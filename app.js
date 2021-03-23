/*game*/
let Tetris = {

    width : 15,
    height : 30,
    next_width : 5,
    next_height : 5,
    block_size : 10,
    piece_type : [
        [
            [{x:0,y:0} , {x:0,y:1} , {x:1,y:0} , {x:1,y:1}]     // O
        ],
        [
            [{x:0,y:0} , {x:0,y:1} , {x:0,y:2} , {x:0,y:3}],
            [{x:0,y:1} , {x:1,y:1} , {x:2,y:1} , {x:3,y:1}]     // I

        ],
        [
            [{x:0,y:1} , {x:0,y:2} , {x:1,y:0} , {x:1,y:1}],    // Z
            [{x:0,y:1} , {x:1,y:1} , {x:1,y:2} , {x:2,y:2}]
        ],
        [
            [{x:0,y:0} , {x:0,y:1} , {x:0,y:2} , {x:1,y:2}],    // L
            [{x:0,y:1} , {x:0,y:2} , {x:1,y:1} , {x:2,y:1}],
            [{x:0,y:0} , {x:1,y:0} , {x:1,y:1} , {x:1,y:2}],
            [{x:0,y:1} , {x:1,y:1} , {x:2,y:0} , {x:2,y:1}]
        ],
        [
            [{x:1,y:0} , {x:0,y:1} , {x:1,y:1} , {x:2,y:1}],    // T
            [{x:0,y:0} , {x:0,y:1} , {x:1,y:1} , {x:0,y:2}],
            [{x:0,y:0} , {x:1,y:0} , {x:2,y:0} , {x:1,y:1}],
            [{x:1,y:0} , {x:0,y:1} , {x:1,y:1} , {x:1,y:2}]
        ]
    ],
    next_piece : [
        [{x:15,y:15} , {x:25,y:15} , {x:15,y:25} , {x:25,y:25}],    // O
        [{x:20,y:5 } , {x:20,y:15} , {x:20,y:25} , {x:20,y:35}],    // I
        [{x:25,y:10} , {x:15,y:20} , {x:25,y:20} , {x:15,y:30}],    // Z
        [{x:15,y:10} , {x:15,y:20} , {x:15,y:30} , {x:25,y:30}],    // L
        [{x:20,y:15} , {x:10,y:25} , {x:20,y:25} , {x:30,y:25}]     // T
    ],
    lock : false,
    stop : false,
    piece_color : ['#ADFF2F' , '#FF1493' , '#00BFFF' , '#FF8C00' , '#DA70D6'],
    Tetris_piece : null,
    Tetris_currnet_canvas : null,
    Tetris_next_canvas : null,
    Tetris_currnet_size : null,
    Tetris_next_size : null,
    ready_sw : false,
    level_time : 800,
    level_cnt : 5,
    key_code     : {
        UP : 38 , DOWN : 40 , LEFT : 37 , RIGTH : 39 , BACKSPACE : 8 ,
        ESC : 27 , ENTER : 13 , DELETE : 46 , TAB : 9 , DOUBLE : 50 ,
        SINGULE : 55 , SPACE : 32
    },
    defineClass : function(constructor,methos,statics){
        if(methos) this.extend(constructor.prototype,methos);
        if(statics) this.extend(constructor,statics);
        return constructor;
    },
    extend : function(o,p){
        for(prop in p) {
            o[prop] = p[prop];
        }
        return o;
    },
    log : function(msg){
        if(!msg) return;
        if (window.console && window.console.log) {
            window.console.log(msg);
        }
    }
}

/*  Tetris Piece Class*/
Tetris.Piece = Tetris.defineClass(
    function(type,color,n){
        this.type = type;
        this.color = color;
        this.no = n;
        this.next = Tetris.next_piece[this.no];
        this.index = 0;
        this.position = {x:0 , y:0};

    },
    {
        set_position : function(x,y){
            this.position.x = x;
            this.position.y = y;
            if(this.end_down()) Tetris.Control.game_over = true;
        },
        check_down : function(){
            if(this.end_down()) return true;
            this.position.y++;
            return false;
        },
        end_down : function(){
            let pos = this.get_position() , i;
            let check = false;
            for(i=0;i<pos.length;i++){
                if(pos[i].y+1 >= Tetris.height) return true;
                if(Tetris.Tetris_piece[pos[i].y+1][pos[i].x] !== -1) return true;
            }
            return false;
        },
        set_piece : function(){
            let pos = this.get_position();
            let no = this.no;
            pos.forEach(function(e,i,a){
                Tetris.Tetris_piece[e.y][e.x] = no;
            });
        },
        down_piece : function(){
            let i;
            for(i=0;i<3;i++){
                if(this.check_down()){
                    return true;
                }
            }
            return false;
        },
        current_draw : function(){
            let pos = this.get_position();
            let color = this.color;
            pos.forEach(
                function(e,i,a){
                    Tetris.Control.current_draw(e.x,e.y,color);
                }
            );
        },
        next_draw : function(){
            let color = this.color;
            this.next.forEach(
                function(e,i,a){
                    Tetris.Control.next_draw(e.x,e.y,color);
                }
            );
        },
        get_position : function(){
            let pos = [] ;
            let position = this.position
            this.type[this.index].forEach(
                function(e,i,a){
                    pos.push({x:e.x+position.x , y:e.y+position.y});
                }
            );
            return pos;
        },
        get_size : function(){
            let size = this.get_rect();
            return {width:size.rigth.x+1,height:size.bottom.y+1};
        },
        get_rect : function(){
            let left = {x:0,y:0} , rigth = {x:0,y:0} , top = {x:0,y:0} , bottom = {x:0,y:0} ;
            this.type[this.index].forEach(
                function(e,i,a){
                    if(e.x < left.x) Tetris.extend(left,e);
                    if(e.x > rigth.x) Tetris.extend(rigth,e);
                    if(e.y > bottom.y) Tetris.extend(bottom,e);
                }
            );
            return {left:left , rigth:rigth , top:top , bottom:bottom};
        },
        left : function(){
            let pos = this.get_position() , i;
            for(i=0;i<pos.length;i++){
                if(pos[i].x - 1 < 0){
                    return false;
                }
                if(Tetris.Tetris_piece[pos[i].y][pos[i].x - 1] !== -1){
                    return false;
                }
            }
            this.position.x--;
            return true;
        },
        rigth : function(){
            let pos = this.get_position() , i;
            for(i=0;i<pos.length;i++){
                if(pos[i].x + 2 > Tetris.width){
                    return false;
                }
                if(Tetris.Tetris_piece[pos[i].y][pos[i].x + 1] !== -1){
                    return false;
                }
            }
            this.position.x++;
            return true;
        },
        rotation : function(){
            let save_index = this.index , i , check_out = false;
            this.index = (this.index + 1) % this.type.length;
            let pos = this.get_position();
            for(let i = 0;i < pos.length;i++){
                if(pos[i].x < 0){
                    check_out = true;
                    break;
                }
                if(Tetris.Tetris_piece[pos[i].y][pos[i].x] !== -1){
                    check_out = true;
                    break;
                }
                if(pos[i].x + 1 > Tetris.width){
                    check_out = true;
                    break;
                }
                if(Tetris.Tetris_piece[pos[i].y][pos[i].x] !== -1){
                    check_out = true;
                    break;
                }
                if(pos[i].y >= Tetris.height){
                    check_out = true;
                    break;
                }
                if(Tetris.Tetris_piece[pos[i].y][pos[i].x] !== -1){
                    check_out = true;
                    break;
                }
            }
            if(check_out){
                this.index = save_index;
                return false;
            }
            return true;
        }
    }
);

/*  Tetris Control*/

Tetris.Control = {
    setup : function(){
        let tetris = Tetris;
        Tetris.Timer.setup();
        Tetris.KeyBoard.setup();
        Tetris.Tetris_currnet_canvas = $('#Main-scrren')[0].getContext("2d");
        Tetris.Tetris_next_canvas = $('#Sub-scrren')[0].getContext("2d");
        Tetris.Tetris_currnet_size = get_size('Main-scrren');
        Tetris.Tetris_next_size = get_size('Sub-scrren');
        Tetris.KeyBoard.add({object:this , id:'DOWN' , post:this.keydown.bind(this)});
        Tetris.KeyBoard.add({object:this , id:'RIGTH' , post:this.keyrigth.bind(this)});
        Tetris.KeyBoard.add({object:this , id:'LEFT' , post:this.keyleft.bind(this)});
        Tetris.KeyBoard.add({object:this , id:'SPACE' , post:this.keyspace.bind(this)});
        Tetris.KeyBoard.add({object:this , id:'UP' , post:this.keyspace.bind(this)});
        this.lock = true;
        function get_size(p){
            let w = $('#'+p)[0].width;
            let h = $('#'+p)[0].height;
            return {w:w , h:h}
        }
    },
    game_start : function(){
        this.init_screen();
        this.screen_clear();
        this.lock = false;
        this.game_over = false;
        this.now_time = new Date().getTime();
        Tetris.Timer.remove(this);
        Tetris.Timer.add({object:this , post:this.onLoop.bind(this)});
        Tetris.Score.setup();
        this.level_time = Tetris.level_time;
        this.level_cnt = Tetris.level_cnt;
        let current = this.random() , next = this.random();
        this.current_piece = new Tetris.Piece(Tetris.piece_type[current],Tetris.piece_color[current],current);
        this.next_piece = new Tetris.Piece(Tetris.piece_type[next],Tetris.piece_color[next],next);
        let y = 0;
        let x = Math.floor(Tetris.width/2 - this.current_piece.get_size().width/2);
        this.current_piece.set_position(x,y);
        this.onLoop();
    },
    init_screen : function(){
       let i, j;
        Tetris.Tetris_piece = [];
        for( i = 0; i <Tetris.height;i++){
            Tetris.Tetris_piece[i] = [];
            for(j = 0;j < Tetris.width;j++){
                Tetris.Tetris_piece[i][j] = -1;
            }
        }
    },
    screen_clear : function(){
        Tetris.Tetris_currnet_canvas.clearRect(0,0,Tetris.Tetris_currnet_size.w,Tetris.Tetris_currnet_size.h);
        Tetris.Tetris_next_canvas.clearRect(0,0,Tetris.Tetris_next_size.w,Tetris.Tetris_next_size.h);
    },
    onLoop : function(){
        let now = new Date().getTime();
        if(now - this.now_time < this.level_time) return;
        this.now_time = now;
        this.draw();
        if(this.lock) return;
        if(this.current_piece.check_down()) this.set_next();
        this.line_check();
    },
    keydown : function(){
        if(this.lock) return;
        this.down_key();
    },
    keyrigth : function(){
        if(this.lock) return;
        if(this.current_piece.rigth()) this.draw();
    },
    keyleft : function(){
        if(this.lock) return;
        if(this.current_piece.left()) this.draw();
    },
    keyspace : function(){
        if(this.lock) return;
        if(this.current_piece.rotation()) this.draw();
    },
    down_key : function(){
        this.down_sw = true;
        this.lock = true;
        let timer_id = {};
       let key_down = {object:timer_id , post:function(){
                if(this.current_piece.down_piece()){
                    this.draw();
                    this.lock = false;
                    Tetris.Timer.remove(timer_id);
                    return;
                }
                this.draw();
            }.bind(this)}
        Tetris.Timer.add(key_down);
    },
    set_next : function(){
        this.current_piece.set_piece();
       let next = this.random();
        this.current_piece = this.next_piece;
        this.next_piece = new Tetris.Piece(Tetris.piece_type[next],Tetris.piece_color[next],next);
        let y = 0;
        let x = Math.floor(Tetris.width/2 - this.next_piece.get_size().width/2);
        this.current_piece.set_position(x,y);
        this.draw();
        if(this.game_over) this.gameOver();
    },
    line_check : function(){
        let i;
        for(i=Tetris.height-1;i>0;i--){
            if(this.check_block(i)){
                this.line_light(i,function(){
                    Tetris.Score.add();
                    this.timer_down();
                    this.line_clear(i);
                    this.draw();
                    this.block_down(i);
                }.bind(this));
                return;
            }
        }
    },
    timer_down : function(){
        if(this.level_cnt - 1 < 0){
            this.level_cnt = Tetris.level_cnt;
            if(this.level_time - 100 > 100){
                this.level_time -= 200;
            }
        }else this.level_cnt--;
    },
    line_light : function(i,p){
        let line = i , post = p;
        let timer_id = {};
        let index = 0;
        this.lock = true;
       let ligth_timer = {object:timer_id , post:function(){
                if(index + 1 === Tetris.width){
                    Tetris.Timer.remove(timer_id);
                    this.lock = false;
                    post();
                    return;
                }
                Tetris.Tetris_piece[line][index++] = -1;
                this.draw();
            }.bind(this)};
        Tetris.Timer.add(ligth_timer);
    },
    line_clear : function(line){
        let i;
        for(i = 0;i < Tetris.width;i++){
            Tetris.Tetris_piece[line][i] = -1;
        }
    },
    block_down : function(n){
        let line = n , timer , i , end_block = false;
        let timer_id = {};
        let now_time = new Date().getTime();
        let block_down = {object:timer_id , post:function(){
               let now = new Date().getTime();
                if(now - now_time < 30) return;
                now_time = now;
                let down_line = line - 1;
                if(this.check_off_block(down_line)) end_block = true;
                for(i=0;i<Tetris.width;i++){
                    Tetris.Tetris_piece[line][i] = Tetris.Tetris_piece[down_line][i];
                }
                this.line_clear(down_line);
                if(end_block){
                    Tetris.Timer.remove(timer_id);
                    this.lock = false;
                    this.line_check();
                    return;
                }
                line--;
                this.draw();
            }.bind(this)};
        Tetris.Timer.add(block_down);
        this.lock = true;
    },
    check_block : function(line){
        let i;
        for(i = 0;i < Tetris.width;i++){
            if(Tetris.Tetris_piece[line][i] === -1) return false;
        }
        return true;
    },
    check_off_block : function(line){
        let i;
        for(i=0;i<Tetris.width;i++){
            if(Tetris.Tetris_piece[line][i] !== -1) return false;
        }
        return true;
    },
    gameOver : function(){
        this.lock = true;
        $('#Game_over').fadeIn('slow');
        $('#play').fadeIn('slow');

    },
    random : function(){
        let no = Math.floor(Math.random()*10);
        return no % Tetris.piece_type.length;
    },
    draw : function(){
        this.screen_clear();
        this.current_piece.current_draw();
        this.next_piece.next_draw();
        let y , x ;
        for(y=0;y<Tetris.height;y++){
            for(x = 0;x < Tetris.width;x++){
                let index = Tetris.Tetris_piece[y][x];
                if(index !== -1){
                    let color = Tetris.piece_color[index];
                    this.current_draw(x,y,color);
                }
            }
        }
    },
    current_draw : function(x,y,c){
        let current_x = x * Tetris.block_size;
        let current_y = y * Tetris.block_size;
        Tetris.Tetris_currnet_canvas.fillStyle = c;
        Tetris.Tetris_currnet_canvas.fillRect(current_x,current_y,Tetris.block_size,Tetris.block_size);
    },
    next_draw : function(x,y,c){
        Tetris.Tetris_next_canvas.fillStyle = c;
        Tetris.Tetris_next_canvas.fillRect(x,y,Tetris.block_size,Tetris.block_size);
    }
};

/*  KeyBoard Task*/

Tetris.KeyBoard = {
    setup : function(){
        window.focus();
        this.qt = [];
        this.down_sw = false;
        $(document).bind("keydown", this.keydown.bind(this));
        $(document).bind("keyup",function(){window.focus(); this.down_sw = false;}.bind(this));
    },
    add : function(p){
        let evet = Tetris.extend({object:null , id:null , post:null},p || {});
        this.qt.push(evet);
    },
    remove : function(p){
        for(let i = 0;i < this.qt.length;i++){
            if(this.qt[i].object === p){
                this.qt.splice(i,1);
                break;
            }
        }
    },
    keydown : function(e){
        if(this.down_sw) return;
        window.focus();
        switch (e.keyCode) {
            case Tetris.key_code.UP: this.post('UP'); return false;
            case Tetris.key_code.DOWN: this.post('DOWN'); return false;
            case Tetris.key_code.RIGTH: this.post('RIGTH'); return false;
            case Tetris.key_code.LEFT: this.post('LEFT'); return false;
            case Tetris.key_code.SPACE: this.post('UP'); return false;
        }
    },
    post : function(i){
        let id = i;
        this.qt.forEach(function(e,i,a){if(e.id === id) e.post();});
    }
};

/*Timer Task*/
Tetris.Timer = {
    setup : function(){
        this.qt = [];
        this.timer = setInterval(this.onLoop.bind(this),33);
    },
    add : function(p){
        evet = Tetris.extend({object:null , post:null},p || {});
        this.qt.push(evet);
    },
    remove : function(p){
        for(let i = 0;i < this.qt.length;i++){
            if(this.qt[i].object === p){
                this.qt.splice(i,1);
                break;
            }
        }
    },
    onLoop : function(){
        this.qt.forEach(function(e,i,a){e.post();});
    }
};

/* Score Task*/

Tetris.Score = {
    setup : function(){
        this.qt = [];
        this.score = 0;
        this.current_dom = $('<p>').text('00000').css({
            position: 'absolute',
            top: '-30px',
            width: '60px',
            height: '20px',
            paddingLeft: '10px',
            backgroundColor : 'white'
        }).appendTo('#Score');
        this.lock = false;
    },
    add : function(){
        this.score += 10;
        let data = '00000'+String(this.score);
        let pos = data.length - 5;
        data = data.substring(pos);
       let dom = $('<p>').text(data).css({
            position: 'absolute',
            top: '-15px',
            width: '60px',
            height: '20px',
            paddingLeft: '10px',
            backgroundColor : 'white'
        });
        this.qt.push(dom);
        this.score_up();
    },
    score_up : function(){
        if(this.qt.length !== 0 && !this.lock){
            this.lock = true;
            let dom = this.qt.shift();
            $(dom).appendTo('#Score');
            $(dom).animate(
                { top : -30 },
                {
                    duration: 1000,
                    complete: function(){
                        this.lock = false;
                        $(this.current_dom).remove();
                        this.current_dom = dom;
                        if(this.qt.length !== 0) this.score_up();
                    }.bind(this)
                }
            );
        }
    }
}

/* Game Over*/

Tetris.GameOvaer = function(){
    let Context = $('#Game_over')[0].getContext("2d");
    $('#Game_over').hide();
    Context.font = 'normal bold 23px fantasy';
    Context.fillStyle = 'red';
    Context.textBaseline = 'top';
    Context.shadowColor = "#A0A0A0";
    Context.shadowOffsetX = 5;
    Context.shadowOffsetY = 5;
    Context.shadowBlur = 5;
    Context.fillText( 'Game Over', 0, 0);
}

/* ON Load */
$(function(){
    Tetris.Control.setup();
    Tetris.GameOvaer();
    $('#play').click(
        function(){
            $(this).fadeOut('slow');
            $('#Game_over').fadeOut('slow');
            Tetris.Control.game_start();
        }
    );
});

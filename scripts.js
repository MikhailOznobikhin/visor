// ОТРИСОВКА ОНЛАЙН
let canvas = document.createElement("canvas")

canvas.width = document.body.clientWidth; 
canvas.height = document.body.clientHeight;

let ctx = canvas.getContext("2d")

document.body.appendChild(canvas);

let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
let canDrawSelection = false;

canvas.addEventListener("mousedown", function(e) {
canDrawSelection = true;
x1 = e.clientX;
y1 = e.clientY;
x2 = e.clientX;
y2 = e.clientY;
});

canvas.addEventListener("mouseup", function(e) {canDrawSelection = false;});

canvas.addEventListener("mousemove", function(e) {x2 = e.clientX;y2 = e.clientY;});

function drawSelection() {
    if (canDrawSelection === true) {
    ctx.beginPath();
    ctx.lineWidth="2";
        ctx.strokeStyle="black";
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.stroke();
}}

function render() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
drawSelection();}

function animate() {    requestAnimationFrame(animate);render();}

animate();


// СОЗДАНИЕ БЛОКОВ
let x, y;
let width, height;
let mass_xywh = [];
let selections = {};
let selection_index = 0;
     
$(document).mousedown(
    function(e){
        x = e.pageX;        
        y = e.pageY;                  
});   

$(document).mouseup( 
    function(e){
        var Xend = e.pageX;        
        var Yend = e.pageY;
        width  = Xend - x;
        height = Yend - y;
                
        maxH = document.body.clientHeight;
        maxW = document.body.clientWidth;

        x = x/maxW*100;
        y = y/maxH*100;
        width = width/maxW*100;
        height = height/maxH*100;

        if(width < 0){
            width = Math.abs(width);
            x = x - width;
        }
        if(height < 0){
            height = Math.abs(height);
            y = y - height;
        }

    if(width > 3 && height > 3){
        let elem = $(`<div class="block" sel_index=${selection_index}><i class="material-icons del_img">highlight_off</i></div>`);
        $('div.main').append(elem);
        let position = {'width': `${width}%`, 'height': `${height}%`, 'top': `${y}%`, 'left': `${x}%`};
        elem.css(position);     

        selections[selection_index] = position;
        // console.log(position);
        canDrawSelection = false;    
        ++selection_index;                   
    }else{console.log('Слишком маленькая область')}
});

$('body').on('click', '.del_img', function() {
    console.log('вызов удаления');
    let parent = event.target.closest('div');
    delete selections[$(parent).attr('sel_index')]
    parent.remove()
});



// Модальное окно
$('body').on('click','.block', function(e){
    let modal = $(`<div class="modal"><i class="material-icons del_img">highlight_off</i></div>`);
    $('div.main').append(modal);  
}).on('click','.del_img',function(e){
    e.stopPropagation();
});

// Закрытие через клик вне зоны
$(function($){
$(document).mouseup(function (e){ 
    var div = $(".modal"); 
    if (!div.is(e.target)) { 
        div.remove();
        console.log('клик вне зоны')
        }
    });
});

// ПОЯВЛЕНИЕ МЕНЮ
$('.open_nav').on('click', function(){
    if($('.open_nav').hasClass('rotate')){
        $('nav').css('margin-left', '-25%');
        $('.open_nav').removeClass('rotate');
        $('canvas').css('width','100%' );
        $('.main').css('width','100%');
        $('.main').css('margin-left','0%');
 
        $('.main').css('height', '0%');
        $('.main').css('position', 'static');
        console.log('Закрытие кнопкой')
    }else{
        $('nav').css('margin-left', '0');
        $('.open_nav').addClass('rotate');
        $('canvas').css('width','75%' );
        $('.main').css('width','75%');
        $('.main').css('margin-left','25%');
        $('.main').css('height', '100%');
        $('.main').css('position', 'absolute');
        
        console.log('открытие кнопкой')
    }
    })
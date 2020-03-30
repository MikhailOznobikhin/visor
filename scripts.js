// Изменение метрики блока
$('#put_metrica').on('click',function(){
    let parentId = $(event.target.closest('#modal_select_metrica')).attr('index');
    let metrica = $('#modal_select_metrica #select_metric').val()

    $.ajax({
      url: 'http://localhost:2113/feature-value/metric-area/'+parentId,
      type: 'PUT',
      data:  JSON.stringify({ "metrica": metrica}),
      success: function(result) {console.log("Метрика блока "+ parentId +" изменена на "+ metrica);
      }
    });
  });

// Онлайн показ размера блока
let canvas = document.createElement("canvas")
canvas.width = document.body.clientWidth; 
canvas.height = document.body.clientHeight;
let ctx = canvas.getContext("2d")
document.getElementsByClassName('main')[0].appendChild(canvas);
let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
let canDrawSelection = false;

canvas.addEventListener("mousedown", function(e) {
    canDrawSelection = true;
    x1 = e.pageX+8;
    y1 = e.pageY-56;
    x2 = e.pageX;
    y2 = e.pageY;
});

canvas.addEventListener("mouseup", function(e) {
    canDrawSelection = false;
});

canvas.addEventListener("mousemove", function(e) {
    x2 = e.pageX+8;
    y2 = e.pageY-56;
});

function drawSelection() {
    if (canDrawSelection === true) {
        ctx.beginPath();
        ctx.lineWidth="2";
        ctx.strokeStyle="black";
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.stroke();
    }
}

function render() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    drawSelection();
}

function animate() {
    requestAnimationFrame(animate);
    render();
}
animate();


// Создание блоков
let x, y;
let width, height;
let selections = {};
let index;
     
$(document).mousedown(
    function(e){ 
      x = e.pageX;  
      y = e.pageY;                  
});   

$(document).mouseup( 
    function(e){
        let Xend = e.pageX;        
        let Yend = e.pageY;
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
        if(width > 3 && height > 3 && resolution){     
            function send_area(){
                $.ajax({
                type: 'POST',
                url: "http://localhost:2113/feature-value/metric-area",
                dataType: 'json',
                data:  JSON.stringify({
                    "page": "TEST", 
                    "x": x, 
                    "y": y,
                    "height": height, 
                    "width": width, 
                    "metrica": "TEST"
                }),success: (function (response) { index = response.id; console.log("Блок: "+index+" создан"); adding_index()})
                });
            }  
            send_area();

            let elem = $(`<div class="block" index="0"><i class="material-icons del_img" style="pointer-events: none;">highlight_off</i></div>`);
            $('div.main').append(elem);
            let position = {'width': `${width}%`, 'height': `${height}%`, 'top': `${y}%`, 'left': `${x}%`};
            elem.css(position);                 
            canDrawSelection = false;  
            

            function adding_index(){
                elem.attr('index',index);
                elem.children('i').removeAttr('style');
                selections[index] = position;
            } 
        }
});


// Удаление блоков
$('body').on('click', '.del_img', function() {
    let parent = event.target.closest('div'); 
    $.ajax({
        url: 'http://localhost:2113/feature-value/metric-area/'+$(parent).attr('index'),
        type: 'DELETE',
        success: function(result) {console.log('Блок: '+$(parent).attr('index')+' удалён.'); }
    });
    delete selections[$(parent).attr('sel_index')]
    parent.remove()
}); 


// Боковое меню
var resolution = true;
$('.open_nav').on('click', function(){
    if($('#myNavmenu').hasClass('open_menu')){
        $('#myNavmenu').removeClass('open_menu');
        $('#myNavmenu').addClass('close_menu');
        $('#blackout').removeClass('blackout');
        $('.open_nav').removeClass('rotate');
        $('body').removeClass('left')
        resolution = true;
    } else {
        $('body').addClass('left');
        $('#blackout').addClass('blackout');
        $('.open_nav').addClass('rotate');
        $('#myNavmenu').addClass('open_menu');
        $('#myNavmenu').removeClass('close_menu');
        resolution = false;
    }   
});


// Открытие модальных окон
$('body').on('click', 'div.block', function(event) {
    if (event.target.children.length != 0){ 
        $('#modal_select_metrica').attr('index', $(event.currentTarget).attr('index'));
        $("#modal_select_metrica").modal('show');
    }
});

$('body').on('click', 'button.add_screen', function(event) {
    $("#modal_add_screen").modal('show');  
});


// Получение метрик с сервера
function fill_metric_modal_dropdown(metrica) {
    $('#select_metric').append($(`<option>${metrica.next_event}</option>`));
}

function fill_dropdowns_with_metrics(metrics){
    metrics.forEach(function(metrica, _, _) {
        fill_metric_modal_dropdown(metrica);
    });
    $('.selectpicker').selectpicker('render');
}

function get_metric(){
    let req = $.ajax({
        type: "GET",
        url: 'http://localhost:2113/feature-value/transitions/test',
    }).done(function(data) {
        fill_dropdowns_with_metrics(data);
    });
};  

$(function() {
    get_metric();
});


// Отрисовка зон с бэка
$.ajax({
    type: "GET",
    url: 'http://localhost:2113/feature-value/metric-area/list',
}).done(function(data) {
    data.forEach(function(item){
        let elem_serv = $(`<div class="block" index="${item.id}" ><i class="material-icons del_img">highlight_off</i></div>`);
        $('div.main').append(elem_serv);
        let position = {'width': `${item.width}%`, 'height': `${item.height}%`, 'top': `${item.y}%`, 'left': `${item.x}%`};
        elem_serv.css(position);     
        selections[index] = position;
        canDrawSelection = false;           
    });
});


$('.custom-file-input').on('change',function(){
    let filePath = $(this).val();
    let separator = filePath.search('/') != -1 ? '/' : '\\';
    $('.custom-file-label').html(filePath.split(separator).pop());
});


// Получение скринов с сервера
$(function get_screen(){
    $.ajax({
        type: "GET",
        url: 'http://localhost:2113/feature-value/page/list',
    }).done(function(data) {
        data.forEach(function(item){
            let screen= $(`<li class="nav-item" id_li="${item.id}">
            <button id_img="${item.id}" name_img="${item.name}" product_img="${item.product}" ext_img="${item.file_ext}" class="btn btn-info open_screen">${item.name}</button>
            <button type="button" class="btn btn-danger delete_screen" id_del="${item.id}">
            <i class="material-icons del_img" style="pointer-events: none;">highlight_off</i>
            </button></li>`);
            $('#list_screen').append(screen);
        });
    });
})


// Загрузка скринов на сервер
function setimage(){  
    event.preventDefault();
    var data = new FormData();
    data.append('page_background', $('input[type=file]')[0].files[0]);
    data.append('page_info', JSON.stringify({"name": $('#page_name').val(), "product": "test_product"}));
    function send_img(){
        $.ajax({
            url: 'http://localhost:2113/feature-value/page',
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            enctype: 'multipart/form-data',
            method: 'POST',
            type: 'POST',
            success: function(data){
                localStorage.setItem('key', data.id);
                localStorage.setItem('key', data.file_ext);
                console.log(data)
                console.log('данные отправлены');
                // $('canvas').css('background', 'url(../images/test_product/'+data.id+'.'+data.file_ext);
            }
        })
    }
    setTimeout(send_img,4000)
}

$('#send_screen').on('click',function(e){e.preventDefault(); setimage()})




// Действие при клике на скрин 
$('body').on('click', '.open_screen', function() {
    $('canvas').css('background', 'url(../images/test_product/'+event.target.getAttribute("id_img")+'.'+event.target.getAttribute("ext_img"));
}); 


// Удаление скрина
$('body').on('click', '.delete_screen', function() {
    event.preventDefault();
    let id_d = event.target.getAttribute('id_del');
    $.ajax({
        url: 'http://localhost:2113/feature-value/page/'+id_d,
        type: 'DELETE',
        success: function(result) {
            console.log('Скрин: '+ id_d +' удалён.'); 
        }
    });
    $('[id_li ='+ id_d +']').remove()
}); 

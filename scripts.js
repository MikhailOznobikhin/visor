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

canvas.addEventListener("mouseup", function(e) {
    canDrawSelection = false;
});

canvas.addEventListener("mousemove", function(e) {
    x2 = e.clientX;
    y2 = e.clientY;
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
    if($('#myNavmenu').hasClass('canvas-slid')){
        $('#blackout').removeClass('blackout');
        $('.open_nav').removeClass('rotate');
        resolution = true;
    } else {
        $('#blackout').addClass('blackout')
        $('.open_nav').addClass('rotate');
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


// $('#add_screen').on('click',function(){
//     var name_page = $('.name_page').val();
//     var link_page = $('.custom-file-label').html();
//     var form = $('#customFile')[0];
    
//     console.log(form)
    
    
//     var data = new FormData(form)
//     data.append("CustomField", "This is some extra data, testing");


//     console.log('Название файла: '+name_page);
//     console.log('Ссылка на файл: '+link_page);

//     $.ajax({
//         type: "POST",
//         enctype: 'multipart/form-data',
//         url: "http://localhost:2113/feature-value/page/",
//         data: data,
//         processData: false,
//         contentType: false,
//         cache: false,
//         timeout: 600000,
//         success: function (data) {

//             $("#result").text(data);
//             console.log("SUCCESS : ", data);
//             $("#btnSubmit").prop("disabled", false);

//         },
//         error: function (e) {

//             $("#result").text(e.responseText);
//             console.log("ERROR : ", e);
//             $("#btnSubmit").prop("disabled", false);

//         }
//     });



    // $.ajax({
    //     type: 'POST',
    //     url: "http://localhost:2113/feature-value/page",
    //     dataType: 'application/json',
    //     contentType: 'multipart/form-data',

    //     success: (function (response) { console.log('Файл: '+name_page+ ' загружен');;})
    // });



// })
  

$(document).ready(function () {

    $("#btnSubmit").click(function (event) {

        //stop submit the form, we will post it manually.
        event.preventDefault();

        // Get form
        var form = $('#fileUploadForm')[0];

		// Create an FormData object 
        var data = new FormData(form);

		// If you want to add an extra field for the FormData
        data.append("CustomField", "This is some extra data, testing");

		// disabled the submit button
        $("#btnSubmit").prop("disabled", true);

        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "http://localhost:2113/feature-value/page",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (data) {

                $("#result").text(data);
                console.log("SUCCESS : ", data);
                $("#btnSubmit").prop("disabled", false);

            },
            error: function (e) {

                $("#result").text(e.responseText);
                console.log("ERROR : ", e);
                $("#btnSubmit").prop("disabled", false);

            }
        });

    });

});


/*
curl -i -X PUT -H "Content-Type: multipart/form-data" 
-F "screen=@/home/user/test/bill.svg;type=image/svg" 
-F 'data={"name": "testee2"};
type=application/json' 
http://localhost:2113/feature-value/page/2

[{"id": 1, "name": "testee", "product": "test_product"}]


curl -i -X POST -H "Content-Type: multipart/form-data" -F "screen=@/home/user/test/img.jpg;type=image/jpeg" -F 'data={"product":"test_product", "name": "testee"};type=application/json' http://localhost:2113/feature-value/page
*/


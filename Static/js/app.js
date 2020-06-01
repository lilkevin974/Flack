var existingschannels= [];
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port); 

document.addEventListener('DOMContentLoaded', () => {

var nickname=document.querySelector('h1').innerHTML;   

    document.querySelector('.burger').onclick= () => {
        document.querySelector('.interface').classList.toggle('sidebar-reveal');
    }
    
    
    let room=localStorage.getItem('room')
    if (room != 'public'){
        if (room!= null){
        newchannel(room);
        }
        else{
            room= 'public'    
        }
    }    
    joinRoom(room);
    document.querySelector("#channel-choice").value=room;
    
    document.querySelector("#channel-choice").onchange = () =>{
        document.querySelector('.msg-container').innerHTML='';
        
        let choice = document.querySelector("#channel-choice").value;
            if (choice === room) {
                msg = `You are already in ${room} room.`;
            } else {
                leaveRoom(room);
                joinRoom(choice);
                room = choice;
            }
            loadmessage();
            currentchannel();
    }
   
    document.querySelector('#menu2').classList.toggle('menu-hidden');

    selectupdate();

    document.querySelector('.add-channel').onclick= function(){

        if (document.querySelector('.input-channel')===null){
            const input= document.createElement('input');
            input.setAttribute('type', 'text');
            input.classList.add('input-channel');
            document.querySelector('#add-channel').appendChild(input); 
        }else{
            document.querySelector('#add-channel').removeChild(document.querySelector('.input-channel'));
        }
    }

    document.querySelector('.pers-info img').onclick = () =>{
        const modal =document.querySelector('.user-modal');
        modal.classList.toggle('active');
    }

    document.querySelector('#add-picture').onclick = () =>{
        document.querySelector('#img').click();
    }

    document.querySelector('#close-but').onclick= () =>{
        const modal =document.querySelector('.user-modal');
        modal.classList.remove('active');
    }


    // On connect event, keep track of the submit event to send message to server
    socket.on('connect', () => {
 
        document.querySelector('#msg-form').onsubmit= () =>{
            const message=document.querySelector('#msg-input');
            var nickname=document.querySelector('h1').innerHTML;
            const channelselected=document.querySelector("#channel-choice").value;
            if (message.value != ''){
                socket.emit('send message', {"message":message.value, "nickname":nickname, "channelselected":channelselected});
                message.value = '';
            }
            return false
        };   
    });

    // Receive created channel from socket and add it
    socket.on('addchannels', data => {
                allchannels(data.li);
    });

    // Receive message from sockect and display it
    socket.on('receive message', data => {
        messagecreate(data);
    });
    
    loadmessage();

    // Join an existing channel and add it to "your channels"
    document.querySelector('#tab2').addEventListener('click', () =>{ 
        const channeli = document.querySelectorAll ('#all-channels > li');
        channeli.forEach(li =>{
            li.onclick= () => {
                var c = confirm(`Do you want to enter in ${li.innerHTML} channel?"`);
                if (c==true){
                    newchannel(li.innerHTML);
                }
            }
        })
    })
   
    function leaveRoom(room) {
            localStorage.removeItem('room', room)
            disconnected_user(nickname, room)
            socket.emit('leave', {'nickname': nickname, 'room': room});
    }
    function joinRoom(room) {
        
        localStorage.setItem('room', room)
        room=localStorage.getItem('room')
        
        
        
        socket.emit('join', {'nickname': nickname, 'room': room});
    }

    socket.on('message', data =>{
        console.log(data);
        const flash=document.createElement('div');
        flash.innerHTML=`<p><i class="fa fa-sign-in"></i>${data.msg}</p>`;
        document.querySelector('.alert-container').appendChild(flash);
        if (data.status == "connected"){
           connected_user(data.nickname, data.room) 
        }
        if (data.status == "disconnected"){
            disconnected_user(data.nickname, data.room) 
        }
        
        setTimeout(()=>{
            document.querySelector('.alert-container').removeChild(flash);
        },10000);
        
    })
});


var channelist =[]; 

var tab ='';
var tabactive=''; 

// Change class on tab menu
function changemenu(){
      
        tab =document.querySelector('.tab');
        tabactive=document.querySelector('.tab-active');
    
        tab.classList.remove('tab');
        tab.classList.add('tab-active');
        
        tabactive.classList.remove('tab-active');
        tabactive.classList.add('tab');
        
        document.querySelectorAll('.menu').forEach(menu =>{
        menu.classList.toggle('menu-hidden');    
        })   
};

// Add channels into the list "your channels"
function newchannel(channeladded){
        console.log(channeladded)
        const input=document.querySelector('.input-channel');
        if (input != null){
            var channeladded=input.value;
        }
        if (channelist.indexOf(channeladded)==-1){
            const li=document.createElement('li');
            li.innerHTML=`${channeladded}<ul name='${channeladded}'></ul>`;
            document.querySelector('#channel-list').appendChild(li);
        }
        if (input != null){
             document.querySelector('#add-channel').removeChild(input);
        }
        selectupdate(); 
       
        socket.emit('existing channels', {"li":channeladded});
            
        return false
};

// Verify that input login is not empty
function validate (){

    if (document.querySelector('#login').value.length > 0){
        document.querySelector('#login').focus();
        return true;
    }
    else
        document.querySelector('#login').focus();
        return false;
}

// Update options in the select element
function selectupdate(){
    const channelchoice = document.querySelector("#channel-choice");
    const channel = document.querySelectorAll ('#channel-list > li');
    
    channel.forEach(value =>{
        console.log(value.children)
        const name=value.children[0].getAttribute('name');
        if (channelist.indexOf(name)==-1){
            channelist.push(name);
            channelchoice.options.add(new Option (name,));
            allchannels(name);
        }
    })
    currentchannel();
}

// Request store messages on Flask server
function loadmessage(){

    var username = document.querySelector('h1').innerHTML;
    const channel= document.querySelector('#channel-choice').value;
    console.log(channel);

    const request = new XMLHttpRequest();
    request.open('POST', '/loadmessage');
    request.onload = () => {
        const response = JSON.parse(request.responseText);
        console.log (response);
        response[0].forEach(value =>{
            console.log(value)
            if (value.channelselected ===channel) {
                messagecreate(value);
            }
        })
        response[1].forEach(value =>{
            console.log(value)
            allchannels(value) ;  
        })
    };
    request.send();
}

// Make a new message appear in the chat app
function messagecreate(data){
        var username = document.querySelector('h1').innerHTML;
        var mess= document.createElement('div');
        var message=data.message;
        var nickname=data.nickname;
        var timestamp=data.timestamp;
        const box=document.querySelector('.msg-box');
        mess.innerHTML =`<div class="msg-info"><div class="msg-header"><h2>${nickname}</h2> <span>${timestamp}</span> </div><p>${message}</p>  </div>` ;
        mess.classList.add('msg');
        if (nickname===username){
            mess.style.margin="0em 2em 1em auto";
            mess.style.backgroundColor="rgba(58, 60, 76, 1)";
        }
        document.querySelector('.msg-container').appendChild(mess);
        mess.addEventListener('animationend',() => { 
            box.scrollTop= box.scrollHeight - box.clientHeight;
        })
}

// Add channels into the list "Existings channels" if doesn't exist yet
function allchannels(data){

     if (existingschannels.indexOf(data)==-1)
            {
                existingschannels.push(data);
                const li=document.createElement('li');
                li.innerHTML=data;
                document.querySelector('#all-channels').appendChild(li);
            }
        
}

// Preview user image
function preview(e){
    const input= e.target.files[0];
    const reader=new FileReader();
    reader.onload = () => {
        const result = reader.result;
        const img = document.querySelectorAll('.userphoto');
        img.forEach(img =>{ 
            img.src= result;
        })
    }
    reader.readAsDataURL(input)
}

function currentchannel(){
    
    document.querySelectorAll('#channel-list > li').forEach(li =>{
        const name=li.children[0].getAttribute('name');
        const current= document.querySelector('#channel-choice').value
        if(name===current){
            li.style.color='turquoise'
        }
        else{
            li.style.color='gainsboro';
        }
    })
}

function connected_user(user, channel){
    const u=user;
    const c=document.querySelector(`#channel-list ul[name="${channel}"]`);
    const li=document.createElement('li');
    li.innerHTML=u;
    c.appendChild(li);
}

function disconnected_user(user, channel)
{
    const u=user;
    const c=document.querySelector(`#channel-list ul[name="${channel}"]`);
    const li=c.querySelectorAll('li')
    li.forEach(li =>{
        if (li.innerhtml=user){
            c.removeChild(li);
        }
    })
}
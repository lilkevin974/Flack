import os

from time import localtime, strftime
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_socketio import SocketIO, emit, leave_room, join_room, send
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
socketio = SocketIO(app)

public=[]
allchannels=[]

@app.route("/")
def index():    
    if session.get('nickname') is None:
        session['nickname']=''
        return render_template('index.html')
    return redirect( url_for ('message'))
    

@app.route("/message", methods=["GET", "POST"])
def message():
    if  request.method== 'POST':
        nickname = request.form.get ("nickname")
        session['nickname']=nickname
    else:
        nickname=session['nickname']
    return render_template ('message.html', nickname=nickname)

@socketio.on("send message")
def vote(data):
    message= data["message"]
    nickname= data["nickname"]
    room=data["channelselected"]
    data["timestamp"]=strftime('%I:%M %p', localtime())
    timestamp=data["timestamp"]

    if any(d['channelselected']==room for d in public):
        count=sum(s.get('channelselected') == room for s in public)
        if count > 99 :
            for i in range (len(public)):
                if public[i]['channelselected']==room:
                    del public[i]
                    break

    public.append(data)
    print (public)
    emit("receive message", {"message":message, "nickname":nickname, 'timestamp':timestamp}, room=room)

@socketio.on("existing channels")
def channels(data):
    li=  data['li']
    allchannels.append(li)
    emit("addchannels", {"li" :li}, broadcast=True)

@socketio.on('join')
def on_join(data):
    """User joins a room"""

    nickname = data["nickname"]
    room = data["room"]
    join_room(room)

    send({"msg": nickname + " has joined " + room + " channel", 'nickname':nickname, 'room':room, 'status':'connected'}, room=room)


@socketio.on('leave')
def on_leave(data):
    """User leaves a room"""

    nickname = data["nickname"]
    room = data['room']
    leave_room(room)
    send({"msg": nickname + " has left " + room + " channel",'nickname':nickname, 'room':room, 'status':'disconnected'}, room=room)


@app.route("/loadmessage", methods=["POST"])
def loadmessage():

    container=[]
    container.append(public)
    container.append(allchannels)
    resp=jsonify(container)
    
    return resp






from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/create-room")
def create_room():
    mode = request.args.get("mode", "public")
    return render_template("watch-room.html", room_type=mode)

@socketio.on("join")
def handle_join(data):
    room = data["room"]
    join_room(room)
    emit("user_joined", {"message": f"User joined {room}"}, room=room)

if __name__ == "__main__":
    socketio.run(app, debug=True)

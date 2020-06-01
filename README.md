# Project 2 - CS50W

Web application with Python and JavaScript \
Named Flack, it's an online messaging service using Flask, similar in spirit to Slack.\
In this application users can join and create multiple channels by typing a nickname.\
Once the user has join a channel he can send and receive messages from other users in the same channel.\
It is a real time messaging app using flask socket.io. \
No database is used. The app only store the 100 most recent messages per channel in server-side memory.\

---

 Templates folder contains 2 html files :

 * index.html : where the user can choose a nickname ;
 * message.html : where the users can create/join channel and communicate with other users ;

 ---

Static folder contains :

* Images folder which contains some pictures and icons ;
* Style folder:
    * Sass 
    * CSS map
    * CSS
* Js folder wich contains the javascript file;

---

- application.py : python web application using Flask:
    * Flask_socket.io;
    * Flask_session;
- requirements.txt : python packages that need to be installed.
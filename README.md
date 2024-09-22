| Modern                           | Authenticated                            | Meetings                                     |
| ----------------------------------- | ----------------------------------- | ------------------------------------------- |
| ![home](https://github.com/dr-naikare/VideoKon_SDK/blob/main/Media/Home.png) | ![login](https://github.com/dr-naikare/VideoKon_SDK/blob/main/Media/Login.png) | ![meeting](https://github.com/dr-naikare/VideoKon_SDK/blob/main/Media/Meetings.png) |




<h1 align="center" style="font-weight: bold;">VideoKon 🎦</h1>

<p align="center">
<a href="#tech">Technologies</a>
<a href="#started">Getting Started</a>
<a href="#routes">API Endpoints</a>
<a href="#colab">Collaborators</a>
<a href="#contribute">Contribute</a> 
</p>


<p align="center">Our goal is to develop a robust real-time communication platform utilizing WebRTC and Socket.io, with a focus on scalability and also providing Integrations to other software</p>


<p align="center">
<a href="guthib.com">🌐 Will be live soon </a>
</p>

<h2 id="technologies">💻 Technologies</h2>

-> Node js

-> React js 

-> WebRTC

-> Socket.io

->MongoDB

<h2 id="started">🚀 Getting started</h2>

## Prerequisites 
Here you list all the prerequisites necessary for running your project. For example:

- [Nodejs](https://nodejs.org/en)
- [Git](https://git-scm.com/)


## Project Installation
1. Clone the repository:
```bash
git clone https://github.com/dr-naikare/VideoKon_SDK.git
```

2. Redirect to both directories (frontend & backend) separately using 
```bash
cd \VideoKon_SDK\frontend
cd \VideoKon_SDK\backend
```

3. Install dependencies in both directories: 
```bash
 npm install
 ```
## Few Important Steps
->Make sure to place a file named '.env' in the \VideoKon_SDK\backend directory. This file should contain your database URI and JWT key. Below is the directory structure for better understanding

```bash
📦backend
 ┣ 📂config
 ┣ 📂controllers
 ┣ 📂middleware
 ┣ 📂models
 ┣ 📂routes
 ┣ 📂utils
 ┣ 📜.env
 ┣ 📜package.json
 ┗ 📜server.js
```
.env file Data
```
MONGO_URI= mongodb://localhost:27017/<database>
JWT_SECRET=anyrandomsecretkey
```
More info related [JWT secret key](https://jwt.io/introduction/)
## Running the Project

<table style="width:100%">
<tr>
<th style="width:50%;">Running the server</th>
<th style="width:50%;">Running the front end</th>
</tr>
<tr>
<td>
  
```bash
# Assuming you are in /backend directory
# If not then cd \VideoKon_SDK\backend
npm start
```
  
</td>
<td>

```bash
# Assuming you are in /frontend directory
# If not then cd \VideoKon_SDK\frontend
npm run dev
```

</td>
</tr>
</table>




<h2 id="routes">📍 API Endpoints</h2>

Coming Soon ...

<h2 id="colab">🤝 Collaborators</h2>

<p>Special thank you to all the people who contributed to this project.</p>
<table>
<tr>

<td align="center">
<a href="https://github.com/B-Mustafa">
<img src="https://avatars.githubusercontent.com/u/123825821?v=4" width="100px;" alt="Mustafa Bhikhapurwala Profile Picture"/><br>
<sub>
<b>Mustafa Bhikhapurwala</b>
</sub>
</a>
</td>

<td align="center">
<a href="https://github.com/dr-naikare">
<img src="https://yt3.ggpht.com/a/AATXAJyJ6fdMTXdCixgyPoepopcZ7aGarfuCTwKwDlIXXw=s900-c-k-c0xffffffff-no-rj-mo" width="100px;" alt="Suyash Naikare Profile Picture"/><br>
<sub>
<b>Suyash Naikare</b>
</sub>
</a>
</td>

<td align="center">
<a href="https://github.com/Mohammedbariya">
<img src="https://avatars.githubusercontent.com/u/111173898?v=4" width="100px;" alt=" Mohammed Bariyawala Profile Picture"/><br>
<sub>
<b> Mohammed Bariyawala</b>
</sub>
</a>
</td>

</tr>
</table>

<h2 id="contribute">📫 Contribute</h2>

Other developers can contribute to this project.

1. Clone or Fork
2. Create your own branches
3. Follow commit patterns
4. Open a Pull Request explaining the problem solved or feature made, if it exists, append a screenshot of visual modifications and wait for the review!

<h3>Documentations that might help</h3>

Coming Soon ...

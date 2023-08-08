const express = require('express');
const app = express();
const socketConnect = require('./socket.js');
const dotenv = require('dotenv');
const loginSystem = require('./services/loginSystem.js');
const bodyParser = require('body-parser');
const path = require('path');
const boardSystem = require('./services/boardSystem.js');
const like = require('./services/likeSystem.js');
const userRouter = require('./routes/login.js');
const postRouter = require('./routes/board.js');

dotenv.config();
app.use(express.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/public', express.static('public'));

/* 안드로이드와 HTTP 통신 */
// 로그인 관련 라우터
app.use('/login', userRouter);
// 게시물 관련 라우터
app.use('/posts', postRouter);

// 서버 가동
const server = app.listen(process.env.PORT, () => {
    console.log('Listening on ' + process.env.PORT);
});

// 소켓 연결
socketConnect(server, app);

// const test = {
//     id: 'phs1234',
//     pwd: 'test'
// }

// loginSystem.registUser(test)
//     .then((result) => {
//         if (result) {
//             console.log('Login Success');
//         } else {
//             console.log('Login Fail');
//         }
//     })
//     .catch(error => {
//         console.log('Login Fail ', error.message);
//     });

// const data = {
//     title: 'test',
//     content: 'test',
//     image_name: 'cake1.jpg',
//     user_id: 'test'
// }

boardSystem.selectPost(1)
    .then((result) => {
        console.log(result);
    })
    .catch((error) => {
        console.log('Error: ', error.message);
    })


// const test = {
//     userId: 'test',
//     postNum: '1'
// }

// like.checkLikeStatus(test)
//     .then(hasLike => {
//         if (hasLike) {
//             return like.deleteLike(test);
//         } else {
//             return like.addLike(test);
//         }
//     })
//     .then(result => {
//         console.log('Like Success');
//     })
//     .catch(error => {
//         console.log(error);
//     })

// like.numberOfLikes(1)
//     .then(counts => {
//         console.log(counts[0].likeCount);
//     })

// like.myLikesList({id: 'test'})
//     .then((results) => {
//         console.log(results);
//     })
//     .catch(error => {
//         console.log(error.message);
//     })
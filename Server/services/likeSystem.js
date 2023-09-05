const db = require('../config/db.js');
const boardSystem = require('../services/boardSystem.js');

module.exports = {
    // 좋아요 눌렀는지 검사
    checkLikeStatus: async (data) => {
        return new Promise((resolve, reject) => {
            const query = `select * from likes where post_num='${data.postNum}' and user_id='${data.userId}'`;

            db.query(query, (err, results)=>{
                if (err){
                    console.log('Error while select from likes : ', err.message);
                    reject(err);
                } else {
                    resolve(results.length > 0);
                }
            });
        });
    },

    // 좋아요 추가
    addLike: async (data) => {
        return new Promise((resolve, reject) => {
            const query = `insert into likes values (null, '${data.postNum}', '${data.userId}')`;

            db.query(query, (err, result) => {
                if (err) {
                    console.log('Error while insert likes : ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    // 좋아요 취소
    deleteLike: async (data) => {
        return new Promise((resolve, reject) => {
            const query = `delete from likes where user_id='${data.userId}' and post_num='${data.postNum}'`;

            db.query(query, (err, result) => {
                if (err) {
                    console.log('Error while delete like : ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    // 해당 게시물의 좋아요 개수 반환
    numberOfLikes: async (postNum) => {
        return new Promise((resolve, reject) => {
            const query = `select count(*) as likeCount from likes where post_num='${postNum}'`;

            db.query(query, (err, result) => {
                if (err) {
                    console.log('Error while count from likes : ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    // 내가 좋아요 한 게시물의 num 반환
    myLikesList: async (userData) => {
        return new Promise((resolve, reject) => {
            const query = `select * from likes where user_id='${userData.userId}'`;

            db.query(query, async (err, results) => {
                if (err) {
                    console.log('Error while select likes by id : ', err.message);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },
}
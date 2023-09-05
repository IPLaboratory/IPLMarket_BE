const db = require('../config/db.js');
const bcrypt = require('bcrypt');
const saltRounds = 5;

module.exports = {
    // 아이디로 유저 찾기 -> 아이디 중복 검사에도 활용
    findUserById: async (userData) => {
        return new Promise((resolve, reject) => {
            const query = `select * from users where id = '${userData.id}'`;

            db.query(query, (err, result) => {
                if (err) {
                    console.log('Error while find user by ID : ', err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    // 로그인 기능
    login: async (userData) => {
        try {
            const result = await module.exports.findUserById(userData);

            if (result.length > 0){
                const existUser = result[0];
                const isSame = bcrypt.compareSync(userData.pwd, existUser.pwd);

                if (isSame) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            console.log('login Error : ',error.message);
            return false;
        }
    },

    // 회원가입 기능
    registUser: async (userData) => {
        return new Promise((resolve, reject) => {
            // 데이터 유효성 검증 -> 빈 문자열 있는지 검증
            for (const key in userData) {
                if (userData[key] === '') {
                    reject (new Error(`Field '${key}' Is Empty`));
                    return;
                }
            }

            // 비밀번호 암호화
            const encryptedPwd = bcrypt.hashSync(userData.pwd, saltRounds);
            const query = `insert into users(id, pwd, u_name, nickname, phone_number) values(
                '${userData.id}', '${encryptedPwd}', '${userData.name}', '${userData.nickname}', '${userData.phone_number}')`;

            db.query(query, (err, result) => {
                if (err) {
                    console.log('Error while insert users : ', err.message);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });

    },
};

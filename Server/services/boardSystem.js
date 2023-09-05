const db = require('../config/db.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

module.exports = {
    // 게시물 조회
    getBoardList: async (postData) => {
        return new Promise((resolve, reject) => {
            try {
                let query = `select * from board`; // 전체 게시물
                
                if (postData){
                    query = `select * from board where user_id='${postData.userId}'`; // 나의 게시물 조회시
                }

                db.query(query, async (err, results) => {
                    if (err){
                        console.log('Error while select from board : ', err.message);
                        reject(err);
                        return;
                    }
                    
                    const posts = []
                    const getThumbnail = async (data) => {
                        let originalName = data.image_name;
                        let newName;

                        if (postData) {
                            // 나의 게시물 조회시
                            newName = originalName.split(".")[0] + "_" + postData.userId + "_" + data.num + ".jpg";
                        } else {
                            // 전체 게시물 조회시
                            newName = originalName.split(".")[0] + "_" + data.user_id + "_" + data.num + ".jpg";
                        }
                        data.image_name = newName;

                        // 썸네일 이미지 인코딩
                        const filePath = path.join(__dirname, '..', 'public', 'images', data.image_name);
                        const fileContent = await fs.readFile(filePath, 'base64');

                        const modifiedData = {
                            num: data.num,
                            title: data.title,
                            content: data.content,
                            price: data.price,
                            video_name: data.video_name,
                            thumbnail_image: fileContent,
                            regist_date: data.regist_date,
                            user_id: data.user_id
                        };

                        posts.push(modifiedData);
                    };
    
                    // 리사이징 한 이미지를 뱉어줘야 함
                    for (const data of results) {
                        await getThumbnail(data);
                    }
    
                    resolve(posts);
                });

            } catch (error) {
                console.log('Error : ', error.message);
                reject(error);
            }
        });
    },

    // 게시물 등록
    insertPost: async (postData) => {
        return new Promise((resolve, reject) => {
            const query = `insert into board values (null, '${postData.title}', '${postData.content}', '${postData.price}',
                        '${postData.video_name}', '${postData.image_name}', now(), '${postData.user_id}')`;

            db.query(query, async (err, result) => {
                if (err){
                    console.log('Error while insert into board table : ', err.message);
                    reject(err);
                    return;
                }

                // Base64로 인코딩된 이미지 디코딩 및 저장 경로 지정
                const base64Image = Buffer.from(postData.image_data, 'base64');
                const savePath = path.join(__dirname, '..', 'public', 'images', postData.image_name);

                // 디코딩한 이미지 저장
                await fs.writeFile(savePath, base64Image);
                console.log('Save Complete : ' + savePath);

                
                // 리사이즈된 이미지 구분하기 위해 이름 형식 지정 => {클라이언트가 보낸 이미지 이름}_{DB에 저장된 PK}.확장자
                const renaming = `${postData.image_name.split(".")[0]}_${postData.user_id}_${result.insertId}.jpg`;

                sharp(path.join(__dirname, '..', 'public', 'images', postData.image_name))
                    .resize(64, 64, {fit: 'contain'})  // fit : contain 가로 세로 비율 강제 유지
                    .withMetadata()  // 원본 이미지 메타데이터 포함
                    .toFormat('jpeg', {quality: 100}) // 포맷, 퀄리티 지정
                    .toFile(path.join(__dirname, '..', 'public', 'images', renaming), (err, info) => { // 저장 경로를 첫번째 인수에 지정
                        // 리사이즈 이미지 로컬에 저장
                        if (err) {
                            console.log('Error while resizing - saving image: ', err.message);
                            reject(err);
                            return;
                        }
                        
                        console.log(`Resize Image Info : ${JSON.stringify(info, null, 2)}`);
                    }) 
                    .toBuffer(); // 리사이즈 이미지를 노드에서 읽을 수 있도록 변환

                
                resolve(result.insertId); // auto_increment에 따라 생성된 최근 id값
            });
        });
    },

    // 게시물 클릭시 상세보기 -> PK로 검색, 원본 이미지로
    selectPostWithOrigin: async (postNum) => {
        return new Promise((resolve, reject) => {
            try {
                const query = `select * from board where num='${postNum}'`;
    
                db.query(query, async (err, result) => {
                    if (err){
                        console.log('Error while select from board with num : ', err.message);
                        reject(err);
                        return;
                    }
                    
                    // 원본 이미지 인코딩하여 가져오기
                    const postData = {};
                    const getOriginalImg = async (data) => {
                        const filePath = path.join(__dirname, '..', 'public', 'images', data.image_name);
                        const fileContent = await fs.readFile(filePath, 'base64');

                        postData['num'] = data.num;
                        postData['title'] = data.title;
                        postData['content'] = data.content;
                        postData['price'] = data.price;
                        postData['video_name'] = data.video_name;
                        postData['original_image'] = fileContent;
                        postData['regist_date'] = data.regist_date;
                        postData['user_id'] = data.user_id;
                    }

                    await getOriginalImg(result[0]);
                    resolve(postData);
                });

            } catch (error) {
                console.log('Error : ', error.message);
                reject(error);
            }
        })
    },

     // 게시물 데이터 가져오기 -> PK로 검색, 썸네일 이미지로
     selectPostWithThumb: async (postNum) => {
        return new Promise((resolve, reject) => {
            try {
                const query = `select * from board where num='${postNum}'`;
    
                db.query(query, async (err, result) => {
                    if (err){
                        console.log('Error while select from board with num : ', err.message);
                        reject(err);
                        return;
                    }
                    
                    // 썸네일 이미지 인코딩하여 가져오기
                    const postData = {};
                    const getOriginalImg = async (data) => {
                        const originalName = data.image_name;
                        const thumbnail_image = originalName.split(".")[0] + "_" + data.user_id + "_" + data.num + ".jpg";
                        const filePath = path.join(__dirname, '..', 'public', 'images', thumbnail_image);
                        const fileContent = await fs.readFile(filePath, 'base64');

                        postData['num'] = data.num;
                        postData['title'] = data.title;
                        postData['content'] = data.content;
                        postData['price'] = data.price;
                        postData['video_name'] = data.video_name;
                        postData['thumbnail_image'] = fileContent;
                        postData['regist_date'] = data.regist_date;
                        postData['user_id'] = data.user_id;
                    }

                    await getOriginalImg(result[0]);
                    resolve(postData);
                });

            } catch (error) {
                console.log('Error : ', error.message);
                reject(error);
            }
        })
    },

    isClickedLike: async (data) => {
        return new Promise((resolve, reject) => {
            const query = `select * from likes where post_num='${data.postNum}' and user_id='${data.id}'`;

            db.query(query, (err, result) => {
                if (err) {
                    console.log('Error while select from likes : ', err.message);
                    reject(err);
                } else {
                    resolve(result.length > 0); // 게시물의 좋아요를 눌렀는지 표시 위함
                }
            });
        });
    }
}
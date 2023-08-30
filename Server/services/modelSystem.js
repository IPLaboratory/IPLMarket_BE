const db = require('../config/db.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    // 게시물 번호로 해당 게시물 데이터 가져오기
    findPostsByNum: async (postData) => {
        return new Promise((resolve, reject) => {
            const query = `select * from board where num = '${postData.num}'`;

            // 게시물 번호로 조회
            db.query(query, (err, result) => {
                if (err) {
                    console.log('Error while select board by num :',err.message);
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    },

    // 안드로이드에서 전송한 비디오 파일 이름을 갖는 모델링 완료된 디렉토리 있는지 검사 후 반환
    // 모델링 완료된 디렉토리 이름은 안드로이드가 전송한 비디오 파일 이름과 동일
    getModelFiles: async (postData) => {
        return new Promise(async (resolve, reject) => {
            try {

                // 게시물 번호로 조회된 게시물 데이터 가져오기
                const result = await module.exports.findPostsByNum(postData)
                                    .catch(error => reject(error.message));
                
                // 해당 게시물이 있다면 
                if (result.length > 0) {
                    const posts = result[0];

                    // 해당 게시물 업로드 시 VR 모델링 작업에 필요한 영상 파일 이름으로 된 디렉토리있는지 검사
                    // 디렉토리 존재한다면 모델링 작업 완료된 것
                    const directoryPath = path.join(__dirname, '..', posts.video_name);

                    try {
                        await fs.promises.access(directoryPath);
                        
                        console.log(`Exist Directory [${directoryPath}]`);
                        
                        // vr 로딩에 필요한 파일 인코딩 후 저장할 json
                        const base64EncodingMap = {};
                        // 안드로이드에서 파일들 담아 저장할 디렉토리 명
                        base64EncodingMap['directory'] = posts.video_name;

                        // 디렉토리 읽기
                        const files = await fs.promises.readdir(directoryPath);
                        
                        // 디렉토리 하위 파일들 base64 인코딩 후 반환
                        const encodingWithPromise = files.map(async (file) => {
                            try {
                                const filePath = path.join(directoryPath, file);
                                const fileData = await fs.promises.readFile(filePath, 'base64');

                                return { fileName : file, data : fileData};
                            } catch (error) {
                                console.log(`Error while reading file [${file}]`, error.message);
                                return {fileName: file, error: 'Error while reading file'};
                            }
                        });

                        // 모든 파일에 대해 순차적으로 실행되도록 보장
                        const encodedFiles = await Promise.all(encodingWithPromise);

                        // 인코딩된 파일 json에 추가
                        for (const file of encodedFiles) {
                            if(!file.error) {
                                base64EncodingMap[file.fileName] = file.data;
                            }
                        }
                        
                        // 작업 완료 후 반환
                        resolve(base64EncodingMap);
                    } catch (error) {
                        console.log('Not Exist Directory');
                        reject(error);
                    }
                } else {
                    console.log('Not Exist Directory');
                    reject('Not Exist Directory');
                }
            } catch (error) {
                console.log('Error while getModelFiles : ',error.message);
                reject(error);
            }
        });
    }
}
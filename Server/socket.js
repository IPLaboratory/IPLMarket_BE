const fs = require('fs');
const path = require('path');
const socketIO = require('socket.io');
const uuid = require('uuid');

// 딕셔너리 구조에서 value 값으로 key 값 가져오기
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}


module.exports = (server, app) =>{
    const http = require('http').createServer(app);
    const io = socketIO(server, {path:'/socket.io'}, {maxHttpBufferSizke:1e8});
    const clientHasUUID = {};
    const who = {};

    // 소켓 연결
    io.on('connection', (socket) => {
        console.log(`User connect [ID]: ${socket.id}`);
        clientHasUUID[socket.id] = uuid.v4();

        socket.on('client registration', (data) => {
          who[socket.id] = data['device'];
          console.log(`[${new Date().toLocaleString()}]: socket ID: ${socket.id} : ${who[socket.id]}`)
        })

        socket.on('ml message', (data) => {
          console.log(data);
        });

        io.to(socket.id).emit('test', '...');

        /* 클라이언트에서 Base64 인코딩된 비디오 파일 분할 전송
         * 수신하여 합친 후 디코딩해서 저장
        */
        socket.on('sendVideo', async (videoData) => {
          const total = videoData.total;
          const count = videoData.count;
          const fileName = clientHasUUID[socket.id] + '.mp4';
          const filePath = path.join(__dirname, 'public', 'videos', fileName);
          
          // 데이터가 모두 수신되었을 때
          if (videoData.count === videoData.total){
            console.log('[Done] Download Finish!');

            try {
              // Base64 디코딩 후 짜투리 데이터 이어서 저장
              const decodedFile = Buffer.from(videoData.data, 'base64');
              await fs.promises.appendFile(filePath, decodedFile);
              
              console.log('Save Complete : ',filePath);
              
              // 안드로이드에 저장된 비디오 파일 이름(=> 디렉토리 명)과 함께 저장 완료됐다는 메세지 전달
              socket.emit("video save complete", { success: true, fileName: fileName });

              // ML에게 비디오 저장 완료됐으니 모델링 작업 시작해도 된다는 메세지 전달
              io.to(getKeyByValue(who, 'ml')).emit("start modeling", { path: 'data/totoro.MOV' , name: fileName, prompt: videoData.prompt});

              delete clientHasUUID[socket.id];
            } catch (error) {
              console.log('Error while decoding video ',error.message);
            }
          } else {
            // 데이터 수신중
            console.log(`Downloaded... ${(count / total * 100.0).toFixed(2)}%`);

            // 버퍼 용량 문제로 인해 즉시 인코딩 후 덮어쓰기 함
            const decodedFile = Buffer.from(videoData.data, 'base64');
            await fs.promises.appendFile(filePath, decodedFile);
          }
        });

        // 소켓 연결 해제시
        socket.on('disconnect', () => {
            console.log("user disconnected : ",socket.id);
        })
    });
}
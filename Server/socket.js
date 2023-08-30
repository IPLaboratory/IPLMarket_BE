const fs = require('fs');
const path = require('path');
const socketIO = require('socket.io');


module.exports = (server, app) =>{
    const http = require('http').createServer(app);
    const io = socketIO(server, {path:'/socket.io'}, {maxHttpBufferSizke:1e8});
    const fromClientData = {};
    const who = {};

    // 소켓 연결
    io.on('connection', (socket) => {
        console.log("User connect : " + socket.id);
        fromClientData[socket.id] = '';

        setTimeout(() => io.to(socket.id).emit('ml test', {'msg': path.join(__dirname, 'public', 'cake1.jpg'), 'job_id': 'totoro', 'prompt':'a totoro figure'}), 5000);
 
        // io.to(socket.id).emit('ml test', {'msg': path.join(__dirname, 'public', 'cake1.jpg'), 'job_id': 'totoro'})

        socket.on('client registration', (data) => {
          who[socket.id] = data['device'];
          console.log(`[${new Date().toLocaleString()}]: socket ID: ${socket.id} : ${who[socket.id]}`)
        })

        socket.on('ml message', (data) => {
          console.log(data);
        })

        // io.to(socket.id).emit('test', '...');

        // 클라이언트에서 obj 파일 달라는 이벤트 수신시
        // socket.on('connectReceive', (data) => {
        //     console.log(data);

        //     const filePath = path.join(__dirname, 'public', 'mesh.obj');
        //     console.log(filePath);

        //     fs.readFile(filePath, (err, fileContent) => {
        //       if (err){
        //         console.log(err);
        //       } else {

        //         // Base64 파일 인코딩
        //         let base64File = fileContent.toString('base64');
        //         socket.emit("testFile", {success: true, base64File});
        //       }
        //     })            
        // });

        /* 안드로이드에서 Base64 인코딩된 비디오 파일 분할 전송
         * 수신하여 합친 후 디코딩해서 저장
        */
        socket.on('sendVideo', async (videoData) => {
          const total = videoData.total;
          const count = videoData.count;
          
          // 데이터가 모두 수신되었을 때
          if (videoData.count === videoData.total){
            fromClientData[socket.id] += videoData.data; // 짜투리 데이터
            console.log(`[Done] Length : ${fromClientData[socket.id].length}`);

            try {
              // Base64 디코딩
              const decodedFile = Buffer.from(fromClientData[socket.id], 'base64');
              const fileName = uuid.v4() + '.mp4';
              const filePath = path.join(__dirname, 'public', 'videos', fileName);

              // 파일 저장
              await fs.promises.writeFile(filePath, decodedFile);
                
              console.log('Save Complete : ',filePath);

              socket.emit("video save complete", { success: true, fileName: fileName });
              socket.emit("start modeling", { path: 'data/totoro.MOV' , name: fileName, prompt: videoData.prompt});
            } catch (error) {
              console.log('Error while decoding video ',error.message);
            }
          } else {
            // 데이터 수신중
            console.log(`Downloaded... ${(count / total * 100.0).toFixed(2)}%`);
            fromClientData[socket.id] += videoData.data;
          }
        });

        // 소켓 연결 해제시
        socket.on('disconnect', () => {
            console.log("user disconnected");
            delete fromClientData[socket.id];
        })
    });
}